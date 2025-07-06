import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import {
  bufferCount,
  catchError,
  concatMap,
  delay,
  delayWhen,
  finalize,
  from,
  fromEvent,
  lastValueFrom,
  map,
  mergeMap,
  of,
  retry,
  timer,
  toArray,
} from 'rxjs';
import { Readable } from 'stream';
import * as StreamArray from 'stream-json/streamers/StreamArray';

import { BulkDataItems } from './models/bulk';
import { Prisma, PrismaService } from '@multiverse-library/prisma-client';
import { ScryfallCard } from './models/card';
import { ScryfallPrints } from './models/prints';

@Injectable()
export class ScryfallService {
  private readonly scryfallApiUrl: string;
  private readonly logger = new Logger(ScryfallService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
    private readonly prisma: PrismaService
  ) {
    this.scryfallApiUrl = this.configService.get<string>('SCRYFALL_API_URL')!;
  }

  // Gets the newest bulk data URIs from the Scryfall API.
  fetchBulkUris() {
    return this.http
      .get(`${this.scryfallApiUrl}/bulk-data`)
      .pipe(map((res: AxiosResponse<BulkDataItems>) => res.data.data));
  }

  createBulkUri(data: Prisma.BulkUrlCreateInput) {
    return this.prisma.bulkUrl.create({
      data,
    });
  }

  // Gets all bulk data URIs from the DB.
  bulkUris(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BulkUrlWhereUniqueInput;
    where?: Prisma.BulkUrlWhereInput;
    orderBy?: Prisma.BulkUrlOrderByWithRelationInput;
  }) {
    return this.prisma.bulkUrl.findMany(params);
  }

  /**
   * Queries the Scryfall API for the list of prints from a card'ss `printsSearchUri`.
   * Writes the oldest available image URI for each card face into the DB.
   */
  async fetchCardImages() {
    const pageSize = 100;
    let lastId = 0;
    let page: { id: number; printsSearchUri: string; isDoubleFaced: boolean }[];

    do {
      page = await this.prisma.card.findMany({
        where: { id: { gt: lastId } },
        orderBy: { id: 'asc' },
        take: pageSize,
        select: { id: true, printsSearchUri: true, isDoubleFaced: true },
      });

      if (page.length === 0) break;

      this.logger.log(
        `Fetched ${page.length} cards (lastId=${page[page.length - 1].id})`
      );

      // For concurrency-limited HTTP+DB updates:
      //   - turn the page into an Observable stream
      //   - mergeMap with concurrency = 5
      //   - toArray() to await the entire batch
      await lastValueFrom(
        from(page).pipe(
          mergeMap(
            (card) =>
              this.fetchAndSaveCardFaces(
                card.id,
                card.printsSearchUri,
                card.isDoubleFaced
              ),
            5
          ),
          catchError((err) => {
            this.logger.error('Error enriching a card', err.stack);
            return [];
          }),
          toArray()
        )
      );

      lastId = page[page.length - 1].id;
    } while (page.length === pageSize);
  }

  /**
   * Fetch the printsSearchUri, pick the last (oldest) element in the returned
   * array, grab its card faces' image_uris.small, and update the DB.
   */
  private fetchAndSaveCardFaces(
    cardId: number,
    printsSearchUri: string,
    isDfc: boolean
  ) {
    // Delay to not blast the Scryfall API too much
    const delay = 300;
    return of(null).pipe(
      delayWhen(() => timer(delay)),
      mergeMap(() => this.http.get(printsSearchUri)),
      map((res: AxiosResponse<ScryfallPrints>) => {
        const arr = res.data.data;
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('Empty printsSearchUri response');
        }
        return arr[arr.length - 1];
      }),
      mergeMap((lastPrint) => {
        if (isDfc) {
          const faces = lastPrint.card_faces;
          if (
            !faces ||
            !Array.isArray(faces) ||
            !faces[0].image_uris?.normal ||
            !faces[1].image_uris?.normal
          ) {
            this.prisma.card.delete({ where: { id: cardId } });
            return of(null);
          }

          const frontFaceImg = faces[0].image_uris.normal;
          const backFaceImg = faces[1].image_uris.normal;
          return from(
            this.prisma.card.update({
              where: { id: cardId },
              data: { frontFaceImg, backFaceImg },
            })
          );
        } else {
          const uris = lastPrint.image_uris;
          if (!uris || !uris.normal) {
            throw new Error(
              `Unexpected card_faces format on print ${JSON.stringify(
                lastPrint
              )}: (isDfc: ${isDfc})`
            );
          }

          const frontFaceImg = uris.normal;
          return from(
            this.prisma.card.update({
              where: { id: cardId },
              data: { frontFaceImg },
            })
          );
        }
      }),
      catchError((err) => {
        console.error(`Error (url: ${printsSearchUri})`, err.stack);
        throw err;
      })
    );
  }

  /**
   * Streams the newest bulk data JSON (around 500 MB) from the Scryfall API,
   * buffers the items into chunks and does batched inserts via
   * `createMany` and `skipDuplicates`.
   */
  fetchAndStreamCards(bulkDataUri: string) {
    return this.http
      .get<Readable>(bulkDataUri, { responseType: 'stream' })
      .pipe(
        // Extract the raw response stream and pipe it into a StreamArray parser
        mergeMap((res: AxiosResponse<Readable>) => {
          const parser = res.data.pipe(StreamArray.withParser());

          // Turn each parser 'data' event into an observable emission of `value`.
          return fromEvent(parser, 'data').pipe(map((d: any) => d.value));
        }),
        // Gather into batches of 100
        bufferCount(100),

        // Process one batch at a time
        concatMap((batch: ScryfallCard[]) =>
          of(batch).pipe(
            mergeMap((items) => {
              const data = items
                .filter((card) => card.set_type !== 'token')
                .map((card) => this.mapToScryfall(card));
              return this.prisma.card.createMany({
                data,
                skipDuplicates: true,
              });
            }),
            retry({
              count: 2,
              delay: (err, retryCount) => {
                const backoff = 1000 * Math.pow(2, retryCount - 1);
                this.logger.warn(
                  `Batch failed (attempt ${
                    retryCount + 1
                  }, error ${err}). Retrying in ${backoff}ms.`
                );
                return timer(backoff);
              },
            }),
            catchError((err) => {
              this.logger.error(
                `Failed to upsert batch of ${batch.length} items`,
                err.stack
              );
              throw err;
            }),
            delay(500)
          )
        ),
        finalize(() => {
          this.logger.log('Streaming complete');
        })
      )
      .subscribe({
        next: (result) => {
          if (result && typeof result.count === 'number') {
            this.logger.log(`Upserted ${result.count} items in batch.`);
          }
        },
        error: (err) =>
          this.logger.error('Fatal error in JSON stream processing:', err),
        complete: () => this.logger.log('Stream subscription complete'),
      });
  }

  private mapToScryfall(card: ScryfallCard) {
    return {
      name: card.name,
      scryfallId: card.id,
      isDoubleFaced: !!card.card_faces?.length,
      printsSearchUri: card.prints_search_uri,
    };
  }
}

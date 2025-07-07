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

import { Prisma, PrismaService } from '@multiverse-library/prisma-client';
import { BulkDataItems } from './models/bulk';
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

  // Writes a bulk data URI to the DB.
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
            mergeMap((cards) => {
              const data = cards
                .filter((card) => this.isActualMagicCard(card))
                .map((card) => this.mapFromScryfallToPrisma(card));
              return this.prisma.card.createMany({
                data,
                skipDuplicates: true,
              });
            }),
            // Retry failed batches twice after 1000 and 2000 ms.
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
            // Delay of 500ms between transactions to not overwhelm DB.
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

  /**
   * Queries the Scryfall API for the list of prints from a card's `printsSearchUri`.
   * Writes the oldest available (e.g., the original) image URI for each card face into the DB.
   */
  async fetchCardsForEnrichment() {
    const numCardsInDb = await this.prisma.card.count();
    this.logger.log(
      `Starting card image enrichment for ${numCardsInDb} cards.`
    );

    // Work in batches of 100 images
    const pageSize = 100;
    let lastId = 0;

    // NOTE: The type is manually defined like this since Partial<Card> doesn't work
    // with the `prisma.card.findMany` invocation. It's not nice though.
    let page: { id: number; printsSearchUri: string; isDoubleFaced: boolean }[];

    do {
      // Find the next 100 cards, only select strictly necessary fields
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
              this.enrichCardImages(
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
  private enrichCardImages(
    cardId: number,
    printsSearchUri: string,
    isDfc: boolean
  ) {
    // 300 Millisecond delay to not blast the Scryfall API too much
    const delay = 300;

    return of(null).pipe(
      delayWhen(() => timer(delay)),
      mergeMap(() => this.http.get(printsSearchUri)),
      map((res: AxiosResponse<ScryfallPrints>) => {
        // Get the array of prints from the response
        const prints = res.data.data;

        // Fail open if the response has no print data
        if (!Array.isArray(prints) || prints.length === 0) {
          const errorMsg = `Empty prints data response for card with ID ${cardId}`;
          this.logger.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Return print data for the oldest image available
        return prints[prints.length - 1];
      }),
      mergeMap((oldestPrint: ScryfallCard) => {
        if (isDfc) {
          const faces = oldestPrint.card_faces || [];
          if (
            faces.length !== 2 ||
            !faces[0].image_uris?.normal ||
            !faces[1].image_uris?.normal
          ) {
            this.logger.warn(
              `Could not find faces for card ${oldestPrint.name}.`
            );
            this.logger.warn(
              `Assuming it's a token or otherwise non-standalone card, deleting it from the DB.`
            );
            return from(
              this.prisma.card.delete({
                where: { id: cardId },
                select: { id: true },
              })
            );
          }

          const frontFaceImg = faces[0].image_uris.normal;
          const backFaceImg = faces[1].image_uris.normal;
          return from(
            this.prisma.card.update({
              where: { id: cardId },
              data: { frontFaceImg, backFaceImg },
              select: { id: true },
            })
          );
        } else {
          const uri = oldestPrint.image_uris?.normal;
          if (!uri) {
            const errorMsg = `Could not find image URIs or normal size URI didn't exist for card ${oldestPrint.name}.`;
            this.logger.error(errorMsg);
            throw new Error(errorMsg);
          }

          return from(
            this.prisma.card.update({
              where: { id: cardId },
              data: { frontFaceImg: uri },
              select: { id: true },
            })
          );
        }
      }),
      catchError((err) => {
        this.logger.error(`Error (url: ${printsSearchUri})`, err.stack);
        throw err;
      })
    );
  }

  // Maps a Scryfall card object into a database-friendly type to create a card.
  private mapFromScryfallToPrisma(card: ScryfallCard): Prisma.CardCreateInput {
    let isDoubleFaced = false;
    // A card is double-faced if it has exactly two card faces that each have their own image URI.
    if (card.card_faces) {
      const actualFaces = card.card_faces.filter(
        (cardFace) => !!cardFace.image_uris
      );
      if (actualFaces.length === 2) isDoubleFaced = true;
    }
    return {
      name: card.name,
      scryfallId: card.id,
      isDoubleFaced,
      printsSearchUri: card.prints_search_uri,
    };
  }

  private isActualMagicCard(card: ScryfallCard): boolean {
    return (
      card.set_type !== 'token' &&
      card.set_type !== 'memorabilia' &&
      card.set_type !== 'funny' &&
      card.layout !== 'emblem' &&
      card.layout !== 'planar' &&
      card.layout !== 'scheme' &&
      card.layout !== 'vanguard' &&
      card.oversized === false
    );
  }
}

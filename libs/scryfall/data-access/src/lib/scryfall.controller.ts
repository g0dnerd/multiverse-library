import { Controller, Get, HttpException, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { map, mergeMap } from 'rxjs';

import { BulkDataType } from '@library/prisma-client';
import { ScryfallService } from './scryfall.service';
import { BulkData, BulkDataType as ScryfallBulkDataType } from './models/bulk';

@Controller('scryfall')
@ApiTags('scryfall')
export class ScryfallController {
  constructor(private readonly scryfallService: ScryfallService) {}

  /**
   * Scryfall Bulk Data URIs are ephemeral and thus need to be fetched programatically.
   * (https://scryfall.com/docs/api/bulk-data)
   * This does so and saves the link for the 'oracle_cards' bulk data set in the DB.
   * This set contains each card on Scryfall once and in one language, which is what we want.
   */
  @Post('update-bulk-uri')
  updateScryfallBulkUri() {
    // Fetch all bulk URIs
    return this.scryfallService.fetchBulkUris().pipe(
      map((uris: BulkData[]) => {
        // Take only the 'oracle_cards' URI
        const oracleCardUri = uris.find(
          (uri) => uri.type === ScryfallBulkDataType.OracleCards
        );
        if (!oracleCardUri) {
          throw new HttpException(
            'Could not find oracle_cards bulk data uri',
            500
          );
        }
        return oracleCardUri;
      }),
      // Let the service write the URI to DB.
      mergeMap((oracleCards) =>
        this.scryfallService.createBulkUri({
          bulkDataType: BulkDataType.ORACLE_CARDS,
          url: oracleCards.download_uri,
        })
      )
    );
  }

  @Get('bulk-uri')
  @ApiOkResponse({ type: String })
  async getBulkUri() {
    const [uri] = await this.scryfallService.bulkUris({
      take: 1,
      where: { bulkDataType: BulkDataType.ORACLE_CARDS },
      orderBy: { updatedAt: 'desc' },
    });
    return uri;
  }

  @Post('sync-cards')
  async syncScryfallBulk() {
    const currentBulkUri = await this.getBulkUri();
    this.scryfallService.fetchAndStreamCards(currentBulkUri.url);
  }

  @Post('enrich-card-images')
  enrichCardImages() {
    this.scryfallService.fetchCardsForEnrichment();
  }
}

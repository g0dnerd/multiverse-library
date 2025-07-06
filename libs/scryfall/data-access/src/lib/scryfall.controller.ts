import { Controller, Get, HttpException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { map, mergeMap } from 'rxjs';

import { ScryfallService } from './scryfall.service';
import { BulkDataType as ScryfallBulkDataType } from './models/bulk';
import { BulkDataType } from '@multiverse-library/prisma-client';

@Controller('scryfall')
@ApiTags('scryfall')
export class ScryfallController {
  constructor(private readonly scryfallService: ScryfallService) {}

  @Post('update-bulk-uri')
  updateScryfallBulkUri() {
    return this.scryfallService.fetchBulkUris().pipe(
      map((uris) => {
        const oracleCardUri = uris.find(
          (u) => u.type === ScryfallBulkDataType.OracleCards
        );
        if (!oracleCardUri) {
          throw new HttpException(
            'Could not find oracle_cards bulk data uri',
            500
          );
        }
        return oracleCardUri;
      }),
      mergeMap((oracleCards) =>
        this.scryfallService.createBulkUri({
          bulkDataType: BulkDataType.ORACLE_CARDS,
          url: oracleCards.download_uri,
        })
      )
    );
  }

  @Get('bulk-uri')
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
    this.scryfallService.fetchCardImages();
  }
}

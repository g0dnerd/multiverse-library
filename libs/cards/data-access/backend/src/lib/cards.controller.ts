import {
  Controller,
  Get,
  Inject,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';

import { CardEntity } from '@multiverse-library/cards/data-access';
import { CardsService } from './cards.service';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  private readonly ttl = 24 * 60 * 60 * 1000;
  constructor(
    private readonly cardsService: CardsService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  @Get('by-keyword')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  async getCardsByKeyword(
    @Query('keywords', new ParseArrayPipe({ items: String, separator: ',' }))
    keywords: string[]
  ) {
    const cacheKey = 'kw' + keywords.join();
    let data = await this.cache.get<CardEntity[]>(cacheKey);

    if (!data) {
      data = await this.cardsService.cards({
        where: {
          keywords: {
            hasEvery: keywords,
          },
        },
        take: 20,
        select: {
          name: true,
          isDoubleFaced: true,
          frontFaceImg: true,
          backFaceImg: true,
          keywords: true,
        },
      });
      await this.cache.set<CardEntity[]>(cacheKey, data, this.ttl);
    }

    return data;
  }

  @Get('random/:amount')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getRandomCard(@Param('amount', ParseIntPipe) amount: number) {
    return this.cardsService.random(amount);
  }

  @Get('search/:searchString')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  async getFilteredCards(@Param('searchString') searchString: string) {
    const cacheKey = 'name-' + searchString;
    let data = await this.cache.get<CardEntity[]>(cacheKey);

    if (!data) {
      data = await this.cardsService.cards({
        where: {
          name: {
            contains: searchString,
          },
        },
        select: {
          name: true,
          isDoubleFaced: true,
          frontFaceImg: true,
          backFaceImg: true,
          keywords: true,
        },
      });
      await this.cache.set<CardEntity[]>(cacheKey, data, this.ttl);
    }

    return data;
  }

  @Get(':id')
  @ApiOkResponse({ type: CardEntity })
  async getCardById(@Param('id', ParseIntPipe) id: number) {
    const cacheKey = 'id-' + id;
    let data = await this.cache.get<CardEntity>(cacheKey);

    if (!data) {
      const res = await this.cardsService.card({ id });
      if (res) {
        data = res;
        await this.cache.set<CardEntity>(cacheKey, data, this.ttl);
      }
    }
    return data;
  }
}

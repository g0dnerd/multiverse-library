import {
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CardEntity } from '@multiverse-library/cards/data-access';
import { CardsService } from './cards.service';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /**
   * Allows any number of query filters and finds all cards that meet all of them.
   */
  @Get('search')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  async getCardsBySearchQuery(
    @Query('backwards', ParseBoolPipe) backwards: boolean,
    @Query(
      'keywords',
      new ParseArrayPipe({ items: String, separator: ',', optional: true })
    )
    keywords?: string[],
    @Query('mana-value-min', new ParseIntPipe({ optional: true }))
    manaValueMin?: number,
    @Query('mana-value-max', new ParseIntPipe({ optional: true }))
    manaValueMax?: number,
    @Query('cursor', new ParseIntPipe({ optional: true })) cursorId?: number
  ) {
    const keywordKey = keywords ? `-keywords${keywords.join()}` : '';
    const mvMinKey = manaValueMin ? `-mvMin${manaValueMin}` : '';
    const mvMaxKey = manaValueMax ? `-mvMax${manaValueMax}` : '';

    let cacheKey = 'cards-query-';
    cacheKey += backwards ? 'b-' : 'f-';
    cacheKey += cursorId ? `${cursorId}` : '-1';
    cacheKey += keywordKey;
    cacheKey += mvMinKey;
    cacheKey += mvMaxKey;

    const skip = cursorId ? 1 : undefined;
    const cursor = cursorId ? { id: cursorId } : undefined;

    return this.cardsService.query(
      cacheKey,
      backwards,
      skip,
      cursor,
      keywords,
      manaValueMin,
      manaValueMax
    );
  }

  @Get('by-keyword')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  async getCardsByKeyword(
    @Query('keywords', new ParseArrayPipe({ items: String, separator: ',' }))
    keywords: string[],
    @Query('backwards', ParseBoolPipe) backwards: boolean,
    @Query('cursor', new ParseIntPipe({ optional: true })) cursorId?: number
  ) {
    const cacheKey = `cards-byKeyword-${backwards ? 'b' : 'f'}-${
      cursorId ? cursorId : '-1'
    }-${keywords.join()}`;
    const skip = cursorId ? 1 : undefined;
    const cursor = cursorId ? { id: cursorId } : undefined;

    return this.cardsService.cards(
      {
        where: {
          keywords: {
            hasEvery: keywords,
          },
        },
        take: backwards ? -16 : 16,
        skip,
        cursor,
        select: {
          id: true,
          name: true,
          isDoubleFaced: true,
          frontFaceImg: true,
          backFaceImg: true,
          keywords: true,
        },
        orderBy: { id: 'asc' },
      },
      cacheKey
    );
  }

  @Get('random/:amount')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getRandomCard(@Param('amount', ParseIntPipe) amount: number) {
    return this.cardsService.random(amount);
  }

  @Get('search/:searchString')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getFilteredCards(@Param('searchString') searchString: string) {
    const cacheKey = `card-byName-${searchString.replace(' ', '')}`;
    return this.cardsService.cards(
      {
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
      },
      cacheKey
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: CardEntity })
  getCardById(@Param('id', ParseIntPipe) id: number) {
    const cacheKey = `card-byId-${id}`;
    return this.cardsService.card({ id }, cacheKey);
  }
}

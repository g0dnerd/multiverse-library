import {
  Controller,
  Get,
  Param,
  ParseArrayPipe,
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

  @Get('by-keyword')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getCardsByKeyword(
    @Query('keywords', new ParseArrayPipe({ items: String, separator: ',' }))
    keywords: string[]
  ) {
    const cacheKey = `cards-byKeyword-${keywords.join()}`;
    return this.cardsService.cards(
      {
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

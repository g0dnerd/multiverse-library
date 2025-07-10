import {
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CardEntity } from '@multiverse-library/cards/data-access';
import { CardsService } from './cards.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('random/:amount')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getRandomCard(@Param('amount', ParseIntPipe) amount: number) {
    return this.cardsService.random(amount);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('search/:searchString')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getFilteredCards(@Param('searchString') searchString: string) {
    return this.cardsService.cards({
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
      },
    });
  }

  @UseInterceptors(CacheInterceptor)
  @Get('by-keyword')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getCardsByKeyword(
    @Query('keywords', new ParseArrayPipe({ items: String, separator: ',' }))
    keywords: string[]
  ) {
    return this.cardsService.cards({
      where: {
        keywords: {
          hasEvery: keywords,
        },
      },
      select: {
        name: true,
        isDoubleFaced: true,
        frontFaceImg: true,
        backFaceImg: true,
      },
    });
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  @ApiOkResponse({ type: CardEntity })
  getCardById(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.card({ id });
  }
}

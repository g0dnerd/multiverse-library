import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CardEntity } from '@multiverse-library/cards/data-access';
import { CardsService } from './cards.service';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('random/:amount')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getRandomCard(@Param('amount', ParseIntPipe) amount: number) {
    return this.cardsService.random(amount);
  }

  @Get(':id')
  @ApiOkResponse({ type: CardEntity })
  getCardById(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.card({ id });
  }

  @Get(':searchString')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getFilteredCards(@Param('searchString') searchString: string) {
    return this.cardsService.cards({
      where: {
        name: {
          contains: searchString,
        },
      },
    });
  }
}

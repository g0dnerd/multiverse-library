import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CardsService } from './cards.service';
import { CardEntity } from './models/card.entity';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('random/:amount')
  @ApiOkResponse({ type: CardEntity, isArray: true })
  getRandomCard(@Param('amount', ParseIntPipe) amount: number) {
    return this.cardsService.random(amount);
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

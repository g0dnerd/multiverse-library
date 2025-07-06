import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CardsService } from './cards.service';

@Controller('cards')
@ApiTags('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  getCards() {
    return this.cardsService.cards({ take: 20 });
  }

  @Get(':searchString')
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

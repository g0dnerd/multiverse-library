import { Controller, Get, Param } from '@nestjs/common';

import { CardsService } from '@multiverse-library/cards/data-access';

@Controller()
export class AppController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('cards')
  getCards() {
    return this.cardsService.cards({});
  }

  @Get('cards/:searchString')
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

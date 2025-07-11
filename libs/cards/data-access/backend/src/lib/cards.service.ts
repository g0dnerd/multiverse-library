import { Injectable } from '@nestjs/common';

import { PrismaService, Prisma } from '@library/prisma-client';
import { shuffle } from './shuffle';
import { CardEntity } from '@multiverse-library/cards/data-access';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  card(where: Prisma.CardWhereUniqueInput) {
    return this.prisma.card.findUnique({ where });
  }

  // Generic getter that can be wrapped in the service or the controller.
  cards(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CardWhereUniqueInput;
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
    select?: Prisma.CardSelect;
  }): Promise<CardEntity[]> {
    return this.prisma.card.findMany(params);
  }

  // Returns the specified number of random cards
  async random(amount: number) {
    // NOTE: For our DB of ~35k cards, loading all into memory is still cheap enough,
    // since they are also indexed by ID.
    const allCards = await this.prisma.card.findMany({
      select: { id: true },
    });
    const ids = allCards.map((card) => card.id);

    const picked = shuffle(ids).slice(0, amount);

    return this.prisma.card.findMany({ where: { id: { in: picked } } });
  }
}

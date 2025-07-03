import { Injectable } from '@nestjs/common';

import { PrismaService, Card, Prisma } from '@multiverse-library/prisma-client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  cards(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CardWhereUniqueInput;
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
  }): Promise<Card[]> {
    return this.prisma.card.findMany(params);
  }
}

import { Injectable } from '@nestjs/common';

import { PrismaService, Prisma } from '@multiverse-library/prisma-client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  // Generic getter that can be wrapped in the service or the controller.
  cards(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CardWhereUniqueInput;
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
  }) {
    return this.prisma.card.findMany(params);
  }
}

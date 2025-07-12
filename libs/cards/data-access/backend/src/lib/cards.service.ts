import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { PrismaService, Prisma } from '@library/prisma-client';
import { CardEntity } from '@multiverse-library/cards/data-access';
import { shuffle } from './shuffle';

@Injectable()
export class CardsService {
  private readonly ttl = 24 * 60 * 60 * 1000;
  private readonly logger = new Logger(CardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  async card(where: Prisma.CardWhereUniqueInput, cacheKey?: string) {
    if (!cacheKey) {
      return this.prisma.card.findUnique({ where });
    }
    const cachedCard = await this.cache.get<CardEntity>(cacheKey);
    if (cachedCard) {
      this.logger.log(`Found data in cache for ${cacheKey}.`);
      return cachedCard;
    }

    this.logger.log(`Nothing in cache for ${cacheKey}, setting.`);
    const card = await this.prisma.card.findUnique({ where });
    await this.cache.set(cacheKey, card, this.ttl);

    return card;
  }

  // Generic getter that can be wrapped in the service or the controller.
  async cards(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.CardWhereUniqueInput;
      where?: Prisma.CardWhereInput;
      orderBy?: Prisma.CardOrderByWithRelationInput;
      select?: Prisma.CardSelect;
    },
    cacheKey?: string
  ): Promise<{ cards: CardEntity[]; cursor?: number; count: number }> {
    const count = await this.prisma.card.count({ where: params.where });

    if (!cacheKey) {
      const cards = await this.prisma.card.findMany(params);
      return {
        cards,
        cursor: cards[cards.length - 1].id,
        count,
      };
    }

    const cachedCards = await this.cache.get<CardEntity[]>(cacheKey);
    if (cachedCards) {
      this.logger.log(`Found data in cache for ${cacheKey}.`);
      const cursor = cachedCards[cachedCards.length - 1].id;
      return {
        cards: cachedCards,
        cursor,
        count,
      };
    }

    this.logger.log(`Nothing in cache for ${cacheKey}, setting.`);
    const cards = await this.prisma.card.findMany(params);
    await this.cache.set(cacheKey, cards, this.ttl);

    if (params.take && count <= params.take) {
      return { cards, count };
    }

    const cursor = cards[cards.length - 1].id;
    return { cards, cursor, count };
  }

  // Returns the specified number of random cards
  async random(amount: number) {
    // NOTE: For our DB of ~35k cards, loading all into memory is still cheap enough,
    // since they are also indexed by ID.
    const allCards = await this.cards({
      select: { id: true },
    });

    const cards = allCards.cards;
    const ids = cards.map((card) => card.id);

    const picked = shuffle(ids).slice(0, amount);

    return this.prisma.card.findMany({ where: { id: { in: picked } } });
  }
}

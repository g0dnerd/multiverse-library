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
    params: Prisma.CardFindManyArgs,
    cacheKey?: string
  ): Promise<{ cards: CardEntity[]; cursor?: number; count: number }> {
    const count = await this.prisma.card.count({ where: params.where });
    let cards: CardEntity[];

    if (!cacheKey) {
      cards = await this.prisma.card.findMany(params);
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

    this.logger.log(`Found no cached data for ${cacheKey}, setting it.`);
    cards = await this.prisma.card.findMany(params);
    await this.cache.set(cacheKey, cards, this.ttl);

    if (params.take && count <= params.take) {
      return { cards, count };
    }

    const cursor = cards[cards.length - 1].id;
    return { cards, cursor, count };
  }

  query(
    cacheKey: string,
    backwards: boolean,
    skip?: number,
    cursor?: Prisma.CardWhereUniqueInput,
    kw?: string[],
    manaValueMin?: number,
    manaValueMax?: number
  ) {
    if (kw) kw = kw.map((k) => k.toLowerCase());
    const keywords = kw ? { hasEvery: kw } : undefined;
    const manaValue =
      manaValueMin || manaValueMax
        ? { gt: manaValueMin, lt: manaValueMax }
        : undefined;
    const params: Prisma.CardFindManyArgs = {
      where: {
        keywords,
        manaValue,
      },
      select: {
        id: true,
        name: true,
        isDoubleFaced: true,
        frontFaceImg: true,
        backFaceImg: true,
        keywords: true,
      },
      orderBy: { id: 'asc' },
      take: backwards ? -16 : 16,
      skip,
      cursor,
    };

    this.logger.log('Query with params', JSON.stringify(params));

    return this.cards(params, cacheKey);
  }

  // Returns the specified number of random cards
  async random(amount: number) {
    // NOTE: For our DB of ~35k cards, loading all into memory is still cheap enough,
    // since they are also indexed by ID.
    const allCardsRes = await this.cards({
      select: { id: true },
    });

    const allCards = allCardsRes.cards;
    const ids = allCards.map((card) => card.id);

    const picked = shuffle(ids).slice(0, amount);

    const cards = await this.prisma.card.findMany({
      where: { id: { in: picked } },
    });
    return {
      cards,
    };
  }
}

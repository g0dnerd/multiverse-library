import { Module } from '@nestjs/common';

import { PrismaClientModule } from '@library/prisma-client';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CacheModule } from '@library/core/cache';

@Module({
  imports: [PrismaClientModule, CacheModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardDataAccessModule {}

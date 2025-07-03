import { Module } from '@nestjs/common';

import { PrismaClientModule } from '@multiverse-library/prisma-client';
import { CardsService } from './cards.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardDataAccessModule {}

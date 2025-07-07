import { Module } from '@nestjs/common';

import { PrismaClientModule } from '@multiverse-library/prisma-client';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [PrismaClientModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardDataAccessModule {}

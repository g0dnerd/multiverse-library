import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaClientModule } from '@library/prisma-client';
import { ScryfallController } from './scryfall.controller';
import { ScryfallService } from './scryfall.service';

@Module({
  imports: [ConfigModule, HttpModule, PrismaClientModule],
  controllers: [ScryfallController],
  providers: [ScryfallService],
  exports: [ScryfallService],
})
export class ScryfallModule {}

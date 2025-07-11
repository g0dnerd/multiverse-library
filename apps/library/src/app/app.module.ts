import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CardDataAccessModule } from '@library/cards/data-access';
import { ScryfallModule } from '@library/scryfall/data-access';
import { CacheModule } from '@library/core/cache';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CardDataAccessModule,
    ScryfallModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

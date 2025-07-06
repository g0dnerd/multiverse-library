import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CardDataAccessModule } from '@multiverse-library/data-access-cards';
import { ScryfallModule } from '@multiverse-library/data-access-scryfall';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CardDataAccessModule,
    ScryfallModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

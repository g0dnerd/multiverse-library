import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CardDataAccessModule } from '@multiverse-library/cards/data-access';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CardDataAccessModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

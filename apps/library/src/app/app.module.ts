import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

import { CardDataAccessModule } from '@library/cards/data-access';
import { ScryfallModule } from '@library/scryfall/data-access';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CardDataAccessModule,
    ScryfallModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        return {
          stores: [createKeyv(redisUrl)],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

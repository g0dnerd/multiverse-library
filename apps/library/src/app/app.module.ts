import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

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
        const host = configService.get<string>('REDIS_HOST');
        const port = parseInt(configService.get<string>('REDIS_PORT')!, 10);
        const username = configService.get<string>('REDIS_USERNAME');
        const password = configService.get<string>('REDIS_PASSWORD');
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: '24h' }),
            }),
            createKeyv(`redis://${username}:${password}@${host}:${port}`),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

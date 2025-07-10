import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
const redisStore = require('cache-manager-redis-store').redisStore;

import { CardDataAccessModule } from '@library/cards/data-access';
import { ScryfallModule } from '@library/scryfall/data-access';
import { AppController } from './app.controller';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<CacheModuleOptions> => {
        const host = configService.get<string>('REDIS_HOST');
        const port = parseInt(configService.get<string>('REDIS_PORT'), 10);

        const store = await redisStore({
          socket: {
            host,
            port,
          },
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });
        return {
          store: () => store,
          ttl: 5000,
        };
      },
    }),
    CardDataAccessModule,
    ScryfallModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

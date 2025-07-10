import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { PrismaClientModule } from '@library/prisma-client';
import { ScryfallController } from './scryfall.controller';
import { ScryfallService } from './scryfall.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    PrismaClientModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: parseInt(configService.get<string>('REDIS_PORT')!, 10),
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
  ],
  controllers: [ScryfallController],
  providers: [ScryfallService],
  exports: [ScryfallService],
})
export class ScryfallModule {}

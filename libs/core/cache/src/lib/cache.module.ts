import KeyvRedis from '@keyv/redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Keyv from 'keyv';

import { CacheService } from './cache.service';

@Module({
  providers: [
    {
      provide: 'CACHE_INSTANCE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redis = new KeyvRedis(redisUrl);
        return new Keyv({ store: redis, namespace: '' });
      },
    },
  ],
  exports: [CacheService, 'CACHE_INSTANCE'],
})
export class CacheModule {}

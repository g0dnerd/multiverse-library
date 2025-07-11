import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { Cacheable } from 'cacheable';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: 'CACHE_INSTANCE',
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = parseInt(configService.get<string>('REDIS_PORT')!, 10);
        const username = configService.get<string>('REDIS_USERNAME');
        const password = configService.get<string>('REDIS_PASSWORD');

        const secondary = createKeyv(
          `redis://${username}:${password}@${host}:${port}`
        );
        return new Cacheable({ secondary, ttl: '24h' });
      },
    },
  ],
  exports: ['CACHE_INSTANCE'],
})
export class CacheModule {}

import { Inject, Injectable, Logger } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('CACHE_INSTANCE') private readonly cache: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    this.logger.log(`Getting from Redis: ${key}`);
    const value = await this.cache.get<string>(key);
    if (!value) return undefined;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse cache value:', error);
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.logger.log(`Storing in Redis: ${key} =>`, JSON.stringify(value));
    await this.cache.set(key, JSON.stringify(value), ttl);
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Deleting from Redis: ${key}`);
    await this.cache.delete(key);
  }
}

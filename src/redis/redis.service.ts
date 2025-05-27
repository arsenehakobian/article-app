import { Injectable, Inject } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redis: RedisRepository,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

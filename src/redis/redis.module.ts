import { RedisRepository } from './redis.repository';
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'RedisClient',
      useFactory: (configService: ConfigService) => {
        const redisInstance = new Redis({
          host: configService.getOrThrow('REDIS_HOST'),
          port: Number(configService.getOrThrow('REDIS_PORT')),
        });

        redisInstance.on('error', (e: Error) => {
          throw new Error(`Redis connection failed: ${e}`);
        });

        return redisInstance;
      },
      inject: [ConfigService],
    },
    RedisRepository,
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export default class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: string, time?: number): Promise<void> {
    await this.redis.set(key, value);

    if (time) {
      await this.redis.expire(key, time);
    }
  }

  async setJson(key: string, value: unknown, time?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), time);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async pushToQueue(queueName: string, value: string): Promise<void> {
    await this.redis.rpush(queueName, value);
  }

  async readQueue(queueName: string, start = 0, stop = -1): Promise<string[]> {
    return this.redis.lrange(queueName, start, stop);
  }
}

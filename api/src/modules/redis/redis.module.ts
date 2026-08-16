import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as IoredisModule } from '@nestjs-modules/ioredis';
import RedisService from './services/redis.service';

export function buildRedisModuleOptions(configService: ConfigService) {
  const schema = configService.get<string>('redis.schema') || 'redis';
  const host = configService.get<string>('redis.host') || 'atrio_redis';
  const port = configService.get<number>('redis.port') || 6379;

  return {
    type: 'single' as const,
    url: `${schema}://${host}:${port}`,
  };
}

@Module({
  providers: [RedisService],
  imports: [
    ConfigModule,
    IoredisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildRedisModuleOptions,
    }),
  ],
  exports: [IoredisModule, RedisService],
})
export class RedisModule {}

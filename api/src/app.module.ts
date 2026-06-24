import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './configs/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { ConciergeModule } from './modules/concierge/concierge.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { LoggerModule } from './modules/logger/logger.module';
import { QueuesModule } from './modules/queues/queues.module';
import { RedisModule } from './modules/redis/redis.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { S3Module } from './modules/s3/s3.module';
import { ServicesModule } from './modules/services/services.module';
import { SqsModule } from './modules/sqs/sqs.module';
import { StaysModule } from './modules/stays/stays.module';
import { StorageModule } from './modules/storage/storage.module';
import { HttpExceptionFilter } from './modules/utils/exceptions/http.exception.filter';
import { SuccessLoggingInterceptor } from './modules/utils/interceptors/success.logging.interceptor';

export function buildTypeOrmOptions(configService: ConfigService) {
  return {
    type: 'postgres' as const,
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.name'),
    synchronize: false,
    autoLoadEntities: true,
    logging: configService.get<boolean>('database.logging'),
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: buildTypeOrmOptions,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    LoggerModule,
    SqsModule,
    S3Module,
    StorageModule,
    QueuesModule,
    AuthModule,
    StaysModule,
    ExperiencesModule,
    ReservationsModule,
    ServicesModule,
    RequestsModule,
    ConciergeModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessLoggingInterceptor,
    },
  ],
  exports: [TypeOrmModule],
})
export class AppModule {}

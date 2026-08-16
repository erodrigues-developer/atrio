import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Module } from '../s3/s3.module';
import { STORAGE_SERVICE } from './constants/storage.constants';
import { LocalStorageService } from './services/local-storage.service';
import { S3StorageService } from './services/s3-storage.service';
import { StorageService } from './services/storage.service';

export function selectStorageDriver(
  configService: ConfigService,
  localStorageService: LocalStorageService,
  s3StorageService: S3StorageService,
) {
  return configService.get<string>('storage.driver') === 's3'
    ? s3StorageService
    : localStorageService;
}

@Module({
  imports: [ConfigModule, S3Module],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: selectStorageDriver,
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}

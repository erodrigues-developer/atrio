import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/modules/s3/services/s3.service';
import { StorageDriver, UploadFileInput } from './storage.service';

@Injectable()
export class S3StorageService implements StorageDriver {
  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(input: UploadFileInput): Promise<{ key: string; url: string }> {
    const bucket = this.configService.get<string>('aws.s3.bucket') ?? 'atrio-dev';
    await this.s3Service.uploadBinaryFile(input.key, bucket, input.body, input.contentType);

    return {
      key: input.key,
      url: this.s3Service.getPublicUrl(input.key, bucket),
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_SERVICE } from '../constants/storage.constants';

export type UploadFileInput = {
  body: Buffer;
  contentType: string;
  key: string;
};

export type StorageDriver = {
  uploadFile(input: UploadFileInput): Promise<{ key: string; url: string }>;
};

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly driver: StorageDriver,
  ) {}

  async uploadFile(input: UploadFileInput) {
    return this.driver.uploadFile(input);
  }
}

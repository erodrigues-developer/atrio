import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageDriver, UploadFileInput } from './storage.service';

@Injectable()
export class LocalStorageService implements StorageDriver {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile(input: UploadFileInput): Promise<{ key: string; url: string }> {
    const localDirectory = this.configService.get<string>('storage.localDirectory') ?? 'storage';
    const publicBaseUrl = this.configService.get<string>('storage.publicBaseUrl') ?? 'http://localhost:3000/storage';
    const filePath = join(process.cwd(), localDirectory, input.key);
    const fileDirectory = filePath.split('/').slice(0, -1).join('/');

    await mkdir(fileDirectory, { recursive: true });
    await writeFile(filePath, input.body);

    return {
      key: input.key,
      url: `${publicBaseUrl}/${input.key}`,
    };
  }
}

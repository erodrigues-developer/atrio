import { Injectable } from '@nestjs/common';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordService {
  hash(password: string): string {
    const iterations = 120000;
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

    return `pbkdf2_sha512$${iterations}$${salt}$${hash}`;
  }

  verify(password: string, passwordHash: string): boolean {
    const [algorithm, iterationsRaw, salt, expectedHash] = passwordHash.split('$');

    if (algorithm !== 'pbkdf2_sha512' || !iterationsRaw || !salt || !expectedHash) {
      return false;
    }

    const actualHash = pbkdf2Sync(password, salt, Number(iterationsRaw), 64, 'sha512');
    const expected = Buffer.from(expectedHash, 'hex');

    return expected.length === actualHash.length && timingSafeEqual(expected, actualHash);
  }
}

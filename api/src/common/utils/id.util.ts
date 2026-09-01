import { randomUUID } from 'crypto';

export function buildResourceId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
}

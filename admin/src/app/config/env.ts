import { z } from 'zod';

const envSchema = z.object({
  VITE_ATRIO_API_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error('A configuração do ambiente administrativo é inválida.');
}

export const env = Object.freeze({
  apiBaseUrl: parsedEnv.data.VITE_ATRIO_API_URL ?? 'http://localhost:3101/v1',
});

import { z } from 'zod';
import { env } from '@/app/config/env';

export const ADMIN_SESSION_EXPIRED_EVENT = 'atrio-admin-session-expired';
const DEFAULT_TIMEOUT_MS = 15_000;

const apiErrorSchema = z.object({
  error: z.object({
    message: z.string().optional(),
    code: z.string().optional(),
    correlationId: z.string().optional(),
  }).optional(),
});

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function notifySessionExpired(status: number) {
  if (status === 401 || status === 403) {
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EXPIRED_EVENT));
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiClientError('A operação demorou mais que o esperado. Tente novamente.', 0, 'REQUEST_TIMEOUT');
    }

    throw new ApiClientError('Não foi possível conectar ao servidor.', 0, 'NETWORK_ERROR');
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function throwResponseError(response: Response, payload: unknown, fallbackMessage: string): never {
  const parsedError = apiErrorSchema.safeParse(payload);
  const error = parsedError.success ? parsedError.data.error : undefined;
  const correlationId = error?.correlationId ?? response.headers.get('x-correlation-id') ?? undefined;

  notifySessionExpired(response.status);
  throw new ApiClientError(error?.message ?? fallbackMessage, response.status, error?.code, correlationId);
}

export async function apiRequest<T>(path: string, schema: z.ZodType<T>, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throwResponseError(response, payload, 'Não foi possível completar a operação.');
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiClientError('O servidor retornou uma resposta inválida.', response.status, 'INVALID_RESPONSE');
  }

  return result.data;
}

export async function apiUpload<T>(path: string, accessToken: string, file: File, schema: z.ZodType<T>): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: formData,
  }, 30_000);
  const payload = await readJson(response);

  if (!response.ok) {
    throwResponseError(response, payload, 'Não foi possível enviar a mídia.');
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiClientError('O servidor retornou uma resposta inválida.', response.status, 'INVALID_RESPONSE');
  }

  return result.data;
}

export async function downloadFile(path: string, accessToken: string, filename: string) {
  const response = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }, 30_000);

  if (!response.ok) {
    throwResponseError(response, await readJson(response), 'Não foi possível baixar o relatório.');
  }

  const url = window.URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

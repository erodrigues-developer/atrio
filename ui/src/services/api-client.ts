import { API_BASE_URL } from '@/src/services/api-config';
import { clearSession, getAccessToken } from '@/src/stores/session.store';

type ApiErrorDetails = {
  field?: string;
  message: string;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetails[];
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: ApiErrorDetails[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { authenticated?: boolean } = {},
): Promise<T> {
  const authenticated = options.authenticated ?? true;
  const accessToken = authenticated ? getAccessToken() : null;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (authenticated && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await parseJsonResponse<ApiErrorEnvelope>(response);
    const message = payload?.error?.message ?? 'Request failed.';
    const code = payload?.error?.code ?? `HTTP_${response.status}`;
    const details = payload?.error?.details ?? [];

    if (authenticated && response.status === 401) {
      clearSession();
    }

    throw new ApiClientError(message, response.status, code, details);
  }

  const payload = await parseJsonResponse<T>(response);

  if (payload === null) {
    throw new ApiClientError('Empty response body.', response.status, 'EMPTY_RESPONSE');
  }

  return payload;
}

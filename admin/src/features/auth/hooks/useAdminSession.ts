import { useEffect, useState } from 'react';
import { ADMIN_SESSION_EXPIRED_EVENT, type AdminSession } from '../api';
import { adminSessionSchema } from '../session-schema';

const SESSION_STORAGE_KEY = 'atrio-admin-session';

function readStoredSession(): AdminSession | null {
  const rawSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const result = adminSessionSchema.safeParse(JSON.parse(rawSession));

    if (result.success && new Date(result.data.expiresAt).getTime() > Date.now()) {
      return result.data;
    }
  } catch {
    // Invalid persisted data is discarded below.
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  return null;
}

export function clearStoredAdminSession() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(readStoredSession);

  useEffect(() => {
    if (!session) {
      clearStoredAdminSession();
      return;
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    const expireSession = () => {
      clearStoredAdminSession();
      setSession(null);
    };

    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);

    if (!session) {
      return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    }

    const delay = new Date(session.expiresAt).getTime() - Date.now();

    if (!Number.isFinite(delay) || delay <= 0) {
      expireSession();
      return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    }

    const timeout = window.setTimeout(expireSession, delay);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    };
  }, [session]);

  return { session, setSession } as const;
}

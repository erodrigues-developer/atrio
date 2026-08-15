import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'atrio.session.v1';

export type Session = {
  guestId: string;
  guestName: string;
  hotelId: string;
  hotelName?: string;
  isAuthenticated: boolean;
  checkOutTime?: string;
  roomNumber: string;
  stayId: string;
};

export type PendingStayAccess = {
  challengeId?: string;
  expiresAt?: string;
  hotelId?: string;
  lastName: string;
  maskedPhone?: string;
  resendAvailableAt?: string;
  roomNumber: string;
};

let session: Session | null = null;
let pendingStayAccess: PendingStayAccess | null = null;
let accessToken: string | null = null;
let refreshToken: string | null = null;
let hasHydratedSession = false;

const listeners = new Set<() => void>();

type PersistedSessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  session: Session | null;
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function persistSessionState() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const payload: PersistedSessionState = {
    accessToken,
    refreshToken,
    session,
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function hydrateSession() {
  if (hasHydratedSession) {
    return;
  }

  const storage = getStorage();

  if (storage) {
    const rawPayload = storage.getItem(STORAGE_KEY);

    if (rawPayload) {
      try {
        const payload = JSON.parse(rawPayload) as PersistedSessionState;
        session = payload.session;
        accessToken = payload.accessToken;
        refreshToken = payload.refreshToken;
      } catch {
        storage.removeItem(STORAGE_KEY);
      }
    }
  }

  hasHydratedSession = true;
  emitChange();
}

export function getHasHydratedSession() {
  return hasHydratedSession;
}

export function getSession() {
  return session;
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function saveSession(nextSession: Session) {
  session = nextSession;
  persistSessionState();
  emitChange();
}

export function saveAuthTokens(nextAccessToken: string, nextRefreshToken: string) {
  accessToken = nextAccessToken;
  refreshToken = nextRefreshToken;
  persistSessionState();
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function getPendingStayAccess() {
  return pendingStayAccess;
}

export function savePendingStayAccess(nextPendingStayAccess: PendingStayAccess) {
  pendingStayAccess = nextPendingStayAccess;
}

export function clearPendingStayAccess() {
  pendingStayAccess = null;
}

export function clearSession() {
  session = null;
  pendingStayAccess = null;
  accessToken = null;
  refreshToken = null;
  getStorage()?.removeItem(STORAGE_KEY);
  emitChange();
}

export function useSession() {
  return useSyncExternalStore(subscribeToSession, getSession, getSession);
}

export function useHasHydratedSession() {
  return useSyncExternalStore(
    subscribeToSession,
    getHasHydratedSession,
    getHasHydratedSession,
  );
}

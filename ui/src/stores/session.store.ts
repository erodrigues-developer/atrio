import { useSyncExternalStore } from 'react';

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

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
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
  emitChange();
}

export function saveAuthTokens(nextAccessToken: string, nextRefreshToken: string) {
  accessToken = nextAccessToken;
  refreshToken = nextRefreshToken;
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
  emitChange();
}

export function useSession() {
  return useSyncExternalStore(subscribeToSession, getSession, getSession);
}

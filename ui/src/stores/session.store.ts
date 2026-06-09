import { useSyncExternalStore } from 'react';

export type Session = {
  guestId: string;
  guestName: string;
  hotelId: string;
  isAuthenticated: boolean;
  roomNumber: string;
  stayId: string;
};

let session: Session | null = null;

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

export function clearSession() {
  session = null;
  emitChange();
}

export function useSession() {
  return useSyncExternalStore(subscribeToSession, getSession, getSession);
}

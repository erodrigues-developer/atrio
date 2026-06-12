import { useSyncExternalStore } from 'react';

import { reservationsMock, type ReservationItem, type ReservationStatus } from '@/src/mocks/reservations.mock';

export type CreateReservationInput = {
  dateLabel: string;
  experienceId?: string;
  locationLabel?: string;
  status: ReservationStatus;
  time: string;
  timeLabel: string;
  title: string;
};

let reservations: ReservationItem[] = [...reservationsMock];

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function buildReservationId() {
  return `res-${String(reservations.length + 1).padStart(3, '0')}`;
}

export function getReservations() {
  return reservations;
}

export function subscribeToReservations(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function createReservation(input: CreateReservationInput) {
  const nextReservation: ReservationItem = {
    id: buildReservationId(),
    ...input,
  };

  reservations = [nextReservation, ...reservations];
  emitChange();

  return nextReservation;
}

export function useReservations() {
  return useSyncExternalStore(subscribeToReservations, getReservations, getReservations);
}

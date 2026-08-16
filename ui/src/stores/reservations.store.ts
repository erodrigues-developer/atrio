import { useSyncExternalStore } from 'react';

import {
  sortReservations,
  type ReservationItem,
  type ReservationStatus,
} from '@/src/mocks/reservations.mock';
import {
  createReservation as createReservationRequest,
  getReservation,
  listReservations,
  type ReservationItemResponse,
} from '@/src/services/atrio-api';

type ReservationsState = {
  errorMessage: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  items: ReservationItem[];
};

let state: ReservationsState = {
  items: [],
  isLoading: false,
  isLoaded: false,
  errorMessage: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: ReservationsState) {
  state = nextState;
  emitChange();
}

function mapReservationStatus(status: string): ReservationStatus {
  switch (status) {
    case 'requested':
    case 'confirmed':
    case 'in_progress':
    case 'completed':
    case 'cancelled':
      return status;
    default:
      return 'requested';
  }
}

function mapReservation(item: ReservationItemResponse): ReservationItem {
  return {
    id: item.id,
    experienceId: item.experienceId,
    title: item.title,
    status: mapReservationStatus(item.status),
    dateLabel: item.dateLabel,
    timeLabel: item.timeLabel,
    locationLabel: item.locationLabel,
    priceLabel: item.priceLabel,
    scheduledAt: item.scheduledAt,
    note: item.note,
  };
}

function upsertReservation(item: ReservationItem) {
  const nextItems = state.items.filter((currentItem) => currentItem.id !== item.id);
  return sortReservations([item, ...nextItems]);
}

export function getReservationsState() {
  return state;
}

export function subscribeToReservations(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function loadReservations(stayId: string, options: { force?: boolean } = {}) {
  if (state.isLoading || (state.isLoaded && !options.force)) {
    return state.items;
  }

  setState({
    ...state,
    isLoading: true,
    errorMessage: null,
  });

  try {
    const response = await listReservations(stayId);
    const items = sortReservations(response.items.map(mapReservation));

    setState({
      items,
      isLoading: false,
      isLoaded: true,
      errorMessage: null,
    });

    return items;
  } catch (error) {
    setState({
      ...state,
      isLoading: false,
      isLoaded: true,
      errorMessage: error instanceof Error ? error.message : 'Nao foi possivel carregar as reservas.',
    });

    throw error;
  }
}

export async function createReservation(
  stayId: string,
  input: { experienceId: string; slotId: string; scheduledAt: string; partySize: number; note?: string },
) {
  const reservation = mapReservation(await createReservationRequest(stayId, input));

  setState({
    ...state,
    items: upsertReservation(reservation),
    isLoaded: true,
    errorMessage: null,
  });

  return reservation;
}

export async function fetchReservationById(stayId: string, reservationId: string) {
  const existingReservation = state.items.find((item) => item.id === reservationId);

  if (existingReservation) {
    return existingReservation;
  }

  const reservation = mapReservation(await getReservation(stayId, reservationId));

  setState({
    ...state,
    items: upsertReservation(reservation),
    isLoaded: true,
  });

  return reservation;
}

export function useReservations() {
  return useSyncExternalStore(subscribeToReservations, getReservationsState, getReservationsState);
}

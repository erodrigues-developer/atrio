import { useSyncExternalStore } from 'react';

import { requestsMock, type RequestItem, type RequestStatus } from '@/src/mocks/requests.mock';
import type { ServiceType } from '@/src/mocks/services.mock';

export type CreateRequestInput = {
  createdAt: string;
  note: string;
  quantity?: number;
  roomNumber: string;
  status: RequestStatus;
  timeLabel: string;
  title: string;
  type: ServiceType;
};

let requests: RequestItem[] = [...requestsMock];

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function buildRequestId() {
  return `req-${String(requests.length + 1).padStart(3, '0')}`;
}

export function getRequests() {
  return requests;
}

export function subscribeToRequests(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function createRequest(input: CreateRequestInput) {
  const nextRequest: RequestItem = {
    id: buildRequestId(),
    ...input,
  };

  requests = [nextRequest, ...requests];
  emitChange();

  return nextRequest;
}

export function useRequests() {
  return useSyncExternalStore(subscribeToRequests, getRequests, getRequests);
}

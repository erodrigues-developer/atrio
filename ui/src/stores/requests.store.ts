import { useSyncExternalStore } from 'react';

import {
  getRequestDetails,
  type RequestItem,
  type RequestStatus,
  type RequestStatusType,
} from '@/src/mocks/requests.mock';
import {
  createStayRequest,
  getStayRequest,
  listStayRequests,
  type StayRequestItem,
} from '@/src/services/atrio-api';

type RequestsState = {
  errorMessage: string | null;
  isLoaded: boolean;
  isLoading: boolean;
  items: RequestItem[];
};

let state: RequestsState = {
  items: [],
  isLoading: false,
  isLoaded: false,
  errorMessage: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: RequestsState) {
  state = nextState;
  emitChange();
}

function mapRequestStatusType(status: string): RequestStatusType {
  switch (status) {
    case 'received':
    case 'preparing':
    case 'on_the_way':
    case 'completed':
      return status;
    default:
      return 'attention';
  }
}

function mapRequest(item: StayRequestItem): RequestItem {
  return {
    id: item.id,
    type: item.type as RequestItem['type'],
    title: item.title,
    status: item.statusLabel as RequestStatus,
    statusType: mapRequestStatusType(item.status),
    quantity: item.quantity ?? undefined,
    note: item.note,
    roomNumber: item.roomNumber,
    createdAt: item.createdAt,
    timeLabel: item.timeLabel,
  };
}

function upsertRequest(item: RequestItem) {
  const nextItems = state.items.filter((currentItem) => currentItem.id !== item.id);
  return [item, ...nextItems];
}

export function getRequestsState() {
  return state;
}

export function subscribeToRequests(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function loadRequests(stayId: string, options: { force?: boolean } = {}) {
  if (state.isLoading || (state.isLoaded && !options.force)) {
    return state.items;
  }

  setState({
    ...state,
    isLoading: true,
    errorMessage: null,
  });

  try {
    const response = await listStayRequests(stayId);
    const items = response.items.map(mapRequest);

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
      errorMessage: error instanceof Error ? error.message : 'Nao foi possivel carregar as solicitacoes.',
    });

    throw error;
  }
}

export async function createRequest(
  stayId: string,
  input: { serviceId: string; quantity?: number; note?: string },
) {
  const createdRequest = mapRequest(await createStayRequest(stayId, input));

  setState({
    ...state,
    items: upsertRequest(createdRequest),
    isLoaded: true,
    errorMessage: null,
  });

  return createdRequest;
}

export async function fetchRequestById(stayId: string, requestId: string) {
  const existingRequest = state.items.find((item) => item.id === requestId);

  if (existingRequest) {
    return existingRequest;
  }

  const request = mapRequest(await getStayRequest(stayId, requestId));

  setState({
    ...state,
    items: upsertRequest(request),
    isLoaded: true,
  });

  return request;
}

export function buildRequestDetails(request: Pick<RequestItem, 'quantity' | 'roomNumber' | 'timeLabel'>) {
  return getRequestDetails(request);
}

export function useRequests() {
  return useSyncExternalStore(subscribeToRequests, getRequestsState, getRequestsState);
}

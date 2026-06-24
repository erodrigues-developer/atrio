import { apiRequest } from '@/src/services/api-client';

export type StayAccessChallengeResponse = {
  challengeId: string;
  deliveryChannel: string;
  maskedPhone: string;
  expiresAt: string;
  resendAvailableAt: string;
};

export type SessionResponse = {
  guestId: string;
  guestName: string;
  hotelId: string;
  stayId: string;
  roomNumber: string;
  isAuthenticated: boolean;
};

export type VerifyStayAccessResponse = {
  accessToken: string;
  refreshToken: string;
  session: SessionResponse;
  stay: {
    id: string;
    hotelName: string;
    roomNumber: string;
    checkOutTime: string;
  };
};

export type DashboardResponse = {
  greeting: {
    periodLabel: string;
    guestFirstName: string;
    message: string;
  };
  stay: {
    hotelName: string;
    roomNumber: string;
    checkOutTime: string;
  };
  quickActions: {
    id: string;
    title: string;
    icon: string;
    target: string;
  }[];
  featuredExperience: {
    id: string;
    title: string;
    description: string;
    badge: string;
    category: string;
    timeLabel: string;
    priceLabel: string;
    imageUrl: string;
  };
  requests: StayRequestItem[];
  reservations: ReservationItemResponse[];
  usefulInfo: {
    id: string;
    title: string;
    description: string;
  }[];
};

export type StaySummaryResponse = {
  id: string;
  hotelId: string;
  hotelName: string;
  guestId: string;
  roomNumber: string;
  status: string;
  statusLabel: string;
  checkInDate: string;
  checkOutDate: string;
  checkInLabel: string;
  checkOutLabel: string;
  checkOutTime: string;
  summaries: {
    requests: string;
    reservations: string;
  };
  usefulInfo: {
    id: string;
    title: string;
    description: string;
  }[];
};

export type WifiResponse = {
  network: string;
  password: string;
  updatedAt: string;
};

export type ConsumptionResponse = {
  enabled: boolean;
  view: 'ready' | 'empty' | 'unavailable';
  currency: string;
  totalAmountCents: number;
  updatedAt: string;
  items: {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    amountCents: number;
    currency: string;
    occurredAt: string;
  }[];
  emptyState: {
    title: string;
    description: string;
    actionLabel?: string;
  };
  unavailableState: {
    title: string;
    description: string;
    actionLabel?: string;
  };
};

export type ExperienceListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLabel: string;
  priceLabel: string;
  badge: string | null;
  imageUrl: string;
};

export type ExperienceCollectionResponse = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  items: ExperienceListItem[];
};

export type ExperienceCollectionsResponse = {
  collections: ExperienceCollectionResponse[];
};

export type ExperienceDetailResponse = ExperienceListItem & {
  durationLabel: string | null;
  availabilityLabel: string | null;
  locationLabel: string | null;
  locationDescription: string | null;
  included: string[];
  policy: string | null;
};

export type ExperienceAvailabilityResponse = {
  experienceId: string;
  days: {
    id: string;
    label: string;
    date: string;
    dateLabel: string;
    slots: {
      id: string;
      time: string;
      startsAt: string;
      available: boolean;
    }[];
  }[];
};

export type ServiceResponse = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requestSchema: {
    fields: {
      name: string;
      type: string;
      label?: string;
      min?: number;
      max?: number;
      defaultValue?: number;
      maxLength?: number;
      required: boolean;
    }[];
  };
  fulfillmentType?: string;
};

export type ServiceListResponse = {
  items: ServiceResponse[];
};

export type StayRequestItem = {
  id: string;
  stayId: string;
  serviceId: string;
  type: string;
  title: string;
  status: string;
  statusLabel: string;
  quantity: number | null;
  note: string;
  roomNumber: string;
  createdAt: string;
  timeLabel: string;
};

export type StayRequestListResponse = {
  items: StayRequestItem[];
  pagination: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export type ReservationItemResponse = {
  id: string;
  stayId: string;
  experienceId: string;
  title: string;
  status: string;
  statusLabel: string;
  dateLabel: string;
  timeLabel: string;
  scheduledAt: string;
  locationLabel: string;
  priceLabel: string;
  note: string;
};

export type ReservationListResponse = {
  items: ReservationItemResponse[];
  pagination: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export type ConciergeMessageResponse = {
  id: string;
  sender: 'hotel' | 'guest';
  text: string;
  createdAt: string;
};

export type ConciergeMessagesResponse = {
  quickSuggestions: {
    id: string;
    label: string;
    icon: string;
  }[];
  messages: ConciergeMessageResponse[];
  pagination?: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export type CreateConciergeMessageResponse = {
  message: ConciergeMessageResponse;
  reply: ConciergeMessageResponse;
};

export function identifyStayAccess(input: {
  hotelId: string;
  roomNumber: string;
  lastName: string;
}) {
  return apiRequest<StayAccessChallengeResponse>('/stay-access/identify', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { authenticated: false });
}

export function verifyStayAccess(input: { challengeId: string; code: string }) {
  return apiRequest<VerifyStayAccessResponse>('/stay-access/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { authenticated: false });
}

export function resendStayAccessCode(input: { challengeId: string }) {
  return apiRequest<StayAccessChallengeResponse>('/stay-access/resend-code', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { authenticated: false });
}

export function getSession() {
  return apiRequest<SessionResponse>('/me/session');
}

export function getStayDashboard(stayId: string) {
  return apiRequest<DashboardResponse>(`/stays/${stayId}/dashboard`);
}

export function getStay(stayId: string) {
  return apiRequest<StaySummaryResponse>(`/stays/${stayId}`);
}

export function getStayWifi(stayId: string) {
  return apiRequest<WifiResponse>(`/stays/${stayId}/wifi`);
}

export function getStayConsumption(stayId: string) {
  return apiRequest<ConsumptionResponse>(`/stays/${stayId}/consumption`);
}

export function listExperienceCollections() {
  return apiRequest<ExperienceCollectionsResponse>('/experiences/collections');
}

export function getExperienceCollection(collectionId: string) {
  return apiRequest<ExperienceCollectionResponse>(`/experiences/collections/${collectionId}`);
}

export function getExperience(experienceId: string) {
  return apiRequest<ExperienceDetailResponse>(`/experiences/${experienceId}`);
}

export function getExperienceAvailability(experienceId: string) {
  return apiRequest<ExperienceAvailabilityResponse>(`/experiences/${experienceId}/availability`);
}

export function listServices() {
  return apiRequest<ServiceListResponse>('/services');
}

export function getService(serviceId: string) {
  return apiRequest<ServiceResponse>(`/services/${serviceId}`);
}

export function createStayRequest(
  stayId: string,
  input: { serviceId: string; quantity?: number; note?: string },
) {
  return apiRequest<StayRequestItem>(`/stays/${stayId}/requests`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listStayRequests(stayId: string) {
  return apiRequest<StayRequestListResponse>(`/stays/${stayId}/requests`);
}

export function getStayRequest(stayId: string, requestId: string) {
  return apiRequest<StayRequestItem>(`/stays/${stayId}/requests/${requestId}`);
}

export function createReservation(
  stayId: string,
  input: { experienceId: string; slotId: string; scheduledAt: string; partySize: number; note?: string },
) {
  return apiRequest<ReservationItemResponse>(`/stays/${stayId}/reservations`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listReservations(stayId: string) {
  return apiRequest<ReservationListResponse>(`/stays/${stayId}/reservations`);
}

export function getReservation(stayId: string, reservationId: string) {
  return apiRequest<ReservationItemResponse>(`/stays/${stayId}/reservations/${reservationId}`);
}

export function listConciergeMessages(stayId: string) {
  return apiRequest<ConciergeMessagesResponse>(`/stays/${stayId}/concierge/messages`);
}

export function createConciergeMessage(stayId: string, input: { text: string; source?: string }) {
  return apiRequest<CreateConciergeMessageResponse>(`/stays/${stayId}/concierge/messages`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

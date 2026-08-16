const API_BASE_URL = import.meta.env.VITE_ATRIO_API_URL ?? 'http://localhost:3101/v1';
export const ADMIN_SESSION_EXPIRED_EVENT = 'atrio-admin-session-expired';

export type AdminUser = {
  adminUserId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  hotel: {
    id: string;
    name: string;
  };
};

export type AdminHotelSettings = {
  id: string;
  name: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
};

export type AdminSession = {
  accessToken: string;
  expiresAt: string;
  admin: AdminUser;
};

export type DashboardMetric = {
  label: string;
  value: number;
  helper: string;
  actionLabel?: string;
  targetView?: string;
  detail?: string;
  tone?: 'neutral' | 'warning' | 'critical';
};

export type DashboardItem = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  roomNumber: string;
  guestName?: string;
  helper?: string;
  priority?: 'normal' | 'warning' | 'critical';
  waitMinutes?: number;
  createdAt?: string;
  scheduledAt?: string;
};

export type DashboardAlert = {
  id: string;
  tone: 'critical' | 'warning' | 'info';
  title: string;
  helper: string;
  actionLabel: string;
  targetView?: string;
  waitMinutes?: number;
};

export type DashboardMovement = {
  id: string;
  timeLabel: string;
  type: 'check-in' | 'check-out' | 'experience';
  title: string;
  helper: string;
  scheduledAt?: string;
};

export type Dashboard = {
  hotelId: string;
  hotelName: string;
  metrics: DashboardMetric[];
  todayMetrics: DashboardMetric[];
  attentionMetrics: DashboardMetric[];
  alerts: DashboardAlert[];
  pendingRequests: DashboardItem[];
  pendingExperiences: DashboardItem[];
  conciergeConversations: DashboardItem[];
  upcomingMovements: DashboardMovement[];
};

export type AdminGuest = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  maskedPhone: string;
};

export type AdminStay = {
  id: string;
  hotelId: string;
  roomNumber: string;
  status: string;
  statusLabel: string;
  checkInDate: string;
  checkOutDate: string;
  checkOutTime: string;
  wifiNetwork: string;
  wifiPassword: string;
  consumptionEnabled: boolean;
  consumptionView: 'ready' | 'empty' | 'unavailable';
  guest: AdminGuest;
  activeGuestSessions: number;
};

export type CreateGuestPayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type CreateStayPayload = {
  guestId?: string;
  guest?: CreateGuestPayload;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  checkOutTime: string;
  wifiNetwork: string;
  wifiPassword: string;
  consumptionEnabled: boolean;
  consumptionView: 'ready' | 'empty' | 'unavailable';
};

export type UpdateStayPayload = {
  guestId?: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  checkOutTime: string;
  consumptionEnabled: boolean;
  consumptionView: 'ready' | 'empty' | 'unavailable';
};

export type StayUsefulInfo = {
  id: string;
  scope: 'dashboard' | 'stay';
  title: string;
  description: string;
  position: number;
};

export type ConsumptionItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  amountCents: number;
  currency: string;
  occurredAt: string;
};

export type ServiceDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  fulfillmentType: string;
  requestSchema: { fields: Array<Record<string, unknown>> };
  published: boolean;
};

export type ServiceRequest = {
  id: string;
  stayId: string;
  serviceId: string;
  title: string;
  status: string;
  statusLabel: string;
  quantity: number | null;
  note: string;
  internalNote: string | null;
  roomNumber: string;
  guestName: string;
  createdAt: string;
};

export type AdminExperience = {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLabel: string;
  priceLabel: string;
  badge: string | null;
  imageUrl: string;
  durationLabel: string | null;
  availabilityLabel: string | null;
  locationLabel: string | null;
  locationDescription: string | null;
  policy: string | null;
  included: string[];
  published: boolean;
};

export type AdminExperienceCollection = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
};

export type AdminExperienceSlot = {
  id: string;
  experienceId: string;
  date: string;
  dayLabel: string;
  dateLabel: string;
  time: string;
  startsAt: string;
  isAvailable: boolean;
  position: number;
};

export type AdminReservation = {
  id: string;
  stayId: string;
  experienceId: string;
  title: string;
  status: string;
  statusLabel: string;
  scheduledAt: string;
  roomNumber: string;
  guestName: string;
};

export type ConciergeConversation = {
  stayId: string;
  roomNumber: string;
  guestName: string;
  lastMessageAt: string | null;
  guestMessageCount: number;
};

export type ConciergeMessage = {
  id: string;
  stayId: string;
  sender: 'hotel' | 'guest';
  text: string;
  source: string | null;
  createdAt: string;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function notifySessionExpired(status: number) {
  if (status === 401 || status === 403) {
    window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EXPIRED_EVENT));
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? 'Não foi possível completar a operação.';
    notifySessionExpired(response.status);
    throw new ApiClientError(message, response.status, payload?.error?.code);
  }

  return payload as T;
}

async function upload<T>(path: string, accessToken: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? 'Não foi possível enviar a mídia.';
    notifySessionExpired(response.status);
    throw new ApiClientError(message, response.status, payload?.error?.code);
  }

  return payload as T;
}

export function login(email: string, password: string) {
  return request<AdminSession>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(accessToken: string) {
  return request<AdminUser>('/admin/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getDashboard(accessToken: string) {
  return request<Dashboard>('/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logout(accessToken: string) {
  return request<{ ok: boolean }>('/admin/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function listGuests(accessToken: string, search = '') {
  const params = new URLSearchParams();

  if (search) {
    params.set('search', search);
  }

  return request<AdminGuest[]>(`/admin/guests${params.size ? `?${params}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createGuest(accessToken: string, payload: CreateGuestPayload) {
  return request<AdminGuest>('/admin/guests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function listStays(accessToken: string, query: { search?: string; status?: string } = {}) {
  const params = new URLSearchParams();

  if (query.search) {
    params.set('search', query.search);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  return request<AdminStay[]>(`/admin/stays${params.size ? `?${params}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createStay(accessToken: string, payload: CreateStayPayload) {
  return request<AdminStay>('/admin/stays', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateStay(accessToken: string, stayId: string, payload: UpdateStayPayload) {
  return request<AdminStay>(`/admin/stays/${stayId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function resendStayAccess(accessToken: string, stayId: string) {
  return request<{ challengeId: string; maskedPhone: string; expiresAt: string }>(`/admin/stays/${stayId}/access/resend`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function checkInStay(accessToken: string, stayId: string) {
  return request<AdminStay>(`/admin/stays/${stayId}/check-in`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function checkOutStay(accessToken: string, stayId: string) {
  return request<{ stay: AdminStay; revokedSessions: number }>(`/admin/stays/${stayId}/check-out`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function cancelStay(accessToken: string, stayId: string) {
  return request<AdminStay>(`/admin/stays/${stayId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function revokeStaySessions(accessToken: string, stayId: string) {
  return request<{ revokedSessions: number }>(`/admin/stays/${stayId}/sessions/revoke`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updateStayWifi(accessToken: string, stayId: string, payload: { wifiNetwork: string; wifiPassword: string }) {
  return request<AdminStay>(`/admin/stays/${stayId}/wifi`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function listStayUsefulInfo(accessToken: string, stayId: string) {
  return request<StayUsefulInfo[]>(`/admin/stays/${stayId}/useful-info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createStayUsefulInfo(accessToken: string, stayId: string, payload: Omit<StayUsefulInfo, 'id'>) {
  return request<StayUsefulInfo>(`/admin/stays/${stayId}/useful-info`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function listStayConsumption(accessToken: string, stayId: string) {
  return request<ConsumptionItem[]>(`/admin/stays/${stayId}/consumption`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createStayConsumption(accessToken: string, stayId: string, payload: Omit<ConsumptionItem, 'id'>) {
  return request<ConsumptionItem>(`/admin/stays/${stayId}/consumption`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function listAdminServices(accessToken: string) {
  return request<ServiceDefinition[]>('/admin/services', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createAdminService(accessToken: string, payload: Omit<ServiceDefinition, 'id'> & { id?: string }) {
  return request<ServiceDefinition>('/admin/services', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateAdminService(accessToken: string, serviceId: string, payload: Omit<ServiceDefinition, 'id'>) {
  return request<ServiceDefinition>(`/admin/services/${serviceId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function setAdminServicePublished(accessToken: string, serviceId: string, published: boolean) {
  return request<ServiceDefinition>(`/admin/services/${serviceId}/${published ? 'publish' : 'unpublish'}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function listAdminRequests(accessToken: string, query: { status?: string; search?: string } = {}) {
  const params = new URLSearchParams();

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.search) {
    params.set('search', query.search);
  }

  return request<ServiceRequest[]>(`/admin/requests${params.size ? `?${params}` : ''}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updateAdminRequestStatus(accessToken: string, requestId: string, payload: { status: string; internalNote?: string }) {
  return request<ServiceRequest>(`/admin/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function listAdminExperiences(accessToken: string) {
  return request<AdminExperience[]>('/admin/experiences', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createAdminExperience(accessToken: string, payload: Omit<AdminExperience, 'id'> & { id?: string }) {
  return request<AdminExperience>('/admin/experiences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function listAdminExperienceCollections(accessToken: string) {
  return request<AdminExperienceCollection[]>('/admin/experience-collections', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createAdminExperienceCollection(accessToken: string, payload: Omit<AdminExperienceCollection, 'id'> & { id?: string }) {
  return request<AdminExperienceCollection>('/admin/experience-collections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function uploadAdminExperienceImage(accessToken: string, experienceId: string, file: File) {
  return upload<{ id: string; imageUrl: string }>(`/admin/experiences/${experienceId}/image`, accessToken, file);
}

export function uploadAdminExperienceCollectionImage(accessToken: string, collectionId: string, file: File) {
  return upload<{ id: string; imageUrl: string }>(`/admin/experience-collections/${collectionId}/image`, accessToken, file);
}

export function linkExperienceToCollection(accessToken: string, collectionId: string, payload: { experienceId: string; position: number }) {
  return request<{ id: string }>(`/admin/experience-collections/${collectionId}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function listAdminExperienceSlots(accessToken: string, experienceId: string) {
  return request<AdminExperienceSlot[]>(`/admin/experiences/${experienceId}/slots`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createAdminExperienceSlot(accessToken: string, experienceId: string, payload: { startsAt: string; isAvailable: boolean; position: number }) {
  return request<AdminExperienceSlot>(`/admin/experiences/${experienceId}/slots`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function updateAdminExperienceSlot(accessToken: string, experienceId: string, slotId: string, payload: { isAvailable: boolean }) {
  return request<AdminExperienceSlot>(`/admin/experiences/${experienceId}/slots/${slotId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function listAdminReservations(accessToken: string, query: { status?: string; search?: string } = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);

  return request<AdminReservation[]>(`/admin/reservations${params.size ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createAdminReservation(accessToken: string, payload: { stayId: string; experienceId: string; slotId: string; guestNote?: string }) {
  return request<AdminReservation>('/admin/reservations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function updateAdminReservationStatus(accessToken: string, reservationId: string, payload: { status: string }) {
  return request<AdminReservation>(`/admin/reservations/${reservationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

export function listConciergeConversations(accessToken: string, search = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);

  return request<ConciergeConversation[]>(`/admin/concierge/conversations${params.size ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function listConciergeMessages(accessToken: string, stayId: string) {
  return request<ConciergeMessage[]>(`/admin/concierge/conversations/${stayId}/messages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function sendConciergeMessage(accessToken: string, stayId: string, text: string) {
  return request<ConciergeMessage>(`/admin/concierge/conversations/${stayId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ text }),
  });
}

export function getHotelSettings(accessToken: string) {
  return request<AdminHotelSettings>('/admin/hotels/current', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function uploadHotelLogo(accessToken: string, file: File) {
  return upload<AdminHotelSettings>('/admin/hotels/current/logo', accessToken, file);
}

export function uploadHotelHeroImage(accessToken: string, file: File) {
  return upload<AdminHotelSettings>('/admin/hotels/current/hero-image', accessToken, file);
}

export async function downloadReport(accessToken: string, report: 'stays' | 'requests' | 'reservations', query: { status?: string; from?: string; to?: string } = {}) {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);

  const response = await fetch(`${API_BASE_URL}/admin/reports/${report}.csv${params.size ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    notifySessionExpired(response.status);
    throw new ApiClientError('Não foi possível baixar o relatório.', response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

import { z } from 'zod';

const optionalText = z.string().optional();
const nullableText = z.string().nullable();

export const adminUserSchema = z.object({
  adminUserId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(z.string()),
  hotel: z.object({ id: z.string(), name: z.string() }),
});

export const adminSessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
  admin: adminUserSchema,
});

export const dashboardMetricSchema = z.object({
  label: z.string(), value: z.number(), helper: z.string(), actionLabel: optionalText,
  targetView: optionalText, detail: optionalText,
  tone: z.enum(['neutral', 'warning', 'critical']).optional(),
});

const dashboardItemSchema = z.object({
  id: z.string(), title: z.string(), status: z.string(), statusLabel: z.string(), roomNumber: z.string(),
  guestName: optionalText, helper: optionalText, priority: z.enum(['normal', 'warning', 'critical']).optional(),
  waitMinutes: z.number().optional(), createdAt: optionalText, scheduledAt: optionalText,
});

export const dashboardSchema = z.object({
  hotelId: z.string(), hotelName: z.string(), metrics: z.array(dashboardMetricSchema),
  todayMetrics: z.array(dashboardMetricSchema), attentionMetrics: z.array(dashboardMetricSchema),
  alerts: z.array(z.object({
    id: z.string(), tone: z.enum(['critical', 'warning', 'info']), title: z.string(), helper: z.string(),
    actionLabel: z.string(), targetView: optionalText, waitMinutes: z.number().optional(),
  })),
  pendingRequests: z.array(dashboardItemSchema), pendingExperiences: z.array(dashboardItemSchema),
  conciergeConversations: z.array(dashboardItemSchema),
  upcomingMovements: z.array(z.object({
    id: z.string(), timeLabel: z.string(), type: z.enum(['check-in', 'check-out', 'experience']),
    title: z.string(), helper: z.string(), scheduledAt: optionalText,
  })),
});

export const guestSchema = z.object({
  id: z.string(), firstName: z.string(), lastName: z.string(), phoneNumber: z.string(), maskedPhone: z.string(),
});

export const staySchema = z.object({
  id: z.string(), hotelId: z.string(), roomNumber: z.string(), status: z.string(), statusLabel: z.string(),
  checkInDate: z.string(), checkOutDate: z.string(), checkOutTime: z.string(), consumptionEnabled: z.boolean(),
  consumptionView: z.enum(['ready', 'empty', 'unavailable']), guest: guestSchema, activeGuestSessions: z.number(),
});

export const stayPageSchema = z.object({
  items: z.array(staySchema), total: z.number(), page: z.number(), pageSize: z.number(), totalPages: z.number(),
});

export const usefulInfoSchema = z.object({
  id: z.string(), scope: z.enum(['dashboard', 'stay']), title: z.string(), description: z.string(), position: z.number(),
});

export const consumptionSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), category: z.string(), icon: z.string(),
  amountCents: z.number(), currency: z.string(), occurredAt: z.string(),
});

export const serviceSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), icon: z.string(), fulfillmentType: z.string(),
  requestSchema: z.object({ fields: z.array(z.record(z.string(), z.unknown())) }), published: z.boolean(),
});

export const serviceRequestSchema = z.object({
  id: z.string(), stayId: z.string(), serviceId: z.string(), title: z.string(), status: z.string(),
  statusLabel: z.string(), quantity: z.number().nullable(), note: z.string(), internalNote: nullableText,
  roomNumber: z.string(), guestName: z.string(), createdAt: z.string(),
});

export const experienceSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), category: z.string(), timeLabel: z.string(),
  priceLabel: z.string(), badge: nullableText, imageUrl: z.string(), durationLabel: nullableText,
  availabilityLabel: nullableText, locationLabel: nullableText, locationDescription: nullableText,
  policy: nullableText, included: z.array(z.string()), published: z.boolean(),
});

export const collectionSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), imageUrl: nullableText,
  featured: z.boolean(), published: z.boolean(),
});

export const slotSchema = z.object({
  id: z.string(), experienceId: z.string(), date: z.string(), dayLabel: z.string(), dateLabel: z.string(),
  time: z.string(), startsAt: z.string(), isAvailable: z.boolean(), position: z.number(),
});

export const reservationSchema = z.object({
  id: z.string(), stayId: z.string(), experienceId: z.string(), title: z.string(), status: z.string(),
  statusLabel: z.string(), scheduledAt: z.string(), roomNumber: z.string(), guestName: z.string(),
});

export const conversationSchema = z.object({
  stayId: z.string(), roomNumber: z.string(), guestName: z.string(), lastMessageAt: nullableText,
  guestMessageCount: z.number(),
});

export const messageSchema = z.object({
  id: z.string(), stayId: z.string(), sender: z.enum(['hotel', 'guest']), text: z.string(),
  source: nullableText, createdAt: z.string(),
});

export const hotelSettingsSchema = z.object({
  id: z.string(), name: z.string(), logoUrl: nullableText, heroImageUrl: nullableText,
  wifiNetwork: z.string(), wifiPassword: z.string(), usefulInfo: z.array(usefulInfoSchema),
});

export const okSchema = z.object({ ok: z.boolean() });
export const idSchema = z.object({ id: z.string() });
export const mediaSchema = z.object({ id: z.string(), imageUrl: z.string() });
export const accessChallengeSchema = z.object({ challengeId: z.string(), maskedPhone: z.string(), expiresAt: z.string() });
export const revokedSessionsSchema = z.object({ revokedSessions: z.number() });
export const checkoutSchema = z.object({ stay: staySchema, revokedSessions: z.number() });

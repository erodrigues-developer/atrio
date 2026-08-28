import { io, type Socket } from 'socket.io-client';
import { env } from '@/app/config/env';

export type ConciergeRealtimeMessage = {
  id: string;
  hotelId: string;
  stayId: string;
  sender: 'hotel' | 'guest';
  text: string;
  source: string | null;
  createdAt: string;
};

const realtimeBaseUrl = env.apiBaseUrl.replace(/\/v1\/?$/, '');

export function connectAdminConcierge(token: string): Socket {
  return io(`${realtimeBaseUrl}/concierge`, {
    auth: { actor: 'admin', token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5_000,
    transports: ['websocket', 'polling'],
  });
}

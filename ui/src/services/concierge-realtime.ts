import { io, type Socket } from 'socket.io-client';
import { REALTIME_BASE_URL } from '@/src/services/api-config';

export type ConciergeRealtimeMessage = {
  id: string;
  hotelId: string;
  stayId: string;
  sender: 'hotel' | 'guest';
  text: string;
  source: string | null;
  createdAt: string;
};

export function connectGuestConcierge(token: string): Socket {
  return io(`${REALTIME_BASE_URL}/concierge`, {
    auth: { actor: 'guest', token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5_000,
    transports: ['websocket', 'polling'],
  });
}


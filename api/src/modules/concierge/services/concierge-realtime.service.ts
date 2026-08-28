import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

export type ConciergeRealtimeMessage = {
  id: string;
  hotelId: string;
  stayId: string;
  sender: 'hotel' | 'guest';
  text: string;
  source: string | null;
  createdAt: string;
};

@Injectable()
export class ConciergeRealtimeService {
  private server?: Server;

  attachServer(server: Server) {
    this.server = server;
  }

  publishMessage(message: ConciergeRealtimeMessage) {
    if (!this.server) return;

    this.server
      .to(this.stayRoom(message.stayId))
      .to(this.hotelRoom(message.hotelId))
      .emit('concierge:message', message);
  }

  stayRoom(stayId: string) {
    return `stay:${stayId}`;
  }

  hotelRoom(hotelId: string) {
    return `hotel:${hotelId}`;
  }
}


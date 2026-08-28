import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { AdminSession } from 'src/modules/admin/entities/admin-session.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import type { Server, Socket } from 'socket.io';
import { ConciergeRealtimeService } from '../services/concierge-realtime.service';

type ConciergeSocketData = {
  actor?: 'admin' | 'guest';
  hotelId?: string;
  stayId?: string;
};

@WebSocketGateway({
  namespace: '/concierge',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
})
export class ConciergeGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(ConciergeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepository: Repository<AdminSession>,
    private readonly realtimeService: ConciergeRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.attachServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.readToken(client);
      const actor = client.handshake.auth?.actor === 'admin' ? 'admin' : 'guest';
      if (!token) throw new Error('Missing access token.');

      if (actor === 'admin') {
        const session = await this.adminSessionRepository.findOne({
          where: { accessToken: token, expiresAt: MoreThan(new Date()), revokedAt: IsNull() },
          relations: { adminUser: true },
        });
        if (!session?.adminUser?.isActive) throw new Error('Invalid admin session.');

        (client.data as ConciergeSocketData).actor = 'admin';
        (client.data as ConciergeSocketData).hotelId = session.hotelId;
        await client.join(this.realtimeService.hotelRoom(session.hotelId));
      } else {
        const session = await this.authService.validateAccessToken(token);
        (client.data as ConciergeSocketData).actor = 'guest';
        (client.data as ConciergeSocketData).hotelId = session.hotelId;
        (client.data as ConciergeSocketData).stayId = session.stayId;
        await client.join(this.realtimeService.stayRoom(session.stayId));
      }

      client.emit('concierge:ready', { connected: true, actor });
    } catch (error) {
      this.logger.warn(`Rejected concierge socket ${client.id}: ${error instanceof Error ? error.message : 'unauthorized'}`);
      client.emit('concierge:error', { code: 'UNAUTHORIZED', message: 'Sessão do chat inválida ou expirada.' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('concierge:ping')
  ping(@ConnectedSocket() client: Socket) {
    client.emit('concierge:pong', { at: new Date().toISOString() });
  }

  private readToken(client: Socket): string {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') return authToken.trim();

    const authorization = client.handshake.headers.authorization;
    return authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  }
}


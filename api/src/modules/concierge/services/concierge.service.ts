import { Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { QueueService } from 'src/modules/queues/services/queue.service';
import { StayRepository } from 'src/modules/stays/repositories/stay.repository';
import { ConciergeMessage } from '../entities/concierge-message.entity';
import { ConciergeMessageRepository } from '../repositories/concierge-message.repository';

@Injectable()
export class ConciergeService {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly conciergeMessageRepository: ConciergeMessageRepository,
    private readonly queueService: QueueService,
  ) {}

  async listMessages(
    stayId: string,
    query: { before?: string; limit?: number },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const beforeMessage = query.before
      ? await this.conciergeMessageRepository.findById(query.before)
      : null;
    const messages = await this.conciergeMessageRepository.listByStayId(stayId, query.limit ?? 50, beforeMessage ?? undefined);

    return {
      quickSuggestions: [
        { id: 'help', label: 'Preciso de ajuda', icon: 'CircleHelp' },
        { id: 'recommendation', label: 'Quero uma recomendação', icon: 'Sparkles' },
      ],
      messages: [...messages]
        .reverse()
        .map((message) => ({
          id: message.id,
          sender: message.sender,
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        })),
      pagination: {
        hasNextPage: messages.length === (query.limit ?? 50),
        nextCursor: messages.length === (query.limit ?? 50) ? messages[messages.length - 1]?.id ?? null : null,
      },
    };
  }

  async createMessage(
    stayId: string,
    input: { text: string; source?: string },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const createdAt = new Date();

    const guestMessage = new ConciergeMessage();
    guestMessage.id = buildResourceId('msg');
    guestMessage.stayId = stayId;
    guestMessage.sender = 'guest';
    guestMessage.text = input.text;
    guestMessage.source = input.source ?? 'typed_message';
    guestMessage.createdAt = createdAt;

    const replyMessage = new ConciergeMessage();
    replyMessage.id = buildResourceId('msg');
    replyMessage.stayId = stayId;
    replyMessage.sender = 'hotel';
    replyMessage.text = 'Recebemos sua mensagem. A equipe do hotel irá acompanhar e responder em breve.';
    replyMessage.source = 'auto_reply';
    replyMessage.createdAt = new Date(createdAt.getTime() + 1000);

    await this.conciergeMessageRepository.create(guestMessage);
    await this.conciergeMessageRepository.create(replyMessage);
    await this.queueService.publish('concierge.fifo', {
      event: 'concierge.message.created',
      stayId,
      messageId: guestMessage.id,
    });

    return {
      message: {
        id: guestMessage.id,
        sender: guestMessage.sender,
        text: guestMessage.text,
        createdAt: guestMessage.createdAt.toISOString(),
      },
      reply: {
        id: replyMessage.id,
        sender: replyMessage.sender,
        text: replyMessage.text,
        createdAt: replyMessage.createdAt.toISOString(),
      },
    };
  }

  private async assertStay(stayId: string, session: AuthSessionContext) {
    if (stayId !== session.stayId) {
      throw new ApiException(403, 'FORBIDDEN', 'Stay does not belong to the authenticated guest.');
    }

    const stay = await this.stayRepository.findById(stayId);

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }
  }
}

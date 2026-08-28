import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Empty, Input, Spin, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  EllipsisOutlined,
  PaperClipOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listConciergeConversations,
  listConciergeMessages,
  sendConciergeMessage,
  type ConciergeConversation,
  type ConciergeMessage,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Toast } from '@/shared/components/Toast';

type ConversationFilter = 'all' | 'unread' | 'active';

type ConciergeViewProps = {
  accessToken: string;
  cacheScope: string;
  onNavigate: (view: 'guests' | 'stays') => void;
};

export function ConciergeView({ accessToken, cacheScope, onNavigate }: ConciergeViewProps) {
  const queryClient = useQueryClient();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [selectedStayId, setSelectedStayId] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [reply, setReply] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const conversationsQuery = useQuery({
    queryKey: adminQueryKeys.conversations(cacheScope, appliedSearch),
    queryFn: () => listConciergeConversations(accessToken, appliedSearch),
    refetchInterval: 15_000,
  });
  const conversations = conversationsQuery.data ?? [];
  const unreadCount = conversations.filter(isAwaitingHotel).length;
  const filteredConversations = conversations.filter((conversation) => {
    if (filter === 'unread') return isAwaitingHotel(conversation);
    if (filter === 'active') return conversation.stayStatus === 'active';
    return true;
  });
  const activeConversation = filteredConversations.find(({ stayId }) => stayId === selectedStayId)
    ?? filteredConversations[0];
  const activeStayId = activeConversation?.stayId ?? '';

  const messagesQuery = useQuery({
    queryKey: adminQueryKeys.messages(cacheScope, activeStayId),
    queryFn: () => listConciergeMessages(accessToken, activeStayId),
    enabled: Boolean(activeStayId),
    refetchInterval: 10_000,
  });
  const messages = messagesQuery.data ?? [];

  const replyMutation = useMutation({
    mutationFn: (text: string) => sendConciergeMessage(accessToken, activeStayId, text),
    onSuccess: async () => {
      setReply('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.messages(cacheScope, activeStayId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.concierge(cacheScope) }),
      ]);
    },
  });
  const error = conversationsQuery.error ?? messagesQuery.error ?? replyMutation.error;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeStayId, messages.length]);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedStayId('');
    setIsMobileChatOpen(false);
    setAppliedSearch(search.trim());
  }

  function changeFilter(nextFilter: ConversationFilter) {
    setFilter(nextFilter);
    setSelectedStayId('');
    setIsMobileChatOpen(false);
  }

  function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    if (activeStayId && text) replyMutation.mutate(text);
  }

  return (
    <div className={`concierge-page${isMobileChatOpen ? ' mobile-chat-open' : ''}`}>
      <header className="page-heading concierge-page-heading">
        <div>
          <Typography.Title level={1}>Concierge</Typography.Title>
          <p>Gerencie as conversas com hóspedes em tempo real.</p>
        </div>
      </header>

      {error ? <Toast tone="error" message={error.message} onClose={() => void conversationsQuery.refetch()} /> : null}

      <section className="concierge-workspace" aria-label="Central de atendimento do concierge">
        <aside className="concierge-sidebar">
          <div className="concierge-sidebar-controls">
            <form className="concierge-search" onSubmit={applySearch}>
              <Input
                aria-label="Buscar conversas"
                placeholder="Buscar conversas"
                suffix={<SearchOutlined />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
            <div className="concierge-filter-tabs" aria-label="Filtros de conversas" role="group">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => changeFilter('all')} type="button">Todas</button>
              <button className={filter === 'unread' ? 'active' : ''} onClick={() => changeFilter('unread')} type="button">
                Não lidas {unreadCount > 0 ? <Badge count={unreadCount} overflowCount={99} /> : null}
              </button>
              <button className={filter === 'active' ? 'active' : ''} onClick={() => changeFilter('active')} type="button">Em andamento</button>
            </div>
          </div>

          <div className="concierge-conversation-list" aria-busy={conversationsQuery.isFetching}>
            {conversationsQuery.isLoading ? <div className="concierge-list-loading"><Spin /><span>Carregando conversas...</span></div> : null}
            {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
              <Empty description="Nenhuma conversa encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : null}
            {filteredConversations.map((conversation, index) => {
              const awaitingHotel = isAwaitingHotel(conversation);
              return (
                <button
                  aria-current={conversation.stayId === activeStayId ? 'true' : undefined}
                  className={`concierge-conversation ${conversation.stayId === activeStayId ? 'active' : ''}`}
                  key={conversation.stayId}
                  onClick={() => {
                    setSelectedStayId(conversation.stayId);
                    setIsMobileChatOpen(true);
                  }}
                  type="button"
                >
                  <Avatar className={`concierge-avatar tone-${index % 5}`}>{getInitials(conversation.guestName)}</Avatar>
                  <span className="concierge-conversation-copy">
                    <strong>{conversation.guestName}</strong>
                    <span>Quarto {conversation.roomNumber}</span>
                    <small>{conversation.lastMessageText || 'Conversa ainda não iniciada.'}</small>
                  </span>
                  <span className="concierge-conversation-meta">
                    <time dateTime={conversation.lastMessageAt ?? undefined}>{formatConversationTime(conversation.lastMessageAt)}</time>
                    {awaitingHotel ? <Badge count={1} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="concierge-chat">
          {activeConversation ? (
            <>
              <header className="concierge-chat-header">
                <Button
                  aria-label="Voltar às conversas"
                  className="concierge-mobile-back"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setIsMobileChatOpen(false)}
                  title="Voltar às conversas"
                  type="text"
                />
                <Avatar className="concierge-avatar tone-0" size={48}>{getInitials(activeConversation.guestName)}</Avatar>
                <div className="concierge-chat-identity">
                  <strong>{activeConversation.guestName}</strong>
                  <span>
                    Quarto {activeConversation.roomNumber}
                    <Tag className={`concierge-status ${activeConversation.stayStatus}`}>{statusLabel(activeConversation.stayStatus)}</Tag>
                  </span>
                </div>
                <div className="concierge-chat-actions">
                  <Button icon={<UserOutlined />} onClick={() => onNavigate('guests')}>Ver detalhes do hóspede</Button>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'guest', icon: <UserOutlined />, label: 'Abrir hóspedes' },
                        { key: 'stay', label: 'Abrir estadias' },
                      ],
                      onClick: ({ key }) => onNavigate(key === 'guest' ? 'guests' : 'stays'),
                    }}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button aria-label="Mais ações da conversa" icon={<EllipsisOutlined />} title="Mais ações da conversa" />
                  </Dropdown>
                </div>
              </header>

              <div className="concierge-chat-thread" aria-live="polite">
                {messagesQuery.isLoading ? <div className="concierge-thread-loading"><Spin /><span>Carregando mensagens...</span></div> : null}
                {!messagesQuery.isLoading && messages.length === 0 ? (
                  <Empty description="Envie a primeira mensagem desta conversa." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : null}
                {messages.map((message, index) => (
                  <Fragment key={message.id}>
                    {shouldShowDateDivider(messages, index) ? <div className="concierge-date-divider">{formatDateDivider(message.createdAt)}</div> : null}
                    <article className={`concierge-message ${message.sender}`}>
                      <p>{message.text}</p>
                      <span className="concierge-message-meta">
                        <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
                        {message.sender === 'hotel' ? <CheckOutlined aria-label="Mensagem enviada" /> : null}
                      </span>
                    </article>
                  </Fragment>
                ))}
                <div ref={threadEndRef} />
              </div>

              <form className="concierge-composer" onSubmit={handleReply}>
                <Button
                  aria-label="Anexar arquivo (em breve)"
                  className="concierge-attachment"
                  disabled
                  icon={<PaperClipOutlined />}
                  title="Anexar arquivo — em breve"
                />
                <Input
                  aria-label="Mensagem"
                  autoComplete="off"
                  disabled={replyMutation.isPending}
                  placeholder="Digite uma mensagem..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                />
                <Button
                  aria-label="Enviar mensagem"
                  disabled={!reply.trim()}
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={replyMutation.isPending}
                  title="Enviar mensagem"
                  type="primary"
                />
              </form>
            </>
          ) : (
            <div className="concierge-chat-empty">
              <Empty description="Selecione uma conversa para iniciar o atendimento." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function isAwaitingHotel(conversation: ConciergeConversation) {
  return conversation.lastMessageSender === 'guest';
}

function getInitials(name: string) {
  const names = name.trim().split(/\s+/).filter(Boolean);
  return `${names[0]?.charAt(0) ?? ''}${names.length > 1 ? names[names.length - 1]?.charAt(0) ?? '' : ''}`.toUpperCase();
}

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameCalendarDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function formatConversationTime(value: string | null) {
  const date = parseDate(value);
  if (!date) return '';
  const today = new Date();
  if (sameCalendarDay(date, today)) return formatMessageTime(value as string);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameCalendarDay(date, yesterday)) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function formatMessageTime(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date) : '';
}

function formatDateDivider(value: string) {
  const date = parseDate(value);
  if (!date) return '';
  const today = new Date();
  if (sameCalendarDay(date, today)) return 'Hoje';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameCalendarDay(date, yesterday)) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date);
}

function shouldShowDateDivider(messages: ConciergeMessage[], index: number) {
  if (index === 0) return true;
  const current = parseDate(messages[index]?.createdAt ?? null);
  const previous = parseDate(messages[index - 1]?.createdAt ?? null);
  return Boolean(current && previous && !sameCalendarDay(current, previous));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: 'Hospedado',
    scheduled: 'Agendado',
    checked_out: 'Encerrado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

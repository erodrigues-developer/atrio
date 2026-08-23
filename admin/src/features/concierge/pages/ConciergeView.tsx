import { FormEvent, useState } from 'react';
import { Button, Empty, Input, Table, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listConciergeConversations, listConciergeMessages, sendConciergeMessage,
  type ConciergeConversation,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Toast } from '@/shared/components/Toast';
import { formatDate } from '@/shared/lib/presentation';

type ConciergeViewProps = {
  accessToken: string;
  cacheScope: string;
};

export function ConciergeView({ accessToken, cacheScope }: ConciergeViewProps) {
  const queryClient = useQueryClient();
  const [selectedStayId, setSelectedStayId] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [reply, setReply] = useState('');
  const conversationsQuery = useQuery({
    queryKey: adminQueryKeys.conversations(cacheScope, appliedSearch),
    queryFn: () => listConciergeConversations(accessToken, appliedSearch),
  });
  const conversations = conversationsQuery.data ?? [];
  const activeStayId = selectedStayId || conversations[0]?.stayId || '';
  const messagesQuery = useQuery({
    queryKey: adminQueryKeys.messages(cacheScope, activeStayId),
    queryFn: () => listConciergeMessages(accessToken, activeStayId),
    enabled: Boolean(activeStayId),
  });
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

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedStayId('');
    setAppliedSearch(search.trim());
  }

  function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    if (activeStayId && text) replyMutation.mutate(text);
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Conversas</Typography.Title>
          <form className="inline-search" onSubmit={applySearch}>
            <Input placeholder="Quarto ou hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button htmlType="submit">Filtrar</Button>
          </form>
        </header>
        {error ? <Toast tone="error" message={error.message} onClose={() => void conversationsQuery.refetch()} /> : null}
        {conversationsQuery.isLoading ? <p className="empty-state" role="status">Carregando conversas...</p> : null}
        {!conversationsQuery.isLoading && conversations.length === 0 ? <Empty description="Nenhuma conversa encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
          <Table
            columns={[
              { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
              { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
              { title: 'Mensagens', dataIndex: 'guestMessageCount', key: 'guestMessageCount' },
              { title: 'Última', key: 'lastMessageAt', render: (_: unknown, conversation: ConciergeConversation) => formatDate(conversation.lastMessageAt ?? undefined) },
            ]}
            dataSource={conversations}
            loading={conversationsQuery.isFetching}
            onRow={(conversation) => ({ onClick: () => setSelectedStayId(conversation.stayId) })}
            pagination={false}
            rowClassName={(conversation) => conversation.stayId === activeStayId ? 'selected-row clickable-row' : 'clickable-row'}
            rowKey="stayId"
          />
        )}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Atendimento</Typography.Title>
        <div className="chat-thread">
          {!activeStayId ? <p className="mini-empty">Selecione uma conversa.</p> : null}
          {activeStayId && messagesQuery.isLoading ? <p className="mini-empty" role="status">Carregando mensagens...</p> : null}
          {(messagesQuery.data ?? []).map((message) => (
            <article className={`chat-message ${message.sender}`} key={message.id}>
              <span>{message.sender === 'hotel' ? 'Hotel' : 'Hóspede'} - {formatDate(message.createdAt)}</span>
              <p>{message.text}</p>
            </article>
          ))}
        </div>
        <form className="stack-form section-form" onSubmit={handleReply}>
          <Input.TextArea placeholder="Responder ao hóspede" value={reply} onChange={(event) => setReply(event.target.value)} rows={4} />
          <Button disabled={!activeStayId || !reply.trim()} htmlType="submit" loading={replyMutation.isPending} type="primary">Enviar resposta</Button>
        </form>
      </section>
    </div>
  );
}

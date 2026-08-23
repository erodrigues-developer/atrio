import { FormEvent, useState } from 'react';
import { Button, Empty, Input, Select as AntSelect, Table, Tag, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listAdminRequests, updateAdminRequestStatus, type ServiceRequest,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import {
  canCancelRequest, formatDate, nextRequestAction, requestActionTitle, requestStatusLabel,
} from '@/shared/lib/presentation';
import { ConfirmActionModal } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';

type RequestsViewProps = {
  accessToken: string;
  cacheScope: string;
};

export function RequestsView({ accessToken, cacheScope }: RequestsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [internalNote, setInternalNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ request: ServiceRequest; status: string } | null>(null);
  const requestsQuery = useQuery({
    queryKey: adminQueryKeys.requestList(cacheScope, filters),
    queryFn: () => listAdminRequests(accessToken, filters),
  });
  const statusMutation = useMutation({
    mutationFn: ({ request, nextStatus }: { request: ServiceRequest; nextStatus: string }) => (
      updateAdminRequestStatus(accessToken, request.id, {
        status: nextStatus,
        ...(internalNote.trim() ? { internalNote: internalNote.trim() } : {}),
      })
    ),
    onSuccess: async () => {
      setMessage('Status atualizado.');
      setInternalNote('');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.requests(cacheScope) });
    },
  });
  const error = requestsQuery.error ?? statusMutation.error;
  const requests = requestsQuery.data ?? [];

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ search: search.trim(), status });
  }

  return (
    <section className="table-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>Fila de solicitações</Typography.Title>
        <form className="inline-search" onSubmit={applyFilters}>
          <Input placeholder="Quarto, hóspede ou serviço" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AntSelect onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Recebido', value: 'received' }, { label: 'Aceito', value: 'accepted' }, { label: 'Em preparo', value: 'in_progress' }, { label: 'A caminho', value: 'on_the_way' }, { label: 'Concluído', value: 'completed' }, { label: 'Cancelado', value: 'cancelled' }, { label: 'Recusado', value: 'rejected' }]} value={status} />
          <Button htmlType="submit">Filtrar</Button>
        </form>
      </header>
      <div className="request-note-bar">
        <Input placeholder="Nota interna para a próxima atualização" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
      </div>
      {message || error ? (
        <Toast
          tone={error ? 'error' : 'success'}
          message={error instanceof Error ? error.message : message ?? ''}
          onClose={() => { setMessage(null); if (error) void requestsQuery.refetch(); }}
        />
      ) : null}
      {requestsQuery.isLoading ? <p className="empty-state" role="status">Carregando solicitações...</p> : null}
      {!requestsQuery.isLoading && requests.length === 0 ? <Empty description="Nenhuma solicitação encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <Table
          columns={[
            { title: 'Serviço', key: 'title', render: (_: unknown, request: ServiceRequest) => <><strong>{request.title}</strong><br /><span className="muted-text">{formatDate(request.createdAt)}</span></> },
            { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
            { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
            { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', render: (value: string) => <Tag>{value}</Tag> },
            { title: 'Nota', key: 'note', render: (_: unknown, request: ServiceRequest) => request.note || request.internalNote || '-' },
            { title: 'Ações', key: 'actions', render: (_: unknown, request: ServiceRequest) => <div className="row-actions">{nextRequestAction(request.status) ? <Button onClick={() => { const action = nextRequestAction(request.status); if (action) setStatusCandidate({ request, status: action.status }); }} size="small">{nextRequestAction(request.status)?.label}</Button> : null}{canCancelRequest(request.status) ? <Button danger onClick={() => setStatusCandidate({ request, status: 'cancelled' })} size="small">Cancelar</Button> : null}</div> },
          ]}
          dataSource={requests}
          loading={requestsQuery.isFetching}
          pagination={false}
          rowKey="id"
        />
      )}
      {statusCandidate ? (
        <ConfirmActionModal
          confirmLabel={`Marcar como ${requestStatusLabel(statusCandidate.status)}`}
          message={`A solicitação "${statusCandidate.request.title}" do quarto ${statusCandidate.request.roomNumber} será marcada como ${requestStatusLabel(statusCandidate.status)}.`}
          onCancel={() => setStatusCandidate(null)}
          onConfirm={() => {
            statusMutation.mutate({ request: statusCandidate.request, nextStatus: statusCandidate.status });
            setStatusCandidate(null);
          }}
          title={requestActionTitle(statusCandidate.status)}
          tone={statusCandidate.status === 'cancelled' ? 'danger' : 'primary'}
        />
      ) : null}
    </section>
  );
}

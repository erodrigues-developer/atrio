import { type FormEvent, type ReactNode, useState } from 'react';
import { Button, Dropdown, Input, Select as AntSelect, Table, Tag, Typography } from 'antd';
import {
  ApartmentOutlined, ArrowRightOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined,
  MessageOutlined, MoreOutlined, SearchOutlined, UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import requestsEmptyImage from '@/assets/requests-empty.webp';
import { listAdminRequests, updateAdminRequestStatus, type ServiceRequest } from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import {
  canCancelRequest, formatDate, nextRequestAction, requestActionTitle, requestStatusLabel,
} from '@/shared/lib/presentation';
import { Modal } from '@/shared/components/Modal';
import { ManagementEmptyState, ManagementPagination } from '@/shared/components/PremiumManagement';
import { Toast } from '@/shared/components/Toast';

type RequestsViewProps = {
  accessToken: string;
  cacheScope: string;
};

const PAGE_SIZE = 10;

export function RequestsView({ accessToken, cacheScope }: RequestsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [detailRequest, setDetailRequest] = useState<ServiceRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ request: ServiceRequest; status: string } | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const requestsQuery = useQuery({
    queryKey: adminQueryKeys.requestList(cacheScope, { ...filters, page, pageSize: PAGE_SIZE }),
    queryFn: () => listAdminRequests(accessToken, { ...filters, page, pageSize: PAGE_SIZE }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ note, request, nextStatus }: { note: string; request: ServiceRequest; nextStatus: string }) => (
      updateAdminRequestStatus(accessToken, request.id, {
        status: nextStatus,
        ...(note.trim() ? { internalNote: note.trim() } : {}),
      })
    ),
    onSuccess: async (updatedRequest) => {
      setDetailRequest((current) => current?.id === updatedRequest.id ? updatedRequest : current);
      setPage(1);
      setMessage('Status da solicitação atualizado com sucesso.');
      setInternalNote('');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.requests(cacheScope) });
    },
  });

  const requests = requestsQuery.data?.items ?? [];
  const totalItems = requestsQuery.data?.total ?? 0;
  const error = requestsQuery.error ?? statusMutation.error;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({ search: search.trim(), status });
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    setFilters({ search: '', status: '' });
    setPage(1);
  }

  function openStatusConfirmation(request: ServiceRequest, nextStatus: string) {
    setInternalNote('');
    setStatusCandidate({ request, status: nextStatus });
  }

  return (
    <div className="premium-management-layout requests-layout">
      <header className="page-heading premium-page-heading">
        <div>
          <Typography.Title level={1}>Solicitações</Typography.Title>
          <p>Acompanhe e atualize os pedidos dos hóspedes durante toda a operação.</p>
        </div>
      </header>

      <section className="premium-filter-panel">
        <form className="premium-toolbar" onSubmit={applyFilters}>
          <label className="premium-filter-field premium-filter-search">
            <span>Buscar solicitação</span>
            <Input aria-label="Buscar solicitação" placeholder="Buscar por quarto, hóspede ou serviço" prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="premium-filter-field">
            <span>Status</span>
            <AntSelect
              aria-label="Status da solicitação"
              onChange={setStatus}
              options={[
                { label: 'Todos', value: '' },
                { label: 'Recebidas', value: 'received' },
                { label: 'Aceitas', value: 'accepted' },
                { label: 'Em preparo', value: 'in_progress' },
                { label: 'A caminho', value: 'on_the_way' },
                { label: 'Concluídas', value: 'completed' },
                { label: 'Canceladas', value: 'cancelled' },
                { label: 'Recusadas', value: 'rejected' },
              ]}
              value={status}
            />
          </label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button>
          <Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel premium-results-panel">
        <header className="premium-results-header"><span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span></header>
        {message || error ? (
          <Toast
            tone={error ? 'error' : 'success'}
            message={error instanceof Error ? error.message : message ?? ''}
            onClose={() => { setMessage(null); if (error) void requestsQuery.refetch(); }}
          />
        ) : null}
        <RequestsTable
          emptyContent={(
            <ManagementEmptyState
              actions={<Button onClick={clearFilters}>Limpar filtros</Button>}
              alt="Campainha de hotel entre um cartão de solicitação e uma mensagem"
              description="Não há solicitações para os filtros selecionados."
              image={requestsEmptyImage}
              title="Nenhuma solicitação encontrada"
            />
          )}
          isLoading={requestsQuery.isLoading}
          onSelect={setDetailRequest}
          onStatusChange={openStatusConfirmation}
          requests={requests}
        />
        <ManagementPagination currentPage={page} pageSize={PAGE_SIZE} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {detailRequest ? (
        <RequestDetailModal
          onClose={() => setDetailRequest(null)}
          onStatusChange={openStatusConfirmation}
          request={detailRequest}
        />
      ) : null}
      {statusCandidate ? (
        <RequestStatusModal
          internalNote={internalNote}
          layer={detailRequest ? 'secondary' : 'primary'}
          onCancel={() => { setStatusCandidate(null); setInternalNote(''); }}
          onConfirm={() => {
            statusMutation.mutate({ note: internalNote, request: statusCandidate.request, nextStatus: statusCandidate.status });
            setStatusCandidate(null);
          }}
          onNoteChange={setInternalNote}
          request={statusCandidate.request}
          status={statusCandidate.status}
        />
      ) : null}
    </div>
  );
}

function RequestsTable({
  emptyContent,
  isLoading,
  onSelect,
  onStatusChange,
  requests,
}: {
  emptyContent: ReactNode;
  isLoading: boolean;
  onSelect: (request: ServiceRequest) => void;
  onStatusChange: (request: ServiceRequest, status: string) => void;
  requests: ServiceRequest[];
}) {
  return (
    <Table
      className="premium-data-table"
      columns={[
        { title: 'Serviço', key: 'title', render: (_: unknown, request: ServiceRequest) => <div className="premium-table-primary"><strong>{request.title}</strong><span>{formatDate(request.createdAt)}</span></div> },
        { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
        { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
        { title: 'Status', key: 'status', render: (_: unknown, request: ServiceRequest) => <Tag color={requestStatusColor(request.status)}>{request.statusLabel}</Tag> },
        { title: 'Observação', key: 'note', render: (_: unknown, request: ServiceRequest) => <span className="premium-truncated-copy">{request.note || request.internalNote || '—'}</span> },
        {
          title: 'Ações', key: 'actions', width: 148,
          render: (_: unknown, request: ServiceRequest) => {
            const nextAction = nextRequestAction(request.status);
            return (
              <div className="premium-table-actions" onClick={(event) => event.stopPropagation()}>
                <Button aria-label={`Ver detalhes de ${request.title}`} icon={<EyeOutlined />} onClick={() => onSelect(request)} title={`Ver detalhes de ${request.title}`} type="text" />
                {nextAction ? <Button aria-label={`${nextAction.label} solicitação`} icon={<ArrowRightOutlined />} onClick={() => onStatusChange(request, nextAction.status)} title={`${nextAction.label} solicitação`} type="text" /> : null}
                {canCancelRequest(request.status) ? <Button aria-label="Cancelar solicitação" danger icon={<CloseCircleOutlined />} onClick={() => onStatusChange(request, 'cancelled')} title="Cancelar solicitação" type="text" /> : null}
              </div>
            );
          },
        },
      ]}
      dataSource={requests}
      loading={isLoading}
      locale={{ emptyText: emptyContent }}
      onRow={(request) => premiumClickableRow(`Ver detalhes de ${request.title}`, () => onSelect(request))}
      pagination={false}
      rowClassName="clickable-row"
      rowKey="id"
      scroll={{ x: 980 }}
    />
  );
}

function RequestDetailModal({
  onClose,
  onStatusChange,
  request,
}: {
  onClose: () => void;
  onStatusChange: (request: ServiceRequest, status: string) => void;
  request: ServiceRequest;
}) {
  const nextAction = nextRequestAction(request.status);
  return (
    <Modal title="Detalhes da solicitação" onClose={onClose} size="large">
      <div className="premium-detail-content">
        <header className="premium-detail-hero">
          <div className="premium-detail-identity">
            <div className="premium-identity-chip"><MessageOutlined /> {request.title}</div>
            <Tag color={requestStatusColor(request.status)}>{request.statusLabel}</Tag>
          </div>
          <div className="premium-detail-actions">
            {nextAction ? <Button onClick={() => onStatusChange(request, nextAction.status)} type="primary">{nextAction.label}</Button> : null}
            {canCancelRequest(request.status) ? (
              <Dropdown menu={{ items: [{ danger: true, icon: <CloseCircleOutlined />, key: 'cancel', label: 'Cancelar solicitação' }], onClick: () => onStatusChange(request, 'cancelled') }}>
                <Button aria-label="Mais ações" icon={<MoreOutlined />} title="Mais ações" />
              </Dropdown>
            ) : null}
          </div>
        </header>
        <section className="premium-summary-grid">
          <article className="premium-summary-card"><span>Quarto</span><strong><ApartmentOutlined /> {request.roomNumber}</strong><small>Local de atendimento</small></article>
          <article className="premium-summary-card"><span>Hóspede</span><strong><UserOutlined /> {request.guestName}</strong><small>Solicitante</small></article>
          <article className="premium-summary-card"><span>Recebida em</span><strong><ClockCircleOutlined /> {formatDate(request.createdAt)}</strong><small>Início do atendimento</small></article>
        </section>
        <section className="premium-copy-panel">
          <div><span>Observação do hóspede</span><p>{request.note || 'Nenhuma observação informada.'}</p></div>
          <div><span>Nota interna</span><p>{request.internalNote || 'Nenhuma nota interna registrada.'}</p></div>
        </section>
      </div>
    </Modal>
  );
}

function RequestStatusModal({
  internalNote,
  layer,
  onCancel,
  onConfirm,
  onNoteChange,
  request,
  status,
}: {
  internalNote: string;
  layer: 'primary' | 'secondary';
  onCancel: () => void;
  onConfirm: () => void;
  onNoteChange: (value: string) => void;
  request: ServiceRequest;
  status: string;
}) {
  return (
    <Modal layer={layer} title={requestActionTitle(status)} onClose={onCancel} size="compact">
      <div className="confirmation-summary"><strong>{request.title}</strong><span>Quarto {request.roomNumber} · {request.guestName}</span></div>
      <p className="muted-text">A solicitação será marcada como {requestStatusLabel(status)}.</p>
      <label className="premium-confirm-note">Nota interna (opcional)<Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={500} onChange={(event) => onNoteChange(event.target.value)} placeholder="Registre um contexto para a equipe" value={internalNote} /></label>
      <div className="modal-footer">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button danger={status === 'cancelled'} onClick={onConfirm} type="primary">Marcar como {requestStatusLabel(status)}</Button>
      </div>
    </Modal>
  );
}

function requestStatusColor(status: string) {
  return ({ received: 'processing', accepted: 'blue', in_progress: 'gold', on_the_way: 'cyan', completed: 'success', cancelled: 'error', rejected: 'error' } as Record<string, string>)[status] ?? 'default';
}

function premiumClickableRow(label: string, onSelect: () => void) {
  return {
    'aria-label': label,
    onClick: onSelect,
    onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    },
    role: 'button',
    tabIndex: 0,
  };
}

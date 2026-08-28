import { type FormEvent, type ReactNode, useState } from 'react';
import { Button, Dropdown, Input, Select as AntSelect, Table, Tag, Typography } from 'antd';
import {
  ApartmentOutlined, CalendarOutlined, CheckOutlined, CloseCircleOutlined, EyeOutlined,
  MoreOutlined, PlusOutlined, SearchOutlined, StarOutlined, UserOutlined,
} from '@ant-design/icons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reservationsEmptyImage from '@/assets/reservations-empty.webp';
import {
  createAdminReservation, listAdminExperiences, listAdminExperienceSlots, listAdminReservations,
  listStays, updateAdminReservationStatus, type AdminReservation,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { formatDate, reservationStatusLabel } from '@/shared/lib/presentation';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import {
  ManagementEmptyState, ManagementPagination, MobileRecordCard, MobileRecordField, MobileRecordList,
} from '@/shared/components/PremiumManagement';
import { Toast } from '@/shared/components/Toast';
import { reservationFormSchema, type ReservationFormValues } from '../schemas/reservation-form-schema';

type ReservationsViewProps = { accessToken: string; cacheScope: string };
type ReservationFilters = { search: string; status: string };

const PAGE_SIZE = 10;
const emptyForm: ReservationFormValues = { stayId: '', experienceId: '', slotId: '', guestNote: '' };

export function ReservationsView({ accessToken, cacheScope }: ReservationsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState<ReservationFilters>({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [detailReservation, setDetailReservation] = useState<AdminReservation | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ reservation: AdminReservation; status: string } | null>(null);
  const reservationsQuery = useQuery({ queryKey: adminQueryKeys.reservationList(cacheScope, { ...filters, page, pageSize: PAGE_SIZE }), queryFn: () => listAdminReservations(accessToken, { ...filters, page, pageSize: PAGE_SIZE }) });
  const createMutation = useMutation({
    mutationFn: (values: ReservationFormValues) => createAdminReservation(accessToken, values),
    onSuccess: async () => {
      setIsCreateOpen(false);
      setMessage('Reserva criada com sucesso.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.experiences(cacheScope) }),
      ]);
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ reservationId, nextStatus }: { reservationId: string; nextStatus: string }) => updateAdminReservationStatus(accessToken, reservationId, { status: nextStatus }),
    onSuccess: async (updatedReservation) => {
      setDetailReservation((current) => current?.id === updatedReservation.id ? updatedReservation : current);
      setPage(1);
      setMessage('Status da reserva atualizado com sucesso.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) });
    },
  });

  const reservations = reservationsQuery.data?.items ?? [];
  const totalItems = reservationsQuery.data?.total ?? 0;
  const error = reservationsQuery.error ?? statusMutation.error;

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

  function openStatusConfirmation(reservation: AdminReservation, nextStatus: string) {
    setStatusCandidate({ reservation, status: nextStatus });
  }

  return (
    <div className="premium-management-layout reservations-layout">
      <header className="page-heading premium-page-heading">
        <div><Typography.Title level={1}>Reservas</Typography.Title><p>Gerencie as reservas de experiências vinculadas às estadias dos hóspedes.</p></div>
        <Button icon={<PlusOutlined />} onClick={() => { createMutation.reset(); setIsCreateOpen(true); }} size="large" type="primary">Nova reserva</Button>
      </header>

      <section className="premium-filter-panel">
        <form className="premium-toolbar" onSubmit={applyFilters}>
          <label className="premium-filter-field premium-filter-search"><span>Buscar reserva</span><Input aria-label="Buscar reserva" placeholder="Buscar por quarto, hóspede ou experiência" prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="premium-filter-field"><span>Status</span><AntSelect aria-label="Status da reserva" onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Solicitadas', value: 'requested' }, { label: 'Confirmadas', value: 'confirmed' }, { label: 'Concluídas', value: 'completed' }, { label: 'Canceladas', value: 'cancelled' }, { label: 'Recusadas', value: 'rejected' }]} value={status} /></label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button><Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel premium-results-panel">
        <header className="premium-results-header"><span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span></header>
        {message || error ? <Toast tone={error ? 'error' : 'success'} message={error instanceof Error ? error.message : message ?? ''} onClose={() => { setMessage(null); if (error) void reservationsQuery.refetch(); }} /> : null}
        <ReservationsTable emptyContent={<ManagementEmptyState actions={<><Button onClick={clearFilters}>Limpar filtros</Button><Button icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)} type="primary">Nova reserva</Button></>} alt="Calendário confirmado ao lado de ingresso e relógio" description="Ajuste os filtros ou crie uma nova reserva para começar." image={reservationsEmptyImage} title="Nenhuma reserva encontrada" />} isLoading={reservationsQuery.isLoading} onSelect={setDetailReservation} onStatusChange={openStatusConfirmation} reservations={reservations} />
        <ManagementPagination currentPage={page} pageSize={PAGE_SIZE} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {detailReservation ? <ReservationDetailModal onClose={() => setDetailReservation(null)} onStatusChange={openStatusConfirmation} reservation={detailReservation} /> : null}
      {isCreateOpen ? <ReservationCreateModal accessToken={accessToken} cacheScope={cacheScope} error={createMutation.error} isSubmitting={createMutation.isPending} onCancel={() => { createMutation.reset(); setIsCreateOpen(false); }} onSubmit={(values) => createMutation.mutate(values)} /> : null}
      {statusCandidate ? <ReservationStatusModal layer={detailReservation ? 'secondary' : 'primary'} onCancel={() => setStatusCandidate(null)} onConfirm={() => { statusMutation.mutate({ reservationId: statusCandidate.reservation.id, nextStatus: statusCandidate.status }); setStatusCandidate(null); }} reservation={statusCandidate.reservation} status={statusCandidate.status} /> : null}
    </div>
  );
}

function ReservationsTable({ emptyContent, isLoading, onSelect, onStatusChange, reservations }: { emptyContent: ReactNode; isLoading: boolean; onSelect: (reservation: AdminReservation) => void; onStatusChange: (reservation: AdminReservation, status: string) => void; reservations: AdminReservation[] }) {
  return <><Table className="premium-data-table" columns={[
    { title: 'Experiência', key: 'title', render: (_: unknown, reservation: AdminReservation) => <div className="premium-table-primary"><strong>{reservation.title}</strong><span>{formatDate(reservation.scheduledAt)}</span></div> },
    { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
    { title: 'Status', key: 'status', render: (_: unknown, reservation: AdminReservation) => <Tag color={reservationStatusColor(reservation.status)}>{reservation.statusLabel}</Tag> },
    { title: 'Ações', key: 'actions', width: 148, render: (_: unknown, reservation: AdminReservation) => <ReservationRowActions onSelect={onSelect} onStatusChange={onStatusChange} reservation={reservation} /> },
  ]} dataSource={reservations} loading={isLoading} locale={{ emptyText: emptyContent }} onRow={(reservation) => clickableRow(`Ver detalhes da reserva de ${reservation.title}`, () => onSelect(reservation))} pagination={false} rowClassName="clickable-row" rowKey="id" scroll={{ x: 820 }} />
  <MobileRecordList emptyContent={emptyContent} hasItems={reservations.length > 0} isLoading={isLoading}>
    {reservations.map((reservation) => (
      <MobileRecordCard
        actions={<ReservationRowActions onSelect={onSelect} onStatusChange={onStatusChange} reservation={reservation} />}
        badge={<Tag color={reservationStatusColor(reservation.status)}>{reservation.statusLabel}</Tag>}
        key={reservation.id}
        onSelect={() => onSelect(reservation)}
        subtitle={formatDate(reservation.scheduledAt)}
        title={reservation.title}
      >
        <MobileRecordField label="Hóspede" value={reservation.guestName} />
        <MobileRecordField label="Quarto" value={reservation.roomNumber} />
      </MobileRecordCard>
    ))}
  </MobileRecordList></>;
}

function ReservationRowActions({ onSelect, onStatusChange, reservation }: { onSelect: (reservation: AdminReservation) => void; onStatusChange: (reservation: AdminReservation, status: string) => void; reservation: AdminReservation }) {
  const actions = reservationActions(reservation.status);
  const primaryAction = actions.find((action) => !action.danger);
  const dangerAction = actions.find((action) => action.danger);
  return <div className="premium-table-actions" onClick={(event) => event.stopPropagation()}><Button aria-label={`Ver detalhes de ${reservation.title}`} icon={<EyeOutlined />} onClick={() => onSelect(reservation)} title={`Ver detalhes de ${reservation.title}`} type="text" />{primaryAction ? <Button aria-label={primaryAction.label} icon={<CheckOutlined />} onClick={() => onStatusChange(reservation, primaryAction.status)} title={primaryAction.label} type="text" /> : null}{dangerAction ? <Button aria-label={dangerAction.label} danger icon={<CloseCircleOutlined />} onClick={() => onStatusChange(reservation, dangerAction.status)} title={dangerAction.label} type="text" /> : null}</div>;
}

function ReservationDetailModal({ onClose, onStatusChange, reservation }: { onClose: () => void; onStatusChange: (reservation: AdminReservation, status: string) => void; reservation: AdminReservation }) {
  const actions = reservationActions(reservation.status);
  const primaryAction = actions.find((action) => !action.danger);
  const secondaryActions = actions.filter((action) => action !== primaryAction);
  return <Modal title="Detalhes da reserva" onClose={onClose} size="large"><div className="premium-detail-content">
    <header className="premium-detail-hero"><div className="premium-detail-identity"><div className="premium-identity-chip"><CalendarOutlined /> {reservation.title}</div><Tag color={reservationStatusColor(reservation.status)}>{reservation.statusLabel}</Tag></div><div className="premium-detail-actions">{primaryAction ? <Button onClick={() => onStatusChange(reservation, primaryAction.status)} type="primary">{primaryAction.label}</Button> : null}{secondaryActions.length ? <Dropdown menu={{ items: secondaryActions.map((action) => ({ ...(action.danger ? { danger: true } : {}), icon: action.danger ? <CloseCircleOutlined /> : <CheckOutlined />, key: action.status, label: action.label })), onClick: ({ key }) => onStatusChange(reservation, key) }}><Button aria-label="Mais ações" icon={<MoreOutlined />} title="Mais ações" /></Dropdown> : null}</div></header>
    <section className="premium-summary-grid"><article className="premium-summary-card"><span>Experiência</span><strong><StarOutlined /> {reservation.title}</strong><small>Atividade reservada</small></article><article className="premium-summary-card"><span>Hóspede</span><strong><UserOutlined /> {reservation.guestName}</strong><small>Quarto {reservation.roomNumber}</small></article><article className="premium-summary-card"><span>Data e horário</span><strong><CalendarOutlined /> {formatDate(reservation.scheduledAt)}</strong><small>Horário da experiência</small></article></section>
  </div></Modal>;
}

function ReservationCreateModal({ accessToken, cacheScope, error, isSubmitting, onCancel, onSubmit }: { accessToken: string; cacheScope: string; error: Error | null; isSubmitting: boolean; onCancel: () => void; onSubmit: (values: ReservationFormValues) => void }) {
  const { control, formState: { errors }, handleSubmit, register, setValue } = useForm<ReservationFormValues>({ resolver: zodResolver(reservationFormSchema), defaultValues: emptyForm });
  const experienceId = useWatch({ control, name: 'experienceId' });
  const staysQuery = useQuery({ queryKey: adminQueryKeys.stayList(cacheScope, { pageSize: 100 }), queryFn: () => listStays(accessToken, { pageSize: 100 }) });
  const experiencesQuery = useQuery({ queryKey: adminQueryKeys.experienceList(cacheScope, { page: 1, pageSize: 100, purpose: 'reservation-form' }), queryFn: () => listAdminExperiences(accessToken, { page: 1, pageSize: 100 }) });
  const slotsQuery = useQuery({ queryKey: adminQueryKeys.experienceSlots(cacheScope, experienceId), queryFn: () => listAdminExperienceSlots(accessToken, experienceId), enabled: Boolean(experienceId) });
  const queryError = staysQuery.error ?? experiencesQuery.error ?? slotsQuery.error;
  return <Modal className="operational-form-modal reservation-form-modal" title="Nova reserva" onClose={onCancel} width={600}><form className="premium-modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
    <label className="premium-form-wide">Estadia<Controller control={control} name="stayId" render={({ field }) => <AntSelect aria-invalid={Boolean(errors.stayId)} onChange={field.onChange} options={(staysQuery.data?.items ?? []).map((stay) => ({ label: `Quarto ${stay.roomNumber} · ${stay.guest.firstName} ${stay.guest.lastName}`, value: stay.id }))} placeholder="Selecione a estadia" value={field.value || null} />} /><FieldError message={errors.stayId?.message} /></label>
    <label>Experiência<Controller control={control} name="experienceId" render={({ field }) => <AntSelect aria-invalid={Boolean(errors.experienceId)} onChange={(value) => { field.onChange(value ?? ''); setValue('slotId', ''); }} options={(experiencesQuery.data?.items ?? []).map((experience) => ({ label: experience.title, value: experience.id }))} placeholder="Selecione" value={field.value || null} />} /><FieldError message={errors.experienceId?.message} /></label>
    <label>Horário<Controller control={control} name="slotId" render={({ field }) => <AntSelect aria-invalid={Boolean(errors.slotId)} disabled={!experienceId} loading={slotsQuery.isFetching} onChange={field.onChange} options={(slotsQuery.data ?? []).filter((slot) => slot.isAvailable).map((slot) => ({ label: `${slot.dateLabel} · ${slot.time}`, value: slot.id }))} placeholder={experienceId ? 'Selecione' : 'Escolha a experiência'} value={field.value || null} />} /><FieldError message={errors.slotId?.message} /></label>
    <label className="premium-form-wide">Observação (opcional)<Input.TextArea {...register('guestNote')} aria-invalid={Boolean(errors.guestNote)} autoSize={{ minRows: 2, maxRows: 4 }} maxLength={500} placeholder="Adicione uma observação para a reserva" /><FieldError message={errors.guestNote?.message} /></label>
    {error || queryError ? <Toast message={error?.message ?? (queryError instanceof Error ? queryError.message : 'Não foi possível carregar os dados da reserva.')} onClose={() => undefined} tone="error" /> : null}
    <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Criar reserva" />
  </form></Modal>;
}

function ReservationStatusModal({ layer, onCancel, onConfirm, reservation, status }: { layer: 'primary' | 'secondary'; onCancel: () => void; onConfirm: () => void; reservation: AdminReservation; status: string }) {
  return <Modal layer={layer} title="Atualizar reserva?" onClose={onCancel} size="compact"><div className="confirmation-summary"><strong>{reservation.title}</strong><span><ApartmentOutlined /> Quarto {reservation.roomNumber} · {reservation.guestName}</span><p>{formatDate(reservation.scheduledAt)}</p></div><p className="muted-text">A reserva será marcada como {reservationStatusLabel(status)}.</p><div className="modal-footer"><Button onClick={onCancel}>Cancelar</Button><Button danger={['cancelled', 'rejected'].includes(status)} onClick={onConfirm} type="primary">Marcar como {reservationStatusLabel(status)}</Button></div></Modal>;
}

function reservationActions(status: string) {
  const actions: Record<string, Array<{ danger?: boolean; label: string; status: string }>> = {
    requested: [{ label: 'Confirmar reserva', status: 'confirmed' }, { danger: true, label: 'Recusar reserva', status: 'rejected' }],
    confirmed: [{ label: 'Concluir reserva', status: 'completed' }, { danger: true, label: 'Cancelar reserva', status: 'cancelled' }],
  };
  return actions[status] ?? [];
}

function reservationStatusColor(status: string) {
  return ({ requested: 'processing', confirmed: 'success', completed: 'default', cancelled: 'error', rejected: 'error' } as Record<string, string>)[status] ?? 'default';
}

function clickableRow(label: string, onSelect: () => void) {
  return { 'aria-label': label, onClick: onSelect, onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }, role: 'button', tabIndex: 0 };
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

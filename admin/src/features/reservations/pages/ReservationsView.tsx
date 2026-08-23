import { type FormEvent, useState } from 'react';
import { Button, Empty, Input, Select as AntSelect, Table, Tag, Typography } from 'antd';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminReservation, listAdminExperiences, listAdminExperienceSlots, listAdminReservations,
  listStays, updateAdminReservationStatus, type AdminReservation,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { formatDate, reservationStatusLabel } from '@/shared/lib/presentation';
import { ConfirmActionModal } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { reservationFormSchema, type ReservationFormValues } from '../schemas/reservation-form-schema';

type ReservationsViewProps = { accessToken: string; cacheScope: string };
type ReservationFilters = { search: string; status: string };

const emptyForm: ReservationFormValues = { stayId: '', experienceId: '', slotId: '', guestNote: '' };

export function ReservationsView({ accessToken, cacheScope }: ReservationsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState<ReservationFilters>({ search: '', status: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ reservation: AdminReservation; status: string } | null>(null);
  const { control, formState: { errors }, handleSubmit, register, reset, setValue } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: emptyForm,
  });
  const experienceId = useWatch({ control, name: 'experienceId' });
  const reservationsQuery = useQuery({ queryKey: adminQueryKeys.reservationList(cacheScope, filters), queryFn: () => listAdminReservations(accessToken, filters) });
  const staysQuery = useQuery({ queryKey: adminQueryKeys.stayList(cacheScope, { pageSize: 100 }), queryFn: () => listStays(accessToken, { pageSize: 100 }) });
  const experiencesQuery = useQuery({ queryKey: adminQueryKeys.experiences(cacheScope), queryFn: () => listAdminExperiences(accessToken) });
  const slotsQuery = useQuery({
    queryKey: adminQueryKeys.experienceSlots(cacheScope, experienceId),
    queryFn: () => listAdminExperienceSlots(accessToken, experienceId),
    enabled: Boolean(experienceId),
  });
  const createMutation = useMutation({
    mutationFn: (values: ReservationFormValues) => createAdminReservation(accessToken, values),
    onSuccess: async () => {
      reset(emptyForm);
      setMessage('Reserva criada.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.experiences(cacheScope) }),
      ]);
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({ reservationId, nextStatus }: { reservationId: string; nextStatus: string }) => updateAdminReservationStatus(accessToken, reservationId, { status: nextStatus }),
    onSuccess: async () => {
      setMessage('Status da reserva atualizado.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) });
    },
  });
  const error = reservationsQuery.error ?? staysQuery.error ?? experiencesQuery.error ?? slotsQuery.error ?? createMutation.error ?? statusMutation.error;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ search: search.trim(), status });
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Reservas</Typography.Title>
          <form className="inline-search" onSubmit={applyFilters}>
            <Input aria-label="Buscar reserva" placeholder="Quarto, hóspede ou experiência" value={search} onChange={(event) => setSearch(event.target.value)} />
            <AntSelect aria-label="Status da reserva" onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Solicitada', value: 'requested' }, { label: 'Confirmada', value: 'confirmed' }, { label: 'Concluída', value: 'completed' }, { label: 'Cancelada', value: 'cancelled' }, { label: 'Recusada', value: 'rejected' }]} value={status} />
            <Button htmlType="submit">Filtrar</Button>
          </form>
        </header>
        {message || error ? <Toast tone={error ? 'error' : 'success'} message={error instanceof Error ? error.message : message ?? ''} onClose={() => setMessage(null)} /> : null}
        {reservationsQuery.isLoading
          ? <p className="empty-state" role="status">Carregando reservas...</p>
          : <ReservationsTable reservations={reservationsQuery.data ?? []} onStatusChange={(reservation, nextStatus) => setStatusCandidate({ reservation, status: nextStatus })} />}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Nova reserva</Typography.Title>
        <form className="stack-form" noValidate onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <Controller control={control} name="stayId" render={({ field }) => <AntSelect {...field} aria-label="Estadia" options={(staysQuery.data?.items ?? []).map((stay) => ({ label: `Quarto ${stay.roomNumber} - ${stay.guest.firstName}`, value: stay.id }))} placeholder="Estadia" value={field.value || null} />} />
          <FieldError message={errors.stayId?.message} />
          <Controller control={control} name="experienceId" render={({ field }) => <AntSelect {...field} aria-label="Experiência" onChange={(value) => { field.onChange(value ?? ''); setValue('slotId', ''); }} options={(experiencesQuery.data ?? []).map((experience) => ({ label: experience.title, value: experience.id }))} placeholder="Experiência" value={field.value || null} />} />
          <FieldError message={errors.experienceId?.message} />
          <Controller control={control} name="slotId" render={({ field }) => <AntSelect {...field} aria-label="Horário" loading={slotsQuery.isFetching} options={(slotsQuery.data ?? []).filter((slot) => slot.isAvailable).map((slot) => ({ label: `${slot.dateLabel} ${slot.time}`, value: slot.id }))} placeholder="Horário" value={field.value || null} />} />
          <FieldError message={errors.slotId?.message} />
          <Input {...register('guestNote')} aria-invalid={Boolean(errors.guestNote)} placeholder="Observação opcional" />
          <FieldError message={errors.guestNote?.message} />
          <Button htmlType="submit" loading={createMutation.isPending} type="primary">Criar reserva</Button>
        </form>
      </section>
      {statusCandidate ? <ConfirmActionModal
        confirmLabel={`Marcar como ${reservationStatusLabel(statusCandidate.status)}`}
        message={`A reserva "${statusCandidate.reservation.title}" do quarto ${statusCandidate.reservation.roomNumber} será marcada como ${reservationStatusLabel(statusCandidate.status)}.`}
        onCancel={() => setStatusCandidate(null)}
        onConfirm={() => { statusMutation.mutate({ reservationId: statusCandidate.reservation.id, nextStatus: statusCandidate.status }); setStatusCandidate(null); }}
        title="Atualizar reserva?"
        tone={statusCandidate.status === 'cancelled' ? 'danger' : 'primary'}
      /> : null}
    </div>
  );
}

function ReservationsTable({ reservations, onStatusChange }: { reservations: AdminReservation[]; onStatusChange: (reservation: AdminReservation, status: string) => void }) {
  if (reservations.length === 0) return <Empty description="Nenhuma reserva encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  return <Table columns={[
    { title: 'Experiência', key: 'title', render: (_: unknown, reservation: AdminReservation) => <><strong>{reservation.title}</strong><br /><span className="muted-text">{formatDate(reservation.scheduledAt)}</span></> },
    { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
    { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', render: (value: string) => <Tag>{value}</Tag> },
    { title: 'Ações', key: 'actions', render: (_: unknown, reservation: AdminReservation) => <div className="row-actions"><Button onClick={() => onStatusChange(reservation, 'confirmed')} size="small">Confirmar</Button><Button onClick={() => onStatusChange(reservation, 'completed')} size="small">Concluir</Button><Button danger onClick={() => onStatusChange(reservation, 'cancelled')} size="small">Cancelar</Button></div> },
  ]} dataSource={reservations} pagination={false} rowKey="id" />;
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

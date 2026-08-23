import { FormEvent, useState } from 'react';
import { Button, Empty, Input, Table, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGuest, listGuests, type AdminGuest } from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Toast } from '@/shared/components/Toast';
import { guestFormSchema, type GuestFormValues } from '../schemas/guest-form-schema';

type GuestsViewProps = {
  accessToken: string;
  cacheScope: string;
};

export function GuestsView({ accessToken, cacheScope }: GuestsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { firstName: '', lastName: '', phoneNumber: '' },
  });
  const guestsQuery = useQuery({
    queryKey: adminQueryKeys.guestList(cacheScope, appliedSearch),
    queryFn: () => listGuests(accessToken, appliedSearch),
  });
  const createMutation = useMutation({
    mutationFn: (values: GuestFormValues) => createGuest(accessToken, values),
    onSuccess: async () => {
      reset();
      setSearch('');
      setAppliedSearch('');
      setMessage('Hóspede cadastrado.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.guests(cacheScope) });
    },
  });
  const error = guestsQuery.error ?? createMutation.error;

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Hóspedes cadastrados</Typography.Title>
          <form className="inline-search" onSubmit={applySearch}>
            <Input aria-label="Buscar hóspede" placeholder="Buscar hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button htmlType="submit">Buscar</Button>
          </form>
        </header>
        {message || error ? (
          <Toast
            message={error instanceof Error ? error.message : message ?? ''}
            onClose={() => {
              setMessage(null);
              if (error) void guestsQuery.refetch();
            }}
            tone={error ? 'error' : 'success'}
          />
        ) : null}
        {guestsQuery.isLoading
          ? <p className="empty-state" role="status">Carregando hóspedes...</p>
          : <GuestsTable guests={guestsQuery.data ?? []} />}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Novo hóspede</Typography.Title>
        <form className="stack-form" noValidate onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <label>Nome<Input {...register('firstName')} aria-invalid={Boolean(errors.firstName)} /></label>
          <FieldError message={errors.firstName?.message} />
          <label>Sobrenome<Input {...register('lastName')} aria-invalid={Boolean(errors.lastName)} /></label>
          <FieldError message={errors.lastName?.message} />
          <label>Telefone<Input {...register('phoneNumber')} aria-invalid={Boolean(errors.phoneNumber)} inputMode="tel" /></label>
          <FieldError message={errors.phoneNumber?.message} />
          <Button htmlType="submit" loading={createMutation.isPending} type="primary">Cadastrar hóspede</Button>
        </form>
      </section>
    </div>
  );
}

function GuestsTable({ guests }: { guests: AdminGuest[] }) {
  if (guests.length === 0) return <Empty description="Nenhum hóspede encontrado." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  return <Table columns={[
    { title: 'Nome', key: 'name', render: (_: unknown, guest: AdminGuest) => `${guest.firstName} ${guest.lastName}` },
    { title: 'Telefone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Mascarado', dataIndex: 'maskedPhone', key: 'maskedPhone' },
  ]} dataSource={guests} pagination={false} rowKey="id" />;
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

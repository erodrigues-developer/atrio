import { type FormEvent, type ReactNode, useState } from 'react';
import {
  Button, Input, Pagination as AntPagination, Select as AntSelect, Table, Tag, Typography,
} from 'antd';
import {
  EyeOutlined, PhoneOutlined, PlusOutlined, SafetyCertificateOutlined, SearchOutlined, UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import guestsEmptyImage from '@/assets/guests-empty.webp';
import { createGuest, listGuests, type AdminGuest } from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { guestFormSchema, type GuestFormValues } from '../schemas/guest-form-schema';

type GuestsViewProps = {
  accessToken: string;
  cacheScope: string;
};

const PAGE_SIZE = 10;

export function GuestsView({ accessToken, cacheScope }: GuestsViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailGuest, setDetailGuest] = useState<AdminGuest | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const guestsQuery = useQuery({
    queryKey: adminQueryKeys.guestList(cacheScope, appliedSearch),
    queryFn: () => listGuests(accessToken, appliedSearch),
  });
  const createMutation = useMutation({
    mutationFn: (values: GuestFormValues) => createGuest(accessToken, values),
    onSuccess: async () => {
      setIsCreateOpen(false);
      setSearch('');
      setAppliedSearch('');
      setPage(1);
      setMessage('Hóspede cadastrado com sucesso.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.guests(cacheScope) });
    },
  });

  const guests = guestsQuery.data ?? [];
  const totalItems = guests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleGuests = guests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  function clearFilters() {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  }

  function openCreateModal() {
    createMutation.reset();
    setIsCreateOpen(true);
  }

  return (
    <div className="guests-layout">
      <header className="page-heading guests-page-heading">
        <div>
          <Typography.Title level={1}>Hóspedes</Typography.Title>
          <p>Gerencie os hóspedes cadastrados e os dados de contato usados durante a hospedagem.</p>
        </div>
        <Button icon={<PlusOutlined />} onClick={openCreateModal} size="large" type="primary">Novo hóspede</Button>
      </header>

      <section className="guests-filter-panel">
        <form className="guests-toolbar" onSubmit={applySearch}>
          <label className="guests-filter-field">
            <span>Buscar hóspede</span>
            <Input
              aria-label="Buscar hóspede"
              placeholder="Buscar por nome ou telefone"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button>
          <Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel guests-results-panel">
        <header className="guests-results-header">
          <span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span>
        </header>
        {message || guestsQuery.error ? (
          <Toast
            message={guestsQuery.error instanceof Error ? guestsQuery.error.message : message ?? ''}
            onClose={() => {
              setMessage(null);
              if (guestsQuery.error) void guestsQuery.refetch();
            }}
            tone={guestsQuery.error ? 'error' : 'success'}
          />
        ) : null}
        <GuestsTable
          emptyContent={<GuestsEmptyState onClearFilters={clearFilters} onCreate={openCreateModal} />}
          guests={visibleGuests}
          isLoading={guestsQuery.isLoading}
          onSelect={setDetailGuest}
        />
        <GuestsPagination currentPage={currentPage} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {detailGuest ? <GuestDetailModal guest={detailGuest} onClose={() => setDetailGuest(null)} /> : null}
      {isCreateOpen ? (
        <GuestCreateModal
          error={createMutation.error}
          isSubmitting={createMutation.isPending}
          onCancel={() => {
            createMutation.reset();
            setIsCreateOpen(false);
          }}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      ) : null}
    </div>
  );
}

function GuestsTable({
  emptyContent,
  guests,
  isLoading,
  onSelect,
}: {
  emptyContent: ReactNode;
  guests: AdminGuest[];
  isLoading: boolean;
  onSelect: (guest: AdminGuest) => void;
}) {
  return (
    <Table
      className="guests-table"
      columns={[
        { title: 'Nome', dataIndex: 'firstName', key: 'firstName' },
        { title: 'Sobrenome', dataIndex: 'lastName', key: 'lastName' },
        { title: 'Telefone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: 'Contato protegido', dataIndex: 'maskedPhone', key: 'maskedPhone' },
        {
          title: 'Ações',
          key: 'actions',
          width: 96,
          render: (_: unknown, guest: AdminGuest) => (
            <div className="guest-table-actions" onClick={(event) => event.stopPropagation()}>
              <Button aria-label={`Ver detalhes de ${guest.firstName} ${guest.lastName}`} icon={<EyeOutlined />} onClick={() => onSelect(guest)} type="text" />
            </div>
          ),
        },
      ]}
      dataSource={guests}
      loading={isLoading}
      locale={{ emptyText: emptyContent }}
      onRow={(guest) => ({
        'aria-label': `Ver detalhes de ${guest.firstName} ${guest.lastName}`,
        onClick: () => onSelect(guest),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(guest);
          }
        },
        role: 'button',
        tabIndex: 0,
      })}
      pagination={false}
      rowClassName="clickable-row"
      rowKey="id"
      scroll={{ x: 760 }}
    />
  );
}

function GuestsEmptyState({ onClearFilters, onCreate }: { onClearFilters: () => void; onCreate: () => void }) {
  return (
    <div className="guests-empty-state">
      <img alt="Profissional de hospitalidade ao lado de uma campainha e um cartão de acesso" src={guestsEmptyImage} />
      <Typography.Title level={3}>Nenhum hóspede encontrado</Typography.Title>
      <p>Tente ajustar a busca ou cadastre um novo hóspede para começar.</p>
      <div className="empty-state-actions">
        <Button onClick={onClearFilters}>Limpar filtros</Button>
        <Button icon={<PlusOutlined />} onClick={onCreate} type="primary">Novo hóspede</Button>
      </div>
    </div>
  );
}

function GuestsPagination({
  currentPage,
  onPageChange,
  totalItems,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems: number;
}) {
  return (
    <footer className="pagination-bar">
      <div className="pagination-size">
        <span>Itens por página</span>
        <AntSelect options={[{ label: String(PAGE_SIZE), value: PAGE_SIZE }]} value={PAGE_SIZE} />
      </div>
      <AntPagination
        current={currentPage}
        disabled={totalItems === 0}
        onChange={onPageChange}
        pageSize={PAGE_SIZE}
        showSizeChanger={false}
        total={Math.max(totalItems, 1)}
      />
    </footer>
  );
}

function GuestDetailModal({ guest, onClose }: { guest: AdminGuest; onClose: () => void }) {
  const guestName = `${guest.firstName} ${guest.lastName}`;

  return (
    <Modal title="Detalhes do hóspede" onClose={onClose} size="large">
      <div className="guest-detail-content">
        <header className="guest-detail-hero">
          <div className="guest-detail-identity">
            <div className="guest-identity-chip"><UserOutlined /> {guestName}</div>
            <Tag color="success">Cadastrado</Tag>
          </div>
        </header>
        <section className="guest-summary-grid">
          <article className="guest-summary-card">
            <span>Nome</span>
            <strong><UserOutlined /> {guest.firstName}</strong>
            <small>Nome de identificação</small>
          </article>
          <article className="guest-summary-card">
            <span>Sobrenome</span>
            <strong><SafetyCertificateOutlined /> {guest.lastName}</strong>
            <small>Cadastro do hóspede</small>
          </article>
          <article className="guest-summary-card">
            <span>Telefone</span>
            <strong><PhoneOutlined /> {guest.phoneNumber}</strong>
            <small>Exibição protegida: {guest.maskedPhone}</small>
          </article>
        </section>
      </div>
    </Modal>
  );
}

function GuestCreateModal({
  error,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  error: Error | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: GuestFormValues) => void;
}) {
  const { formState: { errors }, handleSubmit, register } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { firstName: '', lastName: '', phoneNumber: '' },
  });

  return (
    <Modal className="operational-form-modal guest-form-modal" title="Novo hóspede" onClose={onCancel} width={600}>
      <form className="guest-modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label>Nome
          <Input {...register('firstName')} aria-invalid={Boolean(errors.firstName)} autoFocus />
          <FieldError message={errors.firstName?.message} />
        </label>
        <label>Sobrenome
          <Input {...register('lastName')} aria-invalid={Boolean(errors.lastName)} />
          <FieldError message={errors.lastName?.message} />
        </label>
        <label className="guest-form-wide">Telefone
          <Input {...register('phoneNumber')} aria-invalid={Boolean(errors.phoneNumber)} inputMode="tel" placeholder="Informe o telefone com DDD" />
          <FieldError message={errors.phoneNumber?.message} />
        </label>
        {error ? <p aria-live="polite" className="form-error guest-form-wide">{error.message}</p> : null}
        <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Cadastrar hóspede" />
      </form>
    </Modal>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

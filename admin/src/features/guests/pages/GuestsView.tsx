import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  Button, Input, Pagination as AntPagination, Select as AntSelect, Table, Tag, Typography,
} from 'antd';
import {
  DeleteOutlined, EditOutlined, EyeOutlined, PhoneOutlined, PlusOutlined, SafetyCertificateOutlined,
  SearchOutlined, UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import guestsEmptyImage from '@/assets/guests-empty.webp';
import { createGuest, deleteGuest, listGuests, updateGuest, type AdminGuest } from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { MobileRecordCard, MobileRecordField, MobileRecordList } from '@/shared/components/PremiumManagement';
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
  const [formGuest, setFormGuest] = useState<AdminGuest | 'new' | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminGuest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const guestsQuery = useQuery({
    queryKey: adminQueryKeys.guestList(cacheScope, { search: appliedSearch, page, pageSize: PAGE_SIZE }),
    queryFn: () => listGuests(accessToken, { search: appliedSearch, page, pageSize: PAGE_SIZE }),
  });
  const saveMutation = useMutation({
    mutationFn: ({ guest, values }: { guest?: AdminGuest; values: GuestFormValues }) => (
      guest ? updateGuest(accessToken, guest.id, values) : createGuest(accessToken, values)
    ),
    onSuccess: async (savedGuest, variables) => {
      setFormGuest(null);
      setDetailGuest((current) => current?.id === savedGuest.id ? savedGuest : current);
      if (!variables.guest) {
        setSearch('');
        setAppliedSearch('');
        setPage(1);
      }
      setMessage(variables.guest ? 'Hóspede atualizado com sucesso.' : 'Hóspede cadastrado com sucesso.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.guests(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stays(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.requests(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (guest: AdminGuest) => deleteGuest(accessToken, guest.id),
    onSuccess: async () => {
      setDeleteCandidate(null);
      setDetailGuest(null);
      if (guests.length === 1 && page > 1) setPage(page - 1);
      setMessage('Hóspede excluído com sucesso.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.guests(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stays(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.requests(cacheScope) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reservations(cacheScope) }),
      ]);
    },
  });

  const guests = guestsQuery.data?.items ?? [];
  const totalItems = guestsQuery.data?.total ?? 0;

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
    saveMutation.reset();
    setFormGuest('new');
  }

  function openEditModal(guest: AdminGuest) {
    saveMutation.reset();
    setFormGuest(guest);
  }

  function openDeleteModal(guest: AdminGuest) {
    deleteMutation.reset();
    setDeleteCandidate(guest);
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
          guests={guests}
          isLoading={guestsQuery.isLoading}
          onDelete={openDeleteModal}
          onEdit={openEditModal}
          onSelect={setDetailGuest}
        />
        <GuestsPagination currentPage={page} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {detailGuest ? <GuestDetailModal guest={detailGuest} onClose={() => setDetailGuest(null)} onDelete={openDeleteModal} onEdit={openEditModal} /> : null}
      {formGuest ? (
        <GuestFormModal
          error={saveMutation.error}
          isSubmitting={saveMutation.isPending}
          layer={detailGuest ? 'secondary' : 'primary'}
          onCancel={() => {
            saveMutation.reset();
            setFormGuest(null);
          }}
          onSubmit={(values) => saveMutation.mutate({
            values,
            ...(formGuest === 'new' ? {} : { guest: formGuest }),
          })}
          {...(formGuest === 'new' ? {} : { guest: formGuest })}
        />
      ) : null}
      {deleteCandidate ? (
        <GuestDeleteModal
          error={deleteMutation.error}
          guest={deleteCandidate}
          isDeleting={deleteMutation.isPending}
          layer={detailGuest ? 'secondary' : 'primary'}
          onCancel={() => { deleteMutation.reset(); setDeleteCandidate(null); }}
          onConfirm={() => deleteMutation.mutate(deleteCandidate)}
        />
      ) : null}
    </div>
  );
}

function GuestsTable({
  emptyContent,
  guests,
  isLoading,
  onDelete,
  onEdit,
  onSelect,
}: {
  emptyContent: ReactNode;
  guests: AdminGuest[];
  isLoading: boolean;
  onDelete: (guest: AdminGuest) => void;
  onEdit: (guest: AdminGuest) => void;
  onSelect: (guest: AdminGuest) => void;
}) {
  return (
    <>
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
          width: 144,
          render: (_: unknown, guest: AdminGuest) => (
            <div className="guest-table-actions" onClick={(event) => event.stopPropagation()}>
              <Button aria-label={`Ver detalhes de ${guest.firstName} ${guest.lastName}`} icon={<EyeOutlined />} onClick={() => onSelect(guest)} title={`Ver detalhes de ${guest.firstName} ${guest.lastName}`} type="text" />
              <Button aria-label={`Editar ${guest.firstName} ${guest.lastName}`} icon={<EditOutlined />} onClick={() => onEdit(guest)} title={`Editar ${guest.firstName} ${guest.lastName}`} type="text" />
              <Button aria-label={`Excluir ${guest.firstName} ${guest.lastName}`} danger icon={<DeleteOutlined />} onClick={() => onDelete(guest)} title={`Excluir ${guest.firstName} ${guest.lastName}`} type="text" />
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
    <MobileRecordList emptyContent={emptyContent} hasItems={guests.length > 0} isLoading={isLoading}>
      {guests.map((guest) => (
        <MobileRecordCard
          actions={<>
            <Button icon={<EyeOutlined />} onClick={() => onSelect(guest)}>Ver detalhes</Button>
            <Button icon={<EditOutlined />} onClick={() => onEdit(guest)}>Editar</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(guest)}>Excluir</Button>
          </>}
          badge={<Tag icon={<SafetyCertificateOutlined />} color="blue">Protegido</Tag>}
          key={guest.id}
          onSelect={() => onSelect(guest)}
          subtitle={guest.maskedPhone}
          title={`${guest.firstName} ${guest.lastName}`}
        >
          <MobileRecordField label="Telefone" value={guest.phoneNumber} />
          <MobileRecordField label="Contato protegido" value={guest.maskedPhone} />
        </MobileRecordCard>
      ))}
    </MobileRecordList>
    </>
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

function GuestDetailModal({ guest, onClose, onDelete, onEdit }: { guest: AdminGuest; onClose: () => void; onDelete: (guest: AdminGuest) => void; onEdit: (guest: AdminGuest) => void }) {
  const guestName = `${guest.firstName} ${guest.lastName}`;

  return (
    <Modal title="Detalhes do hóspede" onClose={onClose} size="large">
      <div className="guest-detail-content">
        <header className="guest-detail-hero">
          <div className="guest-detail-identity">
            <div className="guest-identity-chip"><UserOutlined /> {guestName}</div>
            <Tag color="success">Cadastrado</Tag>
          </div>
          <div className="guest-detail-actions">
            <Button icon={<EditOutlined />} onClick={() => onEdit(guest)} type="primary">Editar hóspede</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(guest)}>Excluir hóspede</Button>
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

export function GuestFormModal({
  error,
  guest,
  isSubmitting,
  layer,
  onCancel,
  onSubmit,
}: {
  error: Error | null;
  guest?: AdminGuest;
  isSubmitting: boolean;
  layer: 'primary' | 'secondary';
  onCancel: () => void;
  onSubmit: (values: GuestFormValues) => void;
}) {
  const formValues = useMemo<GuestFormValues>(() => guest
    ? { firstName: guest.firstName, lastName: guest.lastName, phoneNumber: guest.phoneNumber }
    : { firstName: '', lastName: '', phoneNumber: '' }, [guest]);
  const { control, formState: { errors }, handleSubmit } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    values: formValues,
  });

  return (
    <Modal className="operational-form-modal guest-form-modal" layer={layer} title={guest ? 'Editar hóspede' : 'Novo hóspede'} onClose={onCancel} width={600}>
      <form className="guest-modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label>Nome
          <Controller control={control} name="firstName" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.firstName)} autoFocus />} />
          <FieldError message={errors.firstName?.message} />
        </label>
        <label>Sobrenome
          <Controller control={control} name="lastName" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.lastName)} />} />
          <FieldError message={errors.lastName?.message} />
        </label>
        <label className="guest-form-wide">Telefone
          <Controller control={control} name="phoneNumber" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.phoneNumber)} inputMode="tel" placeholder="Informe o telefone com DDD" />} />
          <FieldError message={errors.phoneNumber?.message} />
        </label>
        {error ? <Toast message={error.message} onClose={() => undefined} tone="error" /> : null}
        <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={guest ? 'Salvar alterações' : 'Cadastrar hóspede'} />
      </form>
    </Modal>
  );
}

function GuestDeleteModal({ error, guest, isDeleting, layer, onCancel, onConfirm }: { error: Error | null; guest: AdminGuest; isDeleting: boolean; layer: 'primary' | 'secondary'; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal layer={layer} title="Excluir hóspede?" onClose={onCancel} size="compact">
      <div className="confirmation-summary">
        <strong>{guest.firstName} {guest.lastName}</strong>
        <span><PhoneOutlined /> {guest.maskedPhone}</span>
      </div>
      <p className="muted-text">O cadastro deixará de aparecer nas listagens, mas os dados vinculados às estadias serão preservados.</p>
      {error ? <Toast message={error.message} onClose={() => undefined} tone="error" /> : null}
      <div className="modal-footer">
        <Button disabled={isDeleting} onClick={onCancel}>Cancelar</Button>
        <Button danger loading={isDeleting} onClick={onConfirm} type="primary">Excluir hóspede</Button>
      </div>
    </Modal>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

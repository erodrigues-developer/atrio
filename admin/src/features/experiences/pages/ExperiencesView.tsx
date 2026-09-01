import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  Button, Checkbox, DatePicker, Input, Select as AntSelect, Table, Tag, Typography, Upload,
} from 'antd';
import {
  CameraOutlined, ClockCircleOutlined, EnvironmentOutlined, EyeOutlined, FolderOutlined,
  PlusOutlined, SearchOutlined, StarOutlined, UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import experiencesEmptyImage from '@/assets/experiences-empty.webp';
import {
  createAdminExperience, createAdminExperienceCollection, createAdminExperienceSlot,
  linkExperienceToCollection, listAdminExperienceCollections, listAdminExperiences,
  listAdminExperienceSlots, updateAdminExperienceSlot, uploadAdminExperienceCollectionImage,
  uploadAdminExperienceImage, type AdminExperience, type AdminExperienceCollection,
  type AdminExperienceSlot,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import {
  ManagementEmptyState, ManagementPagination, MobileRecordCard, MobileRecordField, MobileRecordList,
} from '@/shared/components/PremiumManagement';
import { Toast } from '@/shared/components/Toast';
import {
  collectionFormSchema, experienceFormSchema, type CollectionFormValues, type ExperienceFormValues,
} from '../schemas/experience-form-schemas';

const PAGE_SIZE = 10;
const experienceDefaults: ExperienceFormValues = {
  id: '', title: '', description: '', category: 'Gastronomia', timeLabel: 'Hoje',
  priceLabel: 'Sob consulta', imageUrl: 'https://cdn.atrio.app/experiences/new-experience.webp',
  locationLabel: 'Hotel', included: '', published: true,
};
const collectionDefaults: CollectionFormValues = { id: '', title: '', description: '', imageUrl: '', featured: false, published: true };

export function ExperiencesView({ accessToken, cacheScope }: { accessToken: string; cacheScope: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [page, setPage] = useState(1);
  const [detailExperience, setDetailExperience] = useState<AdminExperience | null>(null);
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isSlotFormOpen, setIsSlotFormOpen] = useState(false);
  const [slotCandidate, setSlotCandidate] = useState<AdminExperienceSlot | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const experiencesQuery = useQuery({
    queryKey: adminQueryKeys.experienceList(cacheScope, { ...filters, page, pageSize: PAGE_SIZE }),
    queryFn: () => listAdminExperiences(accessToken, { ...filters, page, pageSize: PAGE_SIZE }),
  });
  const experienceCatalogQuery = useQuery({
    queryKey: adminQueryKeys.experienceList(cacheScope, { page: 1, pageSize: 100, purpose: 'catalog' }),
    queryFn: () => listAdminExperiences(accessToken, { page: 1, pageSize: 100 }),
  });
  const collectionsQuery = useQuery({ queryKey: adminQueryKeys.experienceCollections(cacheScope), queryFn: () => listAdminExperienceCollections(accessToken) });
  const experiences = experiencesQuery.data?.items ?? [];
  const experienceCatalog = useMemo(() => experienceCatalogQuery.data?.items ?? [], [experienceCatalogQuery.data?.items]);
  const collections = collectionsQuery.data ?? [];
  const currentDetail = detailExperience ? experiences.find((item) => item.id === detailExperience.id) ?? detailExperience : null;
  const slotsQuery = useQuery({
    queryKey: adminQueryKeys.experienceSlots(cacheScope, currentDetail?.id ?? ''),
    queryFn: () => listAdminExperienceSlots(accessToken, currentDetail?.id ?? ''),
    enabled: Boolean(currentDetail),
  });
  const categories = useMemo(() => [...new Set(experienceCatalog.map((experience) => experience.category))].sort(), [experienceCatalog]);
  const totalItems = experiencesQuery.data?.total ?? 0;
  const queryError = experiencesQuery.error ?? experienceCatalogQuery.error ?? collectionsQuery.error ?? slotsQuery.error;

  async function invalidateExperiences() {
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experiences(cacheScope) });
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({ search: search.trim(), category, status });
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setStatus('');
    setFilters({ search: '', category: '', status: '' });
    setPage(1);
  }

  async function createExperience(values: ExperienceFormValues) {
    setError(null);
    await createAdminExperience(accessToken, {
      ...(values.id ? { id: values.id } : {}),
      title: values.title, description: values.description, category: values.category,
      timeLabel: values.timeLabel, priceLabel: values.priceLabel, badge: null,
      imageUrl: values.imageUrl, durationLabel: null, availabilityLabel: null,
      locationLabel: values.locationLabel, locationDescription: null, policy: null,
      included: values.included.split(',').map((item) => item.trim()).filter(Boolean),
      published: values.published,
    });
    setIsExperienceFormOpen(false);
    setMessage('Experiência cadastrada com sucesso.');
    await invalidateExperiences();
  }

  async function createCollection(values: CollectionFormValues) {
    setError(null);
    await createAdminExperienceCollection(accessToken, { ...values, ...(values.id ? { id: values.id } : {}) });
    setMessage('Coleção cadastrada com sucesso.');
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceCollections(cacheScope) });
  }

  async function linkCollection(collectionId: string, experienceId: string, position: number) {
    setError(null);
    await linkExperienceToCollection(accessToken, collectionId, { experienceId, position });
    setMessage('Experiência vinculada à coleção com sucesso.');
  }

  async function createSlot(startsAt: string) {
    if (!currentDetail) return;
    setError(null);
    await createAdminExperienceSlot(accessToken, currentDetail.id, { startsAt: new Date(startsAt).toISOString(), isAvailable: true, position: 1 });
    setIsSlotFormOpen(false);
    setMessage('Horário cadastrado com sucesso.');
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceSlots(cacheScope, currentDetail.id) });
  }

  async function toggleSlot(slot: AdminExperienceSlot) {
    setError(null);
    await updateAdminExperienceSlot(accessToken, slot.experienceId, slot.id, { isAvailable: !slot.isAvailable });
    setMessage(slot.isAvailable ? 'Horário bloqueado com sucesso.' : 'Horário reaberto com sucesso.');
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceSlots(cacheScope, slot.experienceId) });
  }

  async function uploadExperienceImage(experience: AdminExperience, file: File) {
    setError(null);
    await uploadAdminExperienceImage(accessToken, experience.id, file);
    setDetailExperience(experience);
    setMessage('Imagem da experiência atualizada com sucesso.');
    await invalidateExperiences();
  }

  async function uploadCollectionImage(collectionId: string, file: File) {
    setError(null);
    await uploadAdminExperienceCollectionImage(accessToken, collectionId, file);
    setMessage('Imagem da coleção atualizada com sucesso.');
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceCollections(cacheScope) });
  }

  async function safely(action: () => Promise<void>, fallback: string) {
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallback);
    }
  }

  return (
    <div className="premium-management-layout experiences-layout">
      <header className="page-heading premium-page-heading">
        <div><Typography.Title level={1}>Experiências</Typography.Title><p>Organize experiências, coleções, imagens e horários disponíveis aos hóspedes.</p></div>
        <div className="premium-page-actions">
          <Button icon={<FolderOutlined />} onClick={() => setIsCollectionsOpen(true)} size="large">Coleções</Button>
          <Button icon={<PlusOutlined />} onClick={() => setIsExperienceFormOpen(true)} size="large" type="primary">Nova experiência</Button>
        </div>
      </header>

      <section className="premium-filter-panel">
        <form className="premium-toolbar premium-toolbar-wide" onSubmit={applyFilters}>
          <label className="premium-filter-field premium-filter-search"><span>Buscar experiência</span><Input aria-label="Buscar experiência" placeholder="Buscar por título, descrição ou local" prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label className="premium-filter-field"><span>Categoria</span><AntSelect aria-label="Categoria" onChange={setCategory} options={[{ label: 'Todas', value: '' }, ...categories.map((value) => ({ label: value, value }))]} value={category} /></label>
          <label className="premium-filter-field"><span>Status</span><AntSelect aria-label="Status da experiência" onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Publicadas', value: 'published' }, { label: 'Rascunhos', value: 'draft' }]} value={status} /></label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button><Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel premium-results-panel">
        <header className="premium-results-header"><span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span></header>
        {message || error || queryError ? <Toast tone={error || queryError ? 'error' : 'success'} message={(queryError instanceof Error ? queryError.message : error) ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
        <ExperiencesTable
          emptyContent={<ManagementEmptyState actions={<><Button onClick={clearFilters}>Limpar filtros</Button><Button icon={<PlusOutlined />} onClick={() => setIsExperienceFormOpen(true)} type="primary">Nova experiência</Button></>} alt="Mapa, marcador, estrela e câmera representando experiências" description="Ajuste os filtros ou cadastre uma experiência para iniciar o catálogo." image={experiencesEmptyImage} title="Nenhuma experiência encontrada" />}
          experiences={experiences}
          isLoading={experiencesQuery.isLoading}
          onSelect={setDetailExperience}
        />
        <ManagementPagination currentPage={page} pageSize={PAGE_SIZE} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {currentDetail ? <ExperienceDetailModal experience={currentDetail} isLoadingSlots={slotsQuery.isLoading} onAddSlot={() => setIsSlotFormOpen(true)} onClose={() => setDetailExperience(null)} onSlotAction={setSlotCandidate} onUpload={(file) => void safely(() => uploadExperienceImage(currentDetail, file), 'Não foi possível enviar a imagem.')} slots={slotsQuery.data ?? []} /> : null}
      {isExperienceFormOpen ? <ExperienceFormModal onCancel={() => setIsExperienceFormOpen(false)} onSubmit={(values) => safely(() => createExperience(values), 'Não foi possível cadastrar a experiência.')} /> : null}
      {isCollectionsOpen ? <CollectionsModal collections={collections} experiences={experienceCatalog} onCancel={() => setIsCollectionsOpen(false)} onCreate={(values) => safely(() => createCollection(values), 'Não foi possível cadastrar a coleção.')} onLink={(collectionId, experienceId, position) => safely(() => linkCollection(collectionId, experienceId, position), 'Não foi possível vincular a experiência.')} onUpload={(collectionId, file) => void safely(() => uploadCollectionImage(collectionId, file), 'Não foi possível enviar a imagem.')} /> : null}
      {isSlotFormOpen && currentDetail ? <SlotFormModal onCancel={() => setIsSlotFormOpen(false)} onSubmit={(startsAt) => safely(() => createSlot(startsAt), 'Não foi possível cadastrar o horário.')} /> : null}
      {slotCandidate ? <SlotConfirmationModal onCancel={() => setSlotCandidate(null)} onConfirm={() => { void safely(() => toggleSlot(slotCandidate), 'Não foi possível alterar o horário.'); setSlotCandidate(null); }} slot={slotCandidate} /> : null}
    </div>
  );
}

function ExperiencesTable({ emptyContent, experiences, isLoading, onSelect }: { emptyContent: ReactNode; experiences: AdminExperience[]; isLoading: boolean; onSelect: (experience: AdminExperience) => void }) {
  return <><Table className="premium-data-table" columns={[
    { title: 'Experiência', key: 'title', render: (_: unknown, experience: AdminExperience) => <div className="experience-table-primary"><img alt="" src={experience.imageUrl} /><div><strong>{experience.title}</strong><span>{experience.locationLabel || 'Local não informado'}</span></div></div> },
    { title: 'Categoria', dataIndex: 'category', key: 'category' },
    { title: 'Preço', dataIndex: 'priceLabel', key: 'priceLabel' },
    { title: 'Quando', dataIndex: 'timeLabel', key: 'timeLabel' },
    { title: 'Status', key: 'status', render: (_: unknown, experience: AdminExperience) => <Tag color={experience.published ? 'success' : 'default'}>{experience.published ? 'Publicada' : 'Rascunho'}</Tag> },
    { title: 'Ações', key: 'actions', width: 96, render: (_: unknown, experience: AdminExperience) => <div className="premium-table-actions" onClick={(event) => event.stopPropagation()}><Button aria-label={`Ver detalhes de ${experience.title}`} icon={<EyeOutlined />} onClick={() => onSelect(experience)} title={`Ver detalhes de ${experience.title}`} type="text" /></div> },
  ]} dataSource={experiences} loading={isLoading} locale={{ emptyText: emptyContent }} onRow={(experience) => clickableRow(`Ver detalhes de ${experience.title}`, () => onSelect(experience))} pagination={false} rowClassName="clickable-row" rowKey="id" scroll={{ x: 900 }} />
  <MobileRecordList emptyContent={emptyContent} hasItems={experiences.length > 0} isLoading={isLoading}>
    {experiences.map((experience) => (
      <MobileRecordCard
        actions={<Button icon={<EyeOutlined />} onClick={() => onSelect(experience)}>Ver detalhes</Button>}
        badge={<Tag color={experience.published ? 'success' : 'default'}>{experience.published ? 'Publicada' : 'Rascunho'}</Tag>}
        image={<img alt="" src={experience.imageUrl} />}
        key={experience.id}
        onSelect={() => onSelect(experience)}
        subtitle={experience.locationLabel || 'Local não informado'}
        title={experience.title}
      >
        <MobileRecordField label="Categoria" value={experience.category} />
        <MobileRecordField label="Preço" value={experience.priceLabel} />
        <MobileRecordField label="Quando" value={experience.timeLabel} />
      </MobileRecordCard>
    ))}
  </MobileRecordList></>;
}

function ExperienceDetailModal({ experience, isLoadingSlots, onAddSlot, onClose, onSlotAction, onUpload, slots }: { experience: AdminExperience; isLoadingSlots: boolean; onAddSlot: () => void; onClose: () => void; onSlotAction: (slot: AdminExperienceSlot) => void; onUpload: (file: File) => void; slots: AdminExperienceSlot[] }) {
  return <Modal title="Detalhes da experiência" onClose={onClose} size="large"><div className="premium-detail-content">
    <header className="premium-detail-hero"><div className="premium-detail-identity"><div className="premium-identity-chip"><StarOutlined /> {experience.title}</div><Tag color={experience.published ? 'success' : 'default'}>{experience.published ? 'Publicada' : 'Rascunho'}</Tag></div><div className="premium-detail-actions"><Button icon={<PlusOutlined />} onClick={onAddSlot} type="primary">Adicionar horário</Button><Upload accept="image/*" beforeUpload={(file) => { onUpload(file); return false; }} showUploadList={false}><Button aria-label="Atualizar imagem" icon={<CameraOutlined />} title="Atualizar imagem" /></Upload></div></header>
    <div className="experience-detail-hero-image"><img alt={experience.title} src={experience.imageUrl} /><p>{experience.description}</p></div>
    <section className="premium-summary-grid"><article className="premium-summary-card"><span>Categoria</span><strong><StarOutlined /> {experience.category}</strong><small>Tipo de experiência</small></article><article className="premium-summary-card"><span>Local</span><strong><EnvironmentOutlined /> {experience.locationLabel || 'Não informado'}</strong><small>{experience.timeLabel}</small></article><article className="premium-summary-card"><span>Preço</span><strong>{experience.priceLabel}</strong><small>{experience.published ? 'Disponível aos hóspedes' : 'Salva como rascunho'}</small></article></section>
    {experience.included.length ? <section className="premium-copy-panel"><div><span>Itens incluídos</span><p>{experience.included.join(' · ')}</p></div></section> : null}
    <ExperienceSlotsPanel isLoading={isLoadingSlots} onAdd={onAddSlot} onAction={onSlotAction} slots={slots} />
  </div></Modal>;
}

function ExperienceFormModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (values: ExperienceFormValues) => Promise<void> }) {
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<ExperienceFormValues>({ resolver: zodResolver(experienceFormSchema), defaultValues: experienceDefaults });
  return <Modal className="operational-form-modal experience-form-modal" title="Nova experiência" onClose={onCancel} width={700}><form className="premium-modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
    <label className="premium-form-wide">ID opcional<Input {...register('id')} placeholder="Identificador técnico opcional" /></label>
    <label>Título<Input {...register('title')} aria-invalid={Boolean(errors.title)} autoFocus /><FieldError message={errors.title?.message} /></label><label>Categoria<Input {...register('category')} aria-invalid={Boolean(errors.category)} /><FieldError message={errors.category?.message} /></label>
    <label className="premium-form-wide">Descrição<Input.TextArea {...register('description')} aria-invalid={Boolean(errors.description)} autoSize={{ minRows: 2, maxRows: 4 }} /><FieldError message={errors.description?.message} /></label>
    <label>Quando<Input {...register('timeLabel')} /></label><label>Preço<Input {...register('priceLabel')} aria-invalid={Boolean(errors.priceLabel)} /><FieldError message={errors.priceLabel?.message} /></label>
    <label>Local<Input {...register('locationLabel')} /></label><label>Itens incluídos<Input {...register('included')} placeholder="Separe os itens por vírgula" /></label>
    <label className="premium-form-wide">URL da imagem<Input {...register('imageUrl')} aria-invalid={Boolean(errors.imageUrl)} /><FieldError message={errors.imageUrl?.message} /></label>
    <label className="premium-form-check"><Controller control={control} name="published" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />Publicada no catálogo</label>
    <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel="Cadastrar experiência" />
  </form></Modal>;
}

function CollectionsModal({ collections, experiences, onCancel, onCreate, onLink, onUpload }: { collections: AdminExperienceCollection[]; experiences: AdminExperience[]; onCancel: () => void; onCreate: (values: CollectionFormValues) => Promise<void>; onLink: (collectionId: string, experienceId: string, position: number) => Promise<void>; onUpload: (collectionId: string, file: File) => void }) {
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<CollectionFormValues>({ resolver: zodResolver(collectionFormSchema), defaultValues: collectionDefaults });
  const [link, setLink] = useState({ collectionId: '', experienceId: '', position: 1 });
  return <Modal title="Coleções de experiências" onClose={onCancel} size="large"><div className="collections-modal-content">
    <CollectionsList collections={collections} onUpload={onUpload} />
    <div className="collections-forms-grid"><form className="collection-compact-form" noValidate onSubmit={handleSubmit(onCreate)}><Typography.Title level={3}>Nova coleção</Typography.Title><label>Título<Input {...register('title')} aria-invalid={Boolean(errors.title)} /><FieldError message={errors.title?.message} /></label><label>Descrição<Input {...register('description')} aria-invalid={Boolean(errors.description)} /><FieldError message={errors.description?.message} /></label><label>URL da imagem<Input {...register('imageUrl')} aria-invalid={Boolean(errors.imageUrl)} /><FieldError message={errors.imageUrl?.message} /></label><div className="collection-checks"><label><Controller control={control} name="featured" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />Destaque</label><label><Controller control={control} name="published" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />Publicada</label></div><Button htmlType="submit" loading={isSubmitting} type="primary">Cadastrar coleção</Button></form>
    <form className="collection-compact-form" onSubmit={(event) => { event.preventDefault(); void onLink(link.collectionId, link.experienceId, link.position); }}><Typography.Title level={3}>Vincular experiência</Typography.Title><label>Coleção<AntSelect onChange={(value) => setLink({ ...link, collectionId: value ?? '' })} options={collections.map((item) => ({ label: item.title, value: item.id }))} placeholder="Selecione" value={link.collectionId || null} /></label><label>Experiência<AntSelect onChange={(value) => setLink({ ...link, experienceId: value ?? '' })} options={experiences.map((item) => ({ label: item.title, value: item.id }))} placeholder="Selecione" value={link.experienceId || null} /></label><label>Posição<Input min={1} onChange={(event) => setLink({ ...link, position: Math.max(1, Number(event.target.value)) })} type="number" value={link.position} /></label><Button disabled={!link.collectionId || !link.experienceId} htmlType="submit">Vincular à coleção</Button></form></div>
  </div></Modal>;
}

function ExperienceSlotsPanel({ isLoading, onAction, onAdd, slots }: { isLoading: boolean; onAction: (slot: AdminExperienceSlot) => void; onAdd: () => void; slots: AdminExperienceSlot[] }) {
  return <section className="premium-embedded-panel"><header><Typography.Title level={3}>Horários disponíveis</Typography.Title><Button icon={<PlusOutlined />} onClick={onAdd} size="small">Novo horário</Button></header>
    <Table columns={[{ title: 'Data', dataIndex: 'dateLabel', key: 'dateLabel' }, { title: 'Horário', dataIndex: 'time', key: 'time' }, { title: 'Status', key: 'status', render: (_: unknown, slot: AdminExperienceSlot) => <Tag color={slot.isAvailable ? 'success' : 'default'}>{slot.isAvailable ? 'Disponível' : 'Bloqueado'}</Tag> }, { title: 'Ações', key: 'actions', align: 'right', render: (_: unknown, slot: AdminExperienceSlot) => <Button danger={slot.isAvailable} onClick={() => onAction(slot)} size="small" type="text">{slot.isAvailable ? 'Bloquear' : 'Reabrir'}</Button> }]} dataSource={slots} loading={isLoading} locale={{ emptyText: 'Nenhum horário cadastrado.' }} pagination={false} rowKey="id" scroll={{ x: 560 }} size="small" />
    <MobileRecordList emptyContent="Nenhum horário cadastrado." hasItems={slots.length > 0} isLoading={isLoading}>{slots.map((slot) => <MobileRecordCard actions={<Button danger={slot.isAvailable} onClick={() => onAction(slot)}>{slot.isAvailable ? 'Bloquear' : 'Reabrir'}</Button>} badge={<Tag color={slot.isAvailable ? 'success' : 'default'}>{slot.isAvailable ? 'Disponível' : 'Bloqueado'}</Tag>} key={slot.id} subtitle={slot.time} title={slot.dateLabel}><MobileRecordField label="Horário" value={slot.time} /></MobileRecordCard>)}</MobileRecordList>
  </section>;
}

function CollectionsList({ collections, onUpload }: { collections: AdminExperienceCollection[]; onUpload: (collectionId: string, file: File) => void }) {
  return <section className="premium-embedded-panel"><header><Typography.Title level={3}>Coleções cadastradas</Typography.Title></header>
    <Table columns={[{ title: 'Coleção', dataIndex: 'title', key: 'title' }, { title: 'Status', key: 'status', render: (_: unknown, collection: AdminExperienceCollection) => <Tag color={collection.published ? 'success' : 'default'}>{collection.published ? 'Publicada' : 'Rascunho'}</Tag> }, { title: 'Destaque', key: 'featured', render: (_: unknown, collection: AdminExperienceCollection) => collection.featured ? 'Sim' : 'Não' }, { title: 'Mídia', key: 'media', align: 'right', render: (_: unknown, collection: AdminExperienceCollection) => <Upload accept="image/*" beforeUpload={(file) => { onUpload(collection.id, file); return false; }} showUploadList={false}><Button icon={<UploadOutlined />} size="small">Enviar imagem</Button></Upload> }]} dataSource={collections} locale={{ emptyText: 'Nenhuma coleção cadastrada.' }} pagination={false} rowKey="id" scroll={{ x: 620 }} size="small" />
    <MobileRecordList emptyContent="Nenhuma coleção cadastrada." hasItems={collections.length > 0} isLoading={false}>{collections.map((collection) => <MobileRecordCard actions={<Upload accept="image/*" beforeUpload={(file) => { onUpload(collection.id, file); return false; }} showUploadList={false}><Button icon={<UploadOutlined />}>Enviar imagem</Button></Upload>} badge={<Tag color={collection.published ? 'success' : 'default'}>{collection.published ? 'Publicada' : 'Rascunho'}</Tag>} key={collection.id} subtitle={collection.featured ? 'Em destaque' : 'Coleção padrão'} title={collection.title}><MobileRecordField label="Destaque" value={collection.featured ? 'Sim' : 'Não'} /></MobileRecordCard>)}</MobileRecordList>
  </section>;
}

function SlotFormModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (startsAt: string) => Promise<void> }) {
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);
  return <Modal layer="secondary" title="Novo horário" onClose={onCancel} size="compact"><form className="slot-modal-form" onSubmit={(event) => { event.preventDefault(); setIsSubmitting(true); void onSubmit(startsAt).finally(() => setIsSubmitting(false)); }}><label>Data e hora<DatePicker format="DD/MM/YYYY HH:mm" onChange={(value) => setStartsAt(value?.format('YYYY-MM-DDTHH:mm') ?? '')} showTime value={startsAt ? dayjs(startsAt) : null} /></label><div className="modal-footer"><Button onClick={onCancel}>Cancelar</Button><Button htmlType="submit" loading={isSubmitting} type="primary">Cadastrar horário</Button></div></form></Modal>;
}

function SlotConfirmationModal({ onCancel, onConfirm, slot }: { onCancel: () => void; onConfirm: () => void; slot: AdminExperienceSlot }) {
  return <Modal layer="secondary" title={slot.isAvailable ? 'Bloquear horário?' : 'Reabrir horário?'} onClose={onCancel} size="compact"><div className="confirmation-summary"><strong>{slot.dateLabel}</strong><span><ClockCircleOutlined /> {slot.time}</span></div><p className="muted-text">O horário será {slot.isAvailable ? 'bloqueado para novas reservas' : 'reaberto para reservas'}.</p><div className="modal-footer"><Button onClick={onCancel}>Cancelar</Button><Button danger={slot.isAvailable} onClick={onConfirm} type="primary">{slot.isAvailable ? 'Bloquear horário' : 'Reabrir horário'}</Button></div></Modal>;
}

function clickableRow(label: string, onSelect: () => void) {
  return { 'aria-label': label, onClick: onSelect, onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }, role: 'button', tabIndex: 0 };
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

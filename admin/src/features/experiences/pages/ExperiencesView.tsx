import { FormEvent, useState } from 'react';
import { Button, Checkbox, DatePicker, Input, Select as AntSelect, Table, Tag, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAdminExperience, createAdminExperienceCollection, createAdminExperienceSlot,
  linkExperienceToCollection, listAdminExperienceCollections, listAdminExperiences,
  listAdminExperienceSlots, updateAdminExperienceSlot, uploadAdminExperienceCollectionImage,
  uploadAdminExperienceImage, type AdminExperience,
  type AdminExperienceSlot,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { ConfirmActionModal } from '@/shared/components/Modal';
import { MiniList } from '@/shared/components/MiniList';
import { Toast } from '@/shared/components/Toast';
import {
  collectionFormSchema, experienceFormSchema, type CollectionFormValues, type ExperienceFormValues,
} from '../schemas/experience-form-schemas';

const experienceDefaults: ExperienceFormValues = {
  id: '', title: '', description: '', category: 'Gastronomia', timeLabel: 'Hoje',
  priceLabel: 'Sob consulta', imageUrl: 'https://cdn.atrio.app/experiences/new-experience.webp',
  locationLabel: 'Hotel', included: '', published: true,
};
const collectionDefaults: CollectionFormValues = { id: '', title: '', description: '', imageUrl: '', featured: false, published: true };

export function ExperiencesView({ accessToken, cacheScope }: { accessToken: string; cacheScope: string }) {
  const queryClient = useQueryClient();
  const [selectedExperienceId, setSelectedExperienceId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slotCandidate, setSlotCandidate] = useState<AdminExperienceSlot | null>(null);
  const experienceForm = useForm<ExperienceFormValues>({ resolver: zodResolver(experienceFormSchema), defaultValues: experienceDefaults });
  const collectionForm = useForm<CollectionFormValues>({ resolver: zodResolver(collectionFormSchema), defaultValues: collectionDefaults });
  const [linkForm, setLinkForm] = useState({ collectionId: '', experienceId: '', position: 1 });
  const [slotForm, setSlotForm] = useState({ startsAt: new Date().toISOString().slice(0, 16), isAvailable: true, position: 1 });

  const experiencesQuery = useQuery({ queryKey: adminQueryKeys.experiences(cacheScope), queryFn: () => listAdminExperiences(accessToken) });
  const collectionsQuery = useQuery({ queryKey: adminQueryKeys.experienceCollections(cacheScope), queryFn: () => listAdminExperienceCollections(accessToken) });
  const experiences = experiencesQuery.data ?? [];
  const collections = collectionsQuery.data ?? [];
  const currentExperienceId = selectedExperienceId || experiences[0]?.id || '';
  const slotsQuery = useQuery({
    queryKey: adminQueryKeys.experienceSlots(cacheScope, currentExperienceId),
    queryFn: () => listAdminExperienceSlots(accessToken, currentExperienceId),
    enabled: Boolean(currentExperienceId),
  });
  const slots = slotsQuery.data ?? [];
  const queryError = experiencesQuery.error ?? collectionsQuery.error ?? slotsQuery.error;

  async function invalidateExperiences() {
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experiences(cacheScope) });
  }

  async function handleExperienceSubmit(values: ExperienceFormValues) {
    setMessage(null);
    setError(null);
    try {
      await createAdminExperience(accessToken, {
        ...(values.id ? { id: values.id } : {}),
        title: values.title,
        description: values.description,
        category: values.category,
        timeLabel: values.timeLabel,
        priceLabel: values.priceLabel,
        badge: null,
        imageUrl: values.imageUrl,
        durationLabel: null,
        availabilityLabel: null,
        locationLabel: values.locationLabel,
        locationDescription: null,
        policy: null,
        included: values.included.split(',').map((item) => item.trim()).filter(Boolean),
        published: values.published,
      });
      setMessage('Experiência cadastrada.');
      experienceForm.reset(experienceDefaults);
      setSelectedExperienceId('');
      await invalidateExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar experiência.');
    }
  }

  async function handleCollectionSubmit(values: CollectionFormValues) {
    setMessage(null);
    setError(null);
    try {
      await createAdminExperienceCollection(accessToken, {
        ...values,
        ...(values.id ? { id: values.id } : {}),
      });
      setMessage('Colecao cadastrada.');
      collectionForm.reset(collectionDefaults);
      await invalidateExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar coleção.');
    }
  }

  async function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await linkExperienceToCollection(accessToken, linkForm.collectionId, {
        experienceId: linkForm.experienceId,
        position: Number(linkForm.position),
      });
      setMessage('Experiência vinculada a coleção.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível vincular experiência.');
    }
  }

  async function handleSlotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentExperienceId) return;
    setMessage(null);
    setError(null);
    try {
      await createAdminExperienceSlot(accessToken, currentExperienceId, {
        startsAt: new Date(slotForm.startsAt).toISOString(),
        isAvailable: slotForm.isAvailable,
        position: Number(slotForm.position),
      });
      setMessage('Horário cadastrado.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceSlots(cacheScope, currentExperienceId) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar horario.');
    }
  }

  async function toggleSlot(slot: AdminExperienceSlot) {
    setMessage(null);
    setError(null);
    try {
      await updateAdminExperienceSlot(accessToken, slot.experienceId, slot.id, { isAvailable: !slot.isAvailable });
      setMessage(slot.isAvailable ? 'Horário bloqueado.' : 'Horário reaberto.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.experienceSlots(cacheScope, slot.experienceId) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar horário.');
    }
  }

  async function handleExperienceImageUpload(experienceId: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setMessage(null);
    setError(null);
    try {
      await uploadAdminExperienceImage(accessToken, experienceId, file);
      setMessage('Imagem da experiência atualizada.');
      setSelectedExperienceId(experienceId);
      await invalidateExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    }
  }

  async function handleCollectionImageUpload(collectionId: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setMessage(null);
    setError(null);
    try {
      await uploadAdminExperienceCollectionImage(accessToken, collectionId, file);
      setMessage('Imagem da coleção atualizada.');
      await invalidateExperiences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    }
  }

  return (
    <div className="management-grid wide">
      <section className="table-panel">
        <header className="panel-toolbar"><Typography.Title level={2}>Experiências</Typography.Title></header>
        {message || error || queryError ? <Toast tone={error || queryError ? 'error' : 'success'} message={(queryError instanceof Error ? queryError.message : error) ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
        <Table
          columns={[
            { title: 'Titulo', key: 'title', render: (_: unknown, experience: AdminExperience) => <><strong>{experience.title}</strong><br /><span className="muted-text">{experience.locationLabel || '-'}</span></> },
            { title: 'Categoria', dataIndex: 'category', key: 'category' },
            { title: 'Status', key: 'status', render: (_: unknown, experience: AdminExperience) => <Tag>{experience.published ? 'Publicado' : 'Rascunho'}</Tag> },
            { title: 'Midia', key: 'media', render: (_: unknown, experience: AdminExperience) => <Upload accept="image/*" beforeUpload={(file) => { const files = new DataTransfer(); files.items.add(file); void handleExperienceImageUpload(experience.id, files.files); return false; }} showUploadList={false}><Button size="small">Enviar imagem</Button></Upload> },
            { title: 'Agenda', key: 'schedule', render: (_: unknown, experience: AdminExperience) => <Button onClick={() => setSelectedExperienceId(experience.id)} size="small">Ver horários</Button> },
          ]}
          dataSource={experiences}
          pagination={false}
          rowClassName={(experience) => experience.id === currentExperienceId ? 'selected-row' : ''}
          rowKey="id"
        />
        <section className="subsection">
          <Typography.Title level={2}>Colecoes</Typography.Title>
          {collections.length === 0 ? <p className="mini-empty">Sem colecoes.</p> : (
            <ul className="mini-list">
              {collections.map((collection) => (
                <li className="media-list-item" key={collection.id}>
                  <span>{collection.title} - {collection.published ? 'publicada' : 'rascunho'}</span>
                  <Upload accept="image/*" beforeUpload={(file) => { const files = new DataTransfer(); files.items.add(file); void handleCollectionImageUpload(collection.id, files.files); return false; }} showUploadList={false}><Button size="small">Enviar imagem</Button></Upload>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="subsection">
          <Typography.Title level={2}>Horários</Typography.Title>
          <MiniList items={slots.map((slot) => `${slot.dateLabel} ${slot.time} - ${slot.isAvailable ? 'disponivel' : 'bloqueado'}`)} emptyLabel="Sem horarios." />
          <div className="row-actions wrap">
            {slots.map((slot) => (
              <Button className="ghost-button compact" key={slot.id} onClick={() => setSlotCandidate(slot)} size="small">
                {slot.isAvailable ? 'Bloquear' : 'Reabrir'} {slot.time}
              </Button>
            ))}
          </div>
        </section>
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Nova experiência</Typography.Title>
        <form className="stack-form" noValidate onSubmit={experienceForm.handleSubmit(handleExperienceSubmit)}>
          <label>ID opcional<Input {...experienceForm.register('id')} /></label>
          <label>Título<Input {...experienceForm.register('title')} aria-invalid={Boolean(experienceForm.formState.errors.title)} /></label>
          <FieldError message={experienceForm.formState.errors.title?.message} />
          <label>Descrição<Input {...experienceForm.register('description')} aria-invalid={Boolean(experienceForm.formState.errors.description)} /></label>
          <FieldError message={experienceForm.formState.errors.description?.message} />
          <div className="two-columns">
            <label>Categoria<Input {...experienceForm.register('category')} aria-invalid={Boolean(experienceForm.formState.errors.category)} /></label>
            <label>Preço<Input {...experienceForm.register('priceLabel')} aria-invalid={Boolean(experienceForm.formState.errors.priceLabel)} /></label>
          </div>
          <FieldError message={experienceForm.formState.errors.category?.message ?? experienceForm.formState.errors.priceLabel?.message} />
          <label>Imagem<Input {...experienceForm.register('imageUrl')} aria-invalid={Boolean(experienceForm.formState.errors.imageUrl)} /></label>
          <FieldError message={experienceForm.formState.errors.imageUrl?.message} />
          <label>Incluídos<Input {...experienceForm.register('included')} /></label>
          <label className="check-row"><Controller control={experienceForm.control} name="published" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} /> Publicada</label>
          <Button htmlType="submit" type="primary">Cadastrar experiência</Button>
        </form>
        <form className="stack-form section-form" noValidate onSubmit={collectionForm.handleSubmit(handleCollectionSubmit)}>
          <Typography.Title level={3}>Nova coleção</Typography.Title>
          <Input {...collectionForm.register('id')} placeholder="ID opcional" />
          <Input {...collectionForm.register('title')} aria-invalid={Boolean(collectionForm.formState.errors.title)} placeholder="Título" />
          <FieldError message={collectionForm.formState.errors.title?.message} />
          <Input {...collectionForm.register('description')} aria-invalid={Boolean(collectionForm.formState.errors.description)} placeholder="Descrição" />
          <FieldError message={collectionForm.formState.errors.description?.message} />
          <Input {...collectionForm.register('imageUrl')} aria-invalid={Boolean(collectionForm.formState.errors.imageUrl)} placeholder="URL da imagem" />
          <FieldError message={collectionForm.formState.errors.imageUrl?.message} />
          <label className="check-row"><Controller control={collectionForm.control} name="featured" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} /> Destaque</label>
          <Button htmlType="submit">Cadastrar coleção</Button>
        </form>
        <form className="stack-form section-form" onSubmit={handleLinkSubmit}>
          <Typography.Title level={3}>Vincular a coleção</Typography.Title>
          <AntSelect onChange={(value) => setLinkForm({ ...linkForm, collectionId: value ?? '' })} options={collections.map((collection) => ({ label: collection.title, value: collection.id }))} placeholder="Colecao" value={linkForm.collectionId || null} />
          <AntSelect onChange={(value) => setLinkForm({ ...linkForm, experienceId: value ?? '' })} options={experiences.map((experience) => ({ label: experience.title, value: experience.id }))} placeholder="Experiência" value={linkForm.experienceId || null} />
          <Button htmlType="submit">Vincular</Button>
        </form>
        <form className="stack-form section-form" onSubmit={handleSlotSubmit}>
          <Typography.Title level={3}>Novo horario</Typography.Title>
          <DatePicker showTime format="DD/MM/YYYY HH:mm" onChange={(value) => setSlotForm({ ...slotForm, startsAt: value?.format('YYYY-MM-DDTHH:mm') ?? '' })} value={slotForm.startsAt ? dayjs(slotForm.startsAt) : null} />
          <Button htmlType="submit">Cadastrar horario</Button>
        </form>
      </section>
      {slotCandidate ? (
        <ConfirmActionModal
          confirmLabel={slotCandidate.isAvailable ? 'Bloquear horário' : 'Reabrir horário'}
          message={`O horário ${slotCandidate.dateLabel} ${slotCandidate.time} será ${slotCandidate.isAvailable ? 'bloqueado para novas reservas' : 'reaberto para reservas'}.`}
          onCancel={() => setSlotCandidate(null)}
          onConfirm={() => {
            toggleSlot(slotCandidate);
            setSlotCandidate(null);
          }}
          title={slotCandidate.isAvailable ? 'Bloquear horário?' : 'Reabrir horário?'}
          tone={slotCandidate.isAvailable ? 'danger' : 'primary'}
        />
      ) : null}
    </div>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import {
  Button, Checkbox, Dropdown, Input, Pagination as AntPagination, Select as AntSelect, Table, Tag, Typography,
} from 'antd';
import {
  AppstoreOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FileTextOutlined, MoreOutlined, PlusOutlined,
  SearchOutlined, StopOutlined, TeamOutlined, UploadOutlined,
} from '@ant-design/icons';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import servicesEmptyImage from '@/assets/services-empty.webp';
import {
  createAdminService, listAdminServices, setAdminServicePublished, updateAdminService,
  type ServiceDefinition,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { MobileRecordCard, MobileRecordField, MobileRecordList } from '@/shared/components/PremiumManagement';
import { serviceFormSchema, type ServiceFormValues } from '../schemas/service-form-schema';

type ServicesViewProps = {
  accessToken: string;
  cacheScope: string;
};

type ServiceFilters = {
  search: string;
  status: '' | 'published' | 'draft';
};

const PAGE_SIZE = 10;
const defaultValues: ServiceFormValues = {
  id: '',
  title: '',
  description: '',
  icon: 'Package',
  fulfillmentType: 'hotel_staff',
  fields: [{ kind: 'note', label: 'Detalhes', required: true }],
  published: true,
};

const SERVICE_FIELD_OPTIONS = [
  { label: 'Quantidade — seletor com + e −', value: 'quantity' as const },
  { label: 'Observação — campo de texto', value: 'note' as const },
];

export function ServicesView({ accessToken, cacheScope }: ServicesViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ServiceFilters['status']>('');
  const [filters, setFilters] = useState<ServiceFilters>({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [detailService, setDetailService] = useState<ServiceDefinition | null>(null);
  const [formService, setFormService] = useState<ServiceDefinition | 'new' | null>(null);
  const [publishCandidate, setPublishCandidate] = useState<ServiceDefinition | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const servicesQuery = useQuery({
    queryKey: adminQueryKeys.serviceList(cacheScope, { ...filters, page, pageSize: PAGE_SIZE }),
    queryFn: () => listAdminServices(accessToken, { ...filters, page, pageSize: PAGE_SIZE }),
  });
  const saveMutation = useMutation({
    mutationFn: ({ service, values }: { service?: ServiceDefinition; values: ServiceFormValues }) => {
      const payload = servicePayload(values);
      return service
        ? updateAdminService(accessToken, service.id, payload)
        : createAdminService(accessToken, { ...payload, ...(values.id ? { id: values.id } : {}) });
    },
    onSuccess: async (savedService, variables) => {
      setFormService(null);
      setDetailService((current) => current?.id === savedService.id ? savedService : current);
      setMessage(variables.service ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.services(cacheScope) });
    },
  });
  const publishMutation = useMutation({
    mutationFn: (service: ServiceDefinition) => setAdminServicePublished(accessToken, service.id, !service.published),
    onSuccess: async (savedService, service) => {
      setDetailService((current) => current?.id === savedService.id ? savedService : current);
      setPage(1);
      setMessage(service.published ? 'Serviço despublicado com sucesso.' : 'Serviço publicado com sucesso.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.services(cacheScope) });
    },
  });

  const services = servicesQuery.data?.items ?? [];
  const totalItems = servicesQuery.data?.total ?? 0;
  const queryError = servicesQuery.error ?? publishMutation.error;

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

  function openCreateModal() {
    saveMutation.reset();
    setFormService('new');
  }

  function openEditModal(service: ServiceDefinition) {
    saveMutation.reset();
    setFormService(service);
  }

  return (
    <div className="services-layout">
      <header className="page-heading services-page-heading">
        <div>
          <Typography.Title level={1}>Serviços</Typography.Title>
          <p>Gerencie o catálogo de serviços oferecidos aos hóspedes durante a estadia.</p>
        </div>
        <Button icon={<PlusOutlined />} onClick={openCreateModal} size="large" type="primary">Novo serviço</Button>
      </header>

      <section className="services-filter-panel">
        <form className="services-toolbar" onSubmit={applyFilters}>
          <label className="services-filter-field">
            <span>Buscar serviço</span>
            <Input
              aria-label="Buscar serviço"
              placeholder="Buscar por título, descrição ou atendimento"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="services-filter-field">
            <span>Status</span>
            <AntSelect
              aria-label="Status do serviço"
              onChange={setStatus}
              options={[
                { label: 'Todos', value: '' },
                { label: 'Publicados', value: 'published' },
                { label: 'Rascunhos', value: 'draft' },
              ]}
              value={status}
            />
          </label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button>
          <Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel services-results-panel">
        <header className="services-results-header">
          <span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span>
        </header>
        {message || queryError ? (
          <Toast
            tone={queryError ? 'error' : 'success'}
            message={queryError instanceof Error ? queryError.message : message ?? ''}
            onClose={() => {
              setMessage(null);
              if (queryError) void servicesQuery.refetch();
            }}
          />
        ) : null}
        <ServicesTable
          emptyContent={<ServicesEmptyState onClearFilters={clearFilters} onCreate={openCreateModal} />}
          isLoading={servicesQuery.isLoading}
          onEdit={openEditModal}
          onPublish={setPublishCandidate}
          onSelect={setDetailService}
          services={services}
        />
        <ServicesPagination currentPage={page} totalItems={totalItems} onPageChange={setPage} />
      </section>

      {detailService ? (
        <ServiceDetailModal
          onClose={() => setDetailService(null)}
          onEdit={openEditModal}
          onPublish={setPublishCandidate}
          service={detailService}
        />
      ) : null}
      {formService ? (
        <ServiceFormModal
          error={saveMutation.error}
          isSubmitting={saveMutation.isPending}
          layer={detailService ? 'secondary' : 'primary'}
          onCancel={() => {
            saveMutation.reset();
            setFormService(null);
          }}
          onSubmit={(values) => saveMutation.mutate({
            values,
            ...(formService === 'new' ? {} : { service: formService }),
          })}
          {...(formService === 'new' ? {} : { service: formService })}
        />
      ) : null}
      {publishCandidate ? (
        <Modal
          layer={detailService ? 'secondary' : 'primary'}
          onClose={() => setPublishCandidate(null)}
          size="compact"
          title={publishCandidate.published ? 'Despublicar serviço?' : 'Publicar serviço?'}
        >
          <p className="muted-text">O serviço “{publishCandidate.title}” será {publishCandidate.published ? 'removido do catálogo publicado' : 'publicado no catálogo dos hóspedes'}.</p>
          <div className="modal-footer">
            <Button onClick={() => setPublishCandidate(null)}>Cancelar</Button>
            <Button
              danger={publishCandidate.published}
              onClick={() => {
                publishMutation.mutate(publishCandidate);
                setPublishCandidate(null);
              }}
              type="primary"
            >
              {publishCandidate.published ? 'Despublicar serviço' : 'Publicar serviço'}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function ServicesTable({
  emptyContent,
  isLoading,
  onEdit,
  onPublish,
  onSelect,
  services,
}: {
  emptyContent: ReactNode;
  isLoading: boolean;
  onEdit: (service: ServiceDefinition) => void;
  onPublish: (service: ServiceDefinition) => void;
  onSelect: (service: ServiceDefinition) => void;
  services: ServiceDefinition[];
}) {
  return (
    <>
    <Table
      className="services-table"
      columns={[
        {
          title: 'Serviço',
          key: 'service',
          render: (_: unknown, service: ServiceDefinition) => (
            <div className="service-table-primary">
              <strong>{service.title}</strong>
              <span>{service.description}</span>
            </div>
          ),
        },
        { title: 'Atendimento', dataIndex: 'fulfillmentType', key: 'fulfillmentType', render: serviceFulfillmentLabel },
        { title: 'Formulário', key: 'form', align: 'center', render: (_: unknown, service: ServiceDefinition) => `${service.requestSchema.fields.length} ${service.requestSchema.fields.length === 1 ? 'campo' : 'campos'}` },
        { title: 'Status', key: 'status', render: (_: unknown, service: ServiceDefinition) => <Tag color={service.published ? 'success' : 'default'}>{service.published ? 'Publicado' : 'Rascunho'}</Tag> },
        {
          title: 'Ações',
          key: 'actions',
          width: 148,
          render: (_: unknown, service: ServiceDefinition) => (
            <div className="service-table-actions" onClick={(event) => event.stopPropagation()}>
              <Button aria-label={`Ver detalhes de ${service.title}`} icon={<EyeOutlined />} onClick={() => onSelect(service)} title={`Ver detalhes de ${service.title}`} type="text" />
              <Button aria-label={`Editar ${service.title}`} icon={<EditOutlined />} onClick={() => onEdit(service)} title={`Editar ${service.title}`} type="text" />
              <Button
                aria-label={`${service.published ? 'Despublicar' : 'Publicar'} ${service.title}`}
                danger={service.published}
                icon={service.published ? <StopOutlined /> : <UploadOutlined />}
                onClick={() => onPublish(service)}
                title={`${service.published ? 'Despublicar' : 'Publicar'} ${service.title}`}
                type="text"
              />
            </div>
          ),
        },
      ]}
      dataSource={services}
      loading={isLoading}
      locale={{ emptyText: emptyContent }}
      onRow={(service) => ({
        'aria-label': `Ver detalhes de ${service.title}`,
        onClick: () => onSelect(service),
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(service);
          }
        },
        role: 'button',
        tabIndex: 0,
      })}
      pagination={false}
      rowClassName="clickable-row"
      rowKey="id"
      scroll={{ x: 840 }}
    />
    <MobileRecordList emptyContent={emptyContent} hasItems={services.length > 0} isLoading={isLoading}>
      {services.map((service) => (
        <MobileRecordCard
          actions={<>
            <Button icon={<EyeOutlined />} onClick={() => onSelect(service)}>Ver detalhes</Button>
            <Button icon={<EditOutlined />} onClick={() => onEdit(service)}>Editar</Button>
            <Button danger={service.published} icon={service.published ? <StopOutlined /> : <UploadOutlined />} onClick={() => onPublish(service)}>{service.published ? 'Despublicar' : 'Publicar'}</Button>
          </>}
          badge={<Tag color={service.published ? 'success' : 'default'}>{service.published ? 'Publicado' : 'Rascunho'}</Tag>}
          key={service.id}
          onSelect={() => onSelect(service)}
          subtitle={service.description}
          title={service.title}
        >
          <MobileRecordField label="Atendimento" value={serviceFulfillmentLabel(service.fulfillmentType)} />
          <MobileRecordField label="Formulário" value={`${service.requestSchema.fields.length} ${service.requestSchema.fields.length === 1 ? 'campo' : 'campos'}`} />
        </MobileRecordCard>
      ))}
    </MobileRecordList>
    </>
  );
}

function ServicesEmptyState({ onClearFilters, onCreate }: { onClearFilters: () => void; onCreate: () => void }) {
  return (
    <div className="services-empty-state">
      <img alt="Campainha de serviço de hotel, toalhas e itens de amenidades" src={servicesEmptyImage} />
      <Typography.Title level={3}>Nenhum serviço encontrado</Typography.Title>
      <p>Tente ajustar os filtros ou cadastre um novo serviço para o catálogo.</p>
      <div className="empty-state-actions">
        <Button onClick={onClearFilters}>Limpar filtros</Button>
        <Button icon={<PlusOutlined />} onClick={onCreate} type="primary">Novo serviço</Button>
      </div>
    </div>
  );
}

function ServicesPagination({
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
      <AntPagination current={currentPage} disabled={totalItems === 0} onChange={onPageChange} pageSize={PAGE_SIZE} showSizeChanger={false} total={Math.max(totalItems, 1)} />
    </footer>
  );
}

function ServiceDetailModal({
  onClose,
  onEdit,
  onPublish,
  service,
}: {
  onClose: () => void;
  onEdit: (service: ServiceDefinition) => void;
  onPublish: (service: ServiceDefinition) => void;
  service: ServiceDefinition;
}) {
  return (
    <Modal title="Detalhes do serviço" onClose={onClose} size="large">
      <div className="service-detail-content">
        <header className="service-detail-hero">
          <div className="service-detail-identity">
            <div className="service-identity-chip"><AppstoreOutlined /> {service.title}</div>
            <Tag color={service.published ? 'success' : 'default'}>{service.published ? 'Publicado' : 'Rascunho'}</Tag>
          </div>
          <div className="service-detail-actions">
            <Button icon={<EditOutlined />} onClick={() => onEdit(service)} type="primary">Editar serviço</Button>
            <Dropdown
              menu={{
                items: [{
                  danger: service.published,
                  icon: service.published ? <StopOutlined /> : <UploadOutlined />,
                  key: 'publication',
                  label: service.published ? 'Despublicar serviço' : 'Publicar serviço',
                }],
                onClick: () => onPublish(service),
              }}
            >
              <Button aria-label="Mais ações" icon={<MoreOutlined />} title="Mais ações" />
            </Dropdown>
          </div>
        </header>
        <p className="service-detail-description">{service.description}</p>
        <section className="service-summary-grid">
          <article className="service-summary-card">
            <span>Atendimento</span>
            <strong><TeamOutlined /> {serviceFulfillmentLabel(service.fulfillmentType)}</strong>
            <small>Responsável pela execução</small>
          </article>
          <article className="service-summary-card">
            <span>Formulário</span>
            <strong><FileTextOutlined /> {service.requestSchema.fields.length} {service.requestSchema.fields.length === 1 ? 'campo' : 'campos'}</strong>
            <small>Informações solicitadas ao hóspede</small>
          </article>
          <article className="service-summary-card">
            <span>Visibilidade</span>
            <strong><AppstoreOutlined /> {service.published ? 'Disponível no catálogo' : 'Oculto do catálogo'}</strong>
            <small>{service.published ? 'Publicado para os hóspedes' : 'Salvo como rascunho'}</small>
          </article>
        </section>
        <ServiceFieldsPanel fields={service.requestSchema.fields} />
      </div>
    </Modal>
  );
}

function ServiceFieldsPanel({ fields }: { fields: Array<Record<string, unknown>> }) {
  const fieldRecords: Array<Record<string, unknown> & { _key: string }> = fields.map((field, index) => ({
    ...field,
    _key: `${textValue(field.name, 'field')}-${index}`,
  }));
  return (
    <section className="service-fields-panel">
      <header><Typography.Title level={3}>Campos do formulário</Typography.Title></header>
      <Table
        columns={[
          { title: 'Campo exibido no app', key: 'component', render: (_: unknown, field: Record<string, unknown>) => serviceFieldLabel(serviceFieldKind(field)) },
          { title: 'Rótulo para o hóspede', key: 'label', render: (_: unknown, field: Record<string, unknown>) => textValue(field.label, '—') },
          { title: 'Chave técnica', key: 'name', render: (_: unknown, field: Record<string, unknown>) => textValue(field.name, '—') },
          { title: 'Obrigatório', key: 'required', render: (_: unknown, field: Record<string, unknown>) => field.required ? 'Sim' : 'Não' },
        ]}
        dataSource={fieldRecords}
        locale={{ emptyText: 'Nenhum campo configurado.' }}
        pagination={false}
        rowKey="_key"
        scroll={{ x: 560 }}
        size="small"
      />
      <MobileRecordList emptyContent="Nenhum campo configurado." hasItems={fieldRecords.length > 0} isLoading={false}>
        {fieldRecords.map((field) => (
          <MobileRecordCard key={String(field._key)} title={textValue(field.label, 'Campo sem rótulo')} subtitle={serviceFieldLabel(serviceFieldKind(field))}>
            <MobileRecordField label="Chave técnica" value={textValue(field.name, '—')} />
            <MobileRecordField label="Obrigatório" value={field.required ? 'Sim' : 'Não'} />
          </MobileRecordCard>
        ))}
      </MobileRecordList>
    </section>
  );
}

export function ServiceFormModal({
  error,
  isSubmitting,
  layer,
  onCancel,
  onSubmit,
  service,
}: {
  error: Error | null;
  isSubmitting: boolean;
  layer: 'primary' | 'secondary';
  onCancel: () => void;
  onSubmit: (values: ServiceFormValues) => void;
  service?: ServiceDefinition;
}) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service ? serviceFormValues(service) : defaultValues,
  });

  useEffect(() => {
    reset(service ? serviceFormValues(service) : defaultValues);
  }, [reset, service]);

  const { append, fields: fieldRows, remove } = useFieldArray({ control, name: 'fields' });
  const configuredFields = useWatch({ control, name: 'fields' }) ?? [];

  function addField() {
    const availableKind = SERVICE_FIELD_OPTIONS.find(
      (option) => !configuredFields.some((field) => field.kind === option.value),
    )?.value;
    if (!availableKind) return;
    append(availableKind === 'quantity'
      ? { kind: 'quantity', label: 'Quantidade', required: true }
      : { kind: 'note', label: 'Detalhes', required: false });
  }

  return (
    <Modal className="operational-form-modal service-form-modal" layer={layer} title={service ? 'Editar serviço' : 'Novo serviço'} onClose={onCancel} width={600}>
      <form className="service-modal-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        {!service ? <label className="service-form-wide">ID opcional<Controller control={control} name="id" render={({ field }) => <Input {...field} placeholder="Identificador técnico opcional" />} /></label> : null}
        <label>Título
          <Controller control={control} name="title" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.title)} autoFocus />} />
          <FieldError message={errors.title?.message} />
        </label>
        <label>Ícone
          <Controller control={control} name="icon" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.icon)} />} />
          <FieldError message={errors.icon?.message} />
        </label>
        <label className="service-form-wide">Descrição
          <Controller control={control} name="description" render={({ field }) => <Input.TextArea {...field} aria-invalid={Boolean(errors.description)} autoSize={{ minRows: 2, maxRows: 4 }} />} />
          <FieldError message={errors.description?.message} />
        </label>
        <label>Atendimento
          <Controller control={control} name="fulfillmentType" render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.fulfillmentType)} />} />
          <FieldError message={errors.fulfillmentType?.message} />
        </label>
        <label className="service-form-check">
          <Controller control={control} name="published" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />
          Publicado no catálogo
        </label>

        <section className="service-form-section service-fields-builder">
          <header>
            <div>
              <Typography.Title level={3}>Campos do formulário no app</Typography.Title>
              <p>Escolha o componente exibido na tela do serviço. O rótulo é o texto que o hóspede verá acima do campo.</p>
            </div>
            <Button disabled={fieldRows.length >= SERVICE_FIELD_OPTIONS.length} icon={<PlusOutlined />} onClick={addField}>Adicionar campo</Button>
          </header>

          {fieldRows.length === 0 ? (
            <div className="service-fields-builder-empty">Nenhum campo configurado. O hóspede poderá enviar a solicitação sem preencher informações adicionais.</div>
          ) : (
            <div className="service-fields-builder-list">
              {fieldRows.map((fieldRow, index) => (
                <article className="service-field-editor" key={fieldRow.id}>
                  <header>
                    <strong>Campo {index + 1}</strong>
                    <Button aria-label={`Excluir campo ${index + 1}`} danger icon={<DeleteOutlined />} onClick={() => remove(index)} title={`Excluir campo ${index + 1}`} type="text" />
                  </header>
                  <div className="service-field-editor-grid">
                    <label>Campo exibido no app
                      <Controller
                        control={control}
                        name={`fields.${index}.kind`}
                        render={({ field }) => (
                          <AntSelect
                            aria-invalid={Boolean(errors.fields?.[index]?.kind)}
                            onChange={field.onChange}
                            options={SERVICE_FIELD_OPTIONS.map((option) => ({
                              ...option,
                              disabled: configuredFields.some((configuredField, configuredIndex) => configuredIndex !== index && configuredField.kind === option.value),
                            }))}
                            value={field.value}
                          />
                        )}
                      />
                      <small>Define qual componente será renderizado para o hóspede.</small>
                      <FieldError message={errors.fields?.[index]?.kind?.message} />
                    </label>
                    <label>Rótulo exibido ao hóspede
                      <Controller control={control} name={`fields.${index}.label`} render={({ field }) => <Input {...field} aria-invalid={Boolean(errors.fields?.[index]?.label)} placeholder="Ex.: Quantidade de flores" />} />
                      <small>Aparece acima do campo no formulário do app.</small>
                      <FieldError message={errors.fields?.[index]?.label?.message} />
                    </label>
                    <label className="service-form-check">
                      <Controller control={control} name={`fields.${index}.required`} render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />
                      Preenchimento obrigatório
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        {error ? <Toast message={error.message} onClose={() => undefined} tone="error" /> : null}
        <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={service ? 'Salvar alterações' : 'Cadastrar serviço'} />
      </form>
    </Modal>
  );
}

function servicePayload(values: ServiceFormValues): Omit<ServiceDefinition, 'id'> {
  return {
    title: values.title,
    description: values.description,
    icon: values.icon,
    fulfillmentType: values.fulfillmentType,
    published: values.published,
    requestSchema: {
      fields: values.fields.map((field) => field.kind === 'quantity'
        ? {
            name: 'quantity',
            label: field.label,
            type: 'number',
            required: field.required,
            min: 1,
            max: 10,
            defaultValue: 1,
          }
        : {
            name: 'note',
            label: field.label,
            type: 'string',
            required: field.required,
            maxLength: 500,
          }),
    },
  };
}

function serviceFormValues(service: ServiceDefinition): ServiceFormValues {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    icon: service.icon,
    fulfillmentType: service.fulfillmentType,
    fields: service.requestSchema.fields.map((field) => {
      const kind = serviceFieldKind(field);
      return {
        kind,
        label: textValue(field.label, kind === 'quantity' ? 'Quantidade' : 'Detalhes'),
        required: field.required !== false,
      };
    }),
    published: service.published,
  };
}

function serviceFieldKind(field: Record<string, unknown>): 'quantity' | 'note' {
  return field.name === 'quantity' || field.type === 'number' ? 'quantity' : 'note';
}

function serviceFieldLabel(kind: 'quantity' | 'note') {
  return kind === 'quantity' ? 'Quantidade — seletor com + e −' : 'Observação — campo de texto';
}

function serviceFulfillmentLabel(value: string) {
  return ({ hotel_staff: 'Equipe do hotel' } as Record<string, string>)[value] ?? value.replace(/_/g, ' ');
}

function textValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value ? value : fallback;
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

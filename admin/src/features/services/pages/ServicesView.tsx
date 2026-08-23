import { useState } from 'react';
import { Button, Checkbox, Empty, Input, Select as AntSelect, Table, Tag, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminService, listAdminServices, setAdminServicePublished, type ServiceDefinition,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { ConfirmActionModal } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { serviceFormSchema, type ServiceFormValues } from '../schemas/service-form-schema';

type ServicesViewProps = {
  accessToken: string;
  cacheScope: string;
};

const defaultValues: ServiceFormValues = {
  id: '',
  title: '',
  description: '',
  icon: 'Package',
  fulfillmentType: 'hotel_staff',
  fieldName: 'note',
  fieldLabel: 'Detalhes',
  fieldType: 'string',
  fieldRequired: true,
  published: true,
};

export function ServicesView({ accessToken, cacheScope }: ServicesViewProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [publishCandidate, setPublishCandidate] = useState<ServiceDefinition | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ServiceFormValues>({ resolver: zodResolver(serviceFormSchema), defaultValues });
  const servicesQuery = useQuery({
    queryKey: adminQueryKeys.services(cacheScope),
    queryFn: () => listAdminServices(accessToken),
  });
  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => createAdminService(accessToken, {
      ...(values.id ? { id: values.id } : {}),
      title: values.title,
      description: values.description,
      icon: values.icon,
      fulfillmentType: values.fulfillmentType,
      published: values.published,
      requestSchema: {
        fields: [{
          name: values.fieldName,
          label: values.fieldLabel,
          type: values.fieldType,
          required: values.fieldRequired,
          ...(values.fieldType === 'string' ? { maxLength: 500 } : {}),
        }],
      },
    }),
    onSuccess: async () => {
      reset(defaultValues);
      setMessage('Serviço cadastrado.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.services(cacheScope) });
    },
  });
  const publishMutation = useMutation({
    mutationFn: (service: ServiceDefinition) => setAdminServicePublished(accessToken, service.id, !service.published),
    onSuccess: async (_, service) => {
      setMessage(service.published ? 'Serviço despublicado.' : 'Serviço publicado.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.services(cacheScope) });
    },
  });
  const error = servicesQuery.error ?? createMutation.error ?? publishMutation.error;

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar"><Typography.Title level={2}>Catálogo de serviços</Typography.Title></header>
        {message || error ? (
          <Toast
            tone={error ? 'error' : 'success'}
            message={error instanceof Error ? error.message : message ?? ''}
            onClose={() => { setMessage(null); if (error) void servicesQuery.refetch(); }}
          />
        ) : null}
        {servicesQuery.isLoading ? <p className="empty-state" role="status">Carregando serviços...</p> : null}
        {!servicesQuery.isLoading && (servicesQuery.data?.length ?? 0) === 0
          ? <Empty description="Nenhum serviço cadastrado." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Table
              columns={[
                { title: 'Serviço', key: 'service', render: (_: unknown, service: ServiceDefinition) => <><strong>{service.title}</strong><br /><span className="muted-text">{service.description}</span></> },
                { title: 'Formulário', key: 'form', render: (_: unknown, service: ServiceDefinition) => `${service.requestSchema.fields.length} campo(s)` },
                { title: 'Status', key: 'status', render: (_: unknown, service: ServiceDefinition) => <Tag>{service.published ? 'Publicado' : 'Rascunho'}</Tag> },
                { title: 'Ações', key: 'actions', render: (_: unknown, service: ServiceDefinition) => <Button onClick={() => setPublishCandidate(service)} size="small">{service.published ? 'Despublicar' : 'Publicar'}</Button> },
              ]}
              dataSource={servicesQuery.data ?? []}
              loading={servicesQuery.isLoading}
              pagination={false}
              rowKey="id"
            />
          )}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Novo serviço</Typography.Title>
        <form className="stack-form" noValidate onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <label>ID opcional<Input {...register('id')} /></label>
          <label>Título<Input {...register('title')} aria-invalid={Boolean(errors.title)} /></label>
          <FieldError message={errors.title?.message} />
          <label>Descrição<Input {...register('description')} aria-invalid={Boolean(errors.description)} /></label>
          <FieldError message={errors.description?.message} />
          <div className="two-columns">
            <label>Ícone<Input {...register('icon')} aria-invalid={Boolean(errors.icon)} /></label>
            <label>Atendimento<Input {...register('fulfillmentType')} aria-invalid={Boolean(errors.fulfillmentType)} /></label>
          </div>
          <Typography.Title level={3}>Campo do formulário</Typography.Title>
          <div className="two-columns">
            <label>Nome<Input {...register('fieldName')} aria-invalid={Boolean(errors.fieldName)} /></label>
            <label>Label<Input {...register('fieldLabel')} aria-invalid={Boolean(errors.fieldLabel)} /></label>
          </div>
          <label>Tipo
            <Controller
              control={control}
              name="fieldType"
              render={({ field }) => <AntSelect onChange={field.onChange} options={[{ label: 'Texto', value: 'string' }, { label: 'Número', value: 'number' }]} value={field.value} />}
            />
          </label>
          <label className="check-row">
            <Controller control={control} name="published" render={({ field }) => <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} />
            Publicado
          </label>
          <Button htmlType="submit" loading={createMutation.isPending} type="primary">Cadastrar serviço</Button>
        </form>
      </section>
      {publishCandidate ? (
        <ConfirmActionModal
          confirmLabel={publishCandidate.published ? 'Despublicar serviço' : 'Publicar serviço'}
          message={`O serviço "${publishCandidate.title}" será ${publishCandidate.published ? 'removido do catálogo publicado' : 'publicado no catálogo'}.`}
          onCancel={() => setPublishCandidate(null)}
          onConfirm={() => {
            publishMutation.mutate(publishCandidate);
            setPublishCandidate(null);
          }}
          title={publishCandidate.published ? 'Despublicar serviço?' : 'Publicar serviço?'}
          tone={publishCandidate.published ? 'danger' : 'primary'}
        />
      ) : null}
    </div>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

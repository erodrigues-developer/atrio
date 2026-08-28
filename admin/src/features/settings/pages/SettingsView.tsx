import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Empty, Input, Select as AntSelect, Skeleton, Tag, Tooltip, Typography, Upload } from 'antd';
import {
  BankOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  UploadOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHotelUsefulInfo,
  deleteHotelUsefulInfo,
  getHotelSettings,
  updateHotelOperationHours,
  updateHotelUsefulInfo,
  updateHotelWifi,
  uploadHotelHeroImage,
  uploadHotelLogo,
  type HotelUsefulInfo,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Toast } from '@/shared/components/Toast';
import { ConfirmActionModal } from '@/shared/components/Modal';
import {
  operationHoursFormSchema,
  usefulInfoFormSchema,
  wifiFormSchema,
  type OperationHoursFormValues,
  type UsefulInfoFormValues,
  type WifiFormValues,
} from '../schemas/settings-form-schemas';

type SettingsViewProps = { accessToken: string; cacheScope: string };

export function SettingsView({ accessToken, cacheScope }: SettingsViewProps) {
  const queryClient = useQueryClient();
  const infoFormElementRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingInfo, setEditingInfo] = useState<HotelUsefulInfo | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<HotelUsefulInfo | null>(null);
  const settingsQuery = useQuery({
    queryKey: adminQueryKeys.settings(cacheScope),
    queryFn: () => getHotelSettings(accessToken),
  });
  const wifiForm = useForm<WifiFormValues>({
    resolver: zodResolver(wifiFormSchema),
    defaultValues: { wifiNetwork: '', wifiPassword: '' },
  });
  const infoForm = useForm<UsefulInfoFormValues>({
    resolver: zodResolver(usefulInfoFormSchema),
    defaultValues: { scope: 'stay', title: '', description: '' },
  });
  const operationHoursForm = useForm<OperationHoursFormValues>({
    resolver: zodResolver(operationHoursFormSchema),
    defaultValues: { checkInTime: '14:00', checkOutTime: '12:00' },
  });

  const resetWifiForm = wifiForm.reset;
  const resetOperationHoursForm = operationHoursForm.reset;
  const resetInfoForm = infoForm.reset;
  const focusInfoField = infoForm.setFocus;

  useEffect(() => {
    if (settingsQuery.data) {
      resetWifiForm({
        wifiNetwork: settingsQuery.data.wifiNetwork,
        wifiPassword: settingsQuery.data.wifiPassword,
      });
      resetOperationHoursForm({
        checkInTime: settingsQuery.data.checkInTime,
        checkOutTime: settingsQuery.data.checkOutTime,
      });
    }
  }, [settingsQuery.data, resetOperationHoursForm, resetWifiForm]);

  useEffect(() => {
    if (!editingInfo) return;

    resetInfoForm({
      scope: editingInfo.scope,
      title: editingInfo.title,
      description: editingInfo.description,
    });
    window.requestAnimationFrame(() => {
      infoFormElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      focusInfoField('title');
    });
  }, [editingInfo, focusInfoField, resetInfoForm]);

  const wifiMutation = useMutation({
    mutationFn: (values: WifiFormValues) => updateHotelWifi(accessToken, values),
    onSuccess: (settings) => {
      queryClient.setQueryData(adminQueryKeys.settings(cacheScope), settings);
      wifiForm.reset({ wifiNetwork: settings.wifiNetwork, wifiPassword: settings.wifiPassword });
      setMessage('Wi-Fi do hotel atualizado.');
    },
  });
  const operationHoursMutation = useMutation({
    mutationFn: (values: OperationHoursFormValues) => updateHotelOperationHours(accessToken, values),
    onSuccess: (settings) => {
      queryClient.setQueryData(adminQueryKeys.settings(cacheScope), settings);
      operationHoursForm.reset({ checkInTime: settings.checkInTime, checkOutTime: settings.checkOutTime });
      setMessage('Horários operacionais do hotel atualizados.');
    },
  });
  const infoMutation = useMutation({
    mutationFn: (values: UsefulInfoFormValues) => {
      const payload = {
        ...values,
        position: editingInfo?.position ?? ((settingsQuery.data?.usefulInfo.filter((item) => item.scope === values.scope).length ?? 0) + 1),
      };
      return editingInfo
        ? updateHotelUsefulInfo(accessToken, editingInfo.id, payload)
        : createHotelUsefulInfo(accessToken, payload);
    },
    onSuccess: async () => {
      const wasEditing = Boolean(editingInfo);
      setEditingInfo(null);
      infoForm.reset({ scope: 'stay', title: '', description: '' });
      setMessage(wasEditing ? 'Informação para hóspedes atualizada.' : 'Informação do hotel adicionada.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings(cacheScope) });
    },
  });
  const deleteInfoMutation = useMutation({
    mutationFn: (infoId: string) => deleteHotelUsefulInfo(accessToken, infoId),
    onSuccess: async () => {
      if (editingInfo?.id === deleteCandidate?.id) {
        setEditingInfo(null);
        infoForm.reset({ scope: 'stay', title: '', description: '' });
      }
      setDeleteCandidate(null);
      setMessage('Informação para hóspedes excluída.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings(cacheScope) });
    },
  });
  const mediaMutation = useMutation({
    mutationFn: ({ kind, file }: { kind: 'logo' | 'hero'; file: File }) => (
      kind === 'logo' ? uploadHotelLogo(accessToken, file) : uploadHotelHeroImage(accessToken, file)
    ),
    onSuccess: (settings) => {
      queryClient.setQueryData(adminQueryKeys.settings(cacheScope), settings);
      setMessage('Identidade visual do hotel atualizada.');
    },
  });
  const error = settingsQuery.error ?? wifiMutation.error ?? operationHoursMutation.error ?? infoMutation.error ?? deleteInfoMutation.error ?? mediaMutation.error;
  const settings = settingsQuery.data;

  function closeFeedback() {
    setMessage(null);
    wifiMutation.reset();
    operationHoursMutation.reset();
    infoMutation.reset();
    deleteInfoMutation.reset();
    mediaMutation.reset();
  }

  return (
    <div className="settings-page">
      <header className="page-heading premium-page-heading">
        <div>
          <Typography.Title level={1}>Configurações</Typography.Title>
          <p>Personalize a identidade e as informações compartilhadas pelo hotel.</p>
        </div>
      </header>

      {message || error ? (
        <Toast
          message={error instanceof Error ? error.message : message ?? ''}
          onClose={closeFeedback}
          tone={error ? 'error' : 'success'}
        />
      ) : null}

      {settingsQuery.isLoading ? <SettingsSkeleton /> : null}
      {!settingsQuery.isLoading && !settings ? (
        <section className="premium-surface settings-load-error">
          <Empty
            description="Não foi possível carregar as configurações."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button onClick={() => void settingsQuery.refetch()} type="primary">Tentar novamente</Button>
          </Empty>
        </section>
      ) : null}

      {settings ? (
        <>
          <section className="premium-surface settings-hotel-summary">
            <div className="settings-hotel-logo">
              {settings.logoUrl ? <img alt={`Logo de ${settings.name}`} src={settings.logoUrl} /> : <BankOutlined />}
            </div>
            <div>
              <span className="settings-summary-label">Hotel configurado</span>
              <Typography.Title level={2}>{settings.name}</Typography.Title>
              <p>Identificador: {settings.id}</p>
            </div>
            <Tag className="settings-active-tag">Configuração ativa</Tag>
          </section>

          <div className="settings-content-grid">
            <section className="premium-surface settings-card settings-visual-card">
              <SettingsSectionHeading
                description="Imagens utilizadas nos ambientes digitais acessados pelos hóspedes."
                icon={<PictureOutlined />}
                title="Identidade visual"
              />
              <div className="settings-media-grid">
                <MediaUpload
                  description="Preferencialmente uma imagem quadrada em PNG ou WebP."
                  label="Logo do hotel"
                  loading={mediaMutation.isPending}
                  onSelect={(file) => mediaMutation.mutate({ kind: 'logo', file })}
                  previewUrl={settings.logoUrl}
                  variant="logo"
                />
                <MediaUpload
                  description="Imagem horizontal exibida como destaque para os hóspedes."
                  label="Imagem principal"
                  loading={mediaMutation.isPending}
                  onSelect={(file) => mediaMutation.mutate({ kind: 'hero', file })}
                  previewUrl={settings.heroImageUrl}
                  variant="hero"
                />
              </div>
            </section>

            <section className="premium-surface settings-card settings-wifi-card">
              <SettingsSectionHeading
                description="Credenciais apresentadas aos hóspedes durante a estadia."
                icon={<WifiOutlined />}
                title="Wi-Fi do hotel"
              />
              <form className="settings-wifi-form" noValidate onSubmit={wifiForm.handleSubmit((values) => wifiMutation.mutate(values))}>
                <label>
                  Nome da rede
                  <Input
                    {...wifiForm.register('wifiNetwork')}
                    aria-invalid={Boolean(wifiForm.formState.errors.wifiNetwork)}
                    placeholder="Ex.: Atrio Hóspedes"
                  />
                </label>
                <FieldError message={wifiForm.formState.errors.wifiNetwork?.message} />
                <label>
                  Senha da rede
                  <Input.Password
                    {...wifiForm.register('wifiPassword')}
                    aria-invalid={Boolean(wifiForm.formState.errors.wifiPassword)}
                    placeholder="Informe a senha"
                  />
                </label>
                <FieldError message={wifiForm.formState.errors.wifiPassword?.message} />
                <footer className="settings-card-footer">
                  <Button htmlType="submit" loading={wifiMutation.isPending} type="primary">Salvar alterações</Button>
                </footer>
              </form>
            </section>

            <section className="premium-surface settings-card settings-hours-card">
              <SettingsSectionHeading
                description="Horários operacionais mostrados de forma informativa nas estadias. O acesso ao app segue os dias locais da hospedagem."
                icon={<ClockCircleOutlined />}
                title="Check-in e check-out"
              />
              <form className="settings-wifi-form" noValidate onSubmit={operationHoursForm.handleSubmit((values) => operationHoursMutation.mutate(values))}>
                <label>
                  Horário de check-in
                  <Input {...operationHoursForm.register('checkInTime')} aria-invalid={Boolean(operationHoursForm.formState.errors.checkInTime)} type="time" />
                </label>
                <FieldError message={operationHoursForm.formState.errors.checkInTime?.message} />
                <label>
                  Horário de check-out
                  <Input {...operationHoursForm.register('checkOutTime')} aria-invalid={Boolean(operationHoursForm.formState.errors.checkOutTime)} type="time" />
                </label>
                <FieldError message={operationHoursForm.formState.errors.checkOutTime?.message} />
                <footer className="settings-card-footer">
                  <Button htmlType="submit" loading={operationHoursMutation.isPending} type="primary">Salvar horários</Button>
                </footer>
              </form>
            </section>

            <section className="premium-surface settings-card settings-info-card">
              <SettingsSectionHeading
                description="Conteúdos úteis exibidos no dashboard ou durante a estadia."
                icon={<InfoCircleOutlined />}
                title="Informações para hóspedes"
              />
              <div className="settings-info-content">
                <div className="settings-info-list">
                  {settings.usefulInfo.length === 0 ? (
                    <Empty description="Nenhuma informação cadastrada." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : settings.usefulInfo.map((item) => (
                    <article className="settings-info-item" key={item.id}>
                      <span className="settings-info-item-icon"><InfoCircleOutlined /></span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </div>
                      <div className="settings-info-item-actions">
                        <Tag>{item.scope === 'dashboard' ? 'Hoje' : 'Estadia'}</Tag>
                        <Tooltip title="Editar informação">
                          <Button
                            aria-label={`Editar ${item.title}`}
                            icon={<EditOutlined />}
                            onClick={() => setEditingInfo(item)}
                            size="small"
                            type="text"
                          />
                        </Tooltip>
                        <Tooltip title="Excluir informação">
                          <Button
                            aria-label={`Excluir ${item.title}`}
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => setDeleteCandidate(item)}
                            size="small"
                            type="text"
                          />
                        </Tooltip>
                      </div>
                    </article>
                  ))}
                </div>

                <form className="settings-info-form" noValidate onSubmit={infoForm.handleSubmit((values) => infoMutation.mutate(values))} ref={infoFormElementRef}>
                  <Typography.Title level={3}>{editingInfo ? 'Editar informação' : 'Adicionar informação'}</Typography.Title>
                  <label>
                    Exibição
                    <Controller
                      control={infoForm.control}
                      name="scope"
                      render={({ field }) => (
                        <AntSelect
                          {...field}
                          options={[
                            { label: 'Tela Hoje', value: 'dashboard' },
                            { label: 'Estadia · Regras e informações úteis', value: 'stay' },
                          ]}
                        />
                      )}
                    />
                  </label>
                  <label>
                    Título
                    <Controller
                      control={infoForm.control}
                      name="title"
                      render={({ field }) => (
                        <Input
                          {...field}
                          aria-invalid={Boolean(infoForm.formState.errors.title)}
                          placeholder="Horário do café da manhã"
                        />
                      )}
                    />
                  </label>
                  <FieldError message={infoForm.formState.errors.title?.message} />
                  <label>
                    Descrição
                    <Controller
                      control={infoForm.control}
                      name="description"
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          aria-invalid={Boolean(infoForm.formState.errors.description)}
                          placeholder="Servido das 06:30 às 10:30 no restaurante do térreo."
                          rows={4}
                        />
                      )}
                    />
                  </label>
                  <FieldError message={infoForm.formState.errors.description?.message} />
                  <div className="settings-info-form-actions">
                    {editingInfo ? (
                      <Button onClick={() => {
                        setEditingInfo(null);
                        infoForm.reset({ scope: 'stay', title: '', description: '' });
                      }}>Cancelar edição</Button>
                    ) : null}
                    <Button icon={editingInfo ? <EditOutlined /> : <PlusOutlined />} htmlType="submit" loading={infoMutation.isPending} type="primary">
                      {editingInfo ? 'Salvar alterações' : 'Adicionar informação'}
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </>
      ) : null}
      {deleteCandidate ? (
        <ConfirmActionModal
          confirmLabel="Excluir informação"
          message={`A informação “${deleteCandidate.title}” deixará de ser exibida aos hóspedes.`}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={() => deleteInfoMutation.mutate(deleteCandidate.id)}
          title="Excluir informação?"
          tone="danger"
        />
      ) : null}
    </div>
  );
}

function SettingsSectionHeading({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <header className="premium-section-heading settings-section-heading">
      <span className="premium-section-icon">{icon}</span>
      <div>
        <Typography.Title level={2}>{title}</Typography.Title>
        <p>{description}</p>
      </div>
    </header>
  );
}

function MediaUpload({
  description,
  label,
  loading,
  onSelect,
  previewUrl,
  variant,
}: {
  description: string;
  label: string;
  loading: boolean;
  onSelect: (file: File) => void;
  previewUrl: string | null;
  variant: 'logo' | 'hero';
}) {
  return (
    <article className="settings-media-item">
      <div className={`settings-media-preview ${variant}`}>
        {previewUrl ? <img alt={label} src={previewUrl} /> : <PictureOutlined />}
      </div>
      <div className="settings-media-copy">
        <strong>{label}</strong>
        <p>{description}</p>
        <Upload
          accept="image/*"
          beforeUpload={(file) => {
            onSelect(file);
            return false;
          }}
          disabled={loading}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={loading}>{previewUrl ? 'Alterar imagem' : 'Selecionar imagem'}</Button>
        </Upload>
      </div>
    </article>
  );
}

function SettingsSkeleton() {
  return (
    <div className="settings-skeleton" role="status">
      <section className="premium-surface"><Skeleton active avatar paragraph={{ rows: 1 }} /></section>
      <div><section className="premium-surface"><Skeleton active /></section><section className="premium-surface"><Skeleton active /></section></div>
    </div>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="premium-field-error" role="alert">{message}</span> : null;
}

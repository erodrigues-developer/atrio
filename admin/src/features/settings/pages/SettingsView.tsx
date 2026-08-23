import { useEffect, useState } from 'react';
import { Button, Input, Select as AntSelect, Typography, Upload } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHotelUsefulInfo, getHotelSettings, updateHotelWifi, uploadHotelHeroImage, uploadHotelLogo,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { MiniList } from '@/shared/components/MiniList';
import { Toast } from '@/shared/components/Toast';
import {
  usefulInfoFormSchema, wifiFormSchema, type UsefulInfoFormValues, type WifiFormValues,
} from '../schemas/settings-form-schemas';

type SettingsViewProps = { accessToken: string; cacheScope: string };

export function SettingsView({ accessToken, cacheScope }: SettingsViewProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const settingsQuery = useQuery({ queryKey: adminQueryKeys.settings(cacheScope), queryFn: () => getHotelSettings(accessToken) });
  const wifiForm = useForm<WifiFormValues>({ resolver: zodResolver(wifiFormSchema), defaultValues: { wifiNetwork: '', wifiPassword: '' } });
  const infoForm = useForm<UsefulInfoFormValues>({ resolver: zodResolver(usefulInfoFormSchema), defaultValues: { scope: 'stay', title: '', description: '' } });

  const resetWifiForm = wifiForm.reset;

  useEffect(() => {
    if (settingsQuery.data) resetWifiForm({ wifiNetwork: settingsQuery.data.wifiNetwork, wifiPassword: settingsQuery.data.wifiPassword });
  }, [settingsQuery.data, resetWifiForm]);

  const wifiMutation = useMutation({
    mutationFn: (values: WifiFormValues) => updateHotelWifi(accessToken, values),
    onSuccess: (settings) => {
      queryClient.setQueryData(adminQueryKeys.settings(cacheScope), settings);
      wifiForm.reset({ wifiNetwork: settings.wifiNetwork, wifiPassword: settings.wifiPassword });
      setMessage('Wi-Fi do hotel atualizado.');
    },
  });
  const infoMutation = useMutation({
    mutationFn: (values: UsefulInfoFormValues) => createHotelUsefulInfo(accessToken, { ...values, position: (settingsQuery.data?.usefulInfo.length ?? 0) + 1 }),
    onSuccess: async () => {
      infoForm.reset({ scope: 'stay', title: '', description: '' });
      setMessage('Informação do hotel adicionada.');
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.settings(cacheScope) });
    },
  });
  const mediaMutation = useMutation({
    mutationFn: ({ kind, file }: { kind: 'logo' | 'hero'; file: File }) => kind === 'logo' ? uploadHotelLogo(accessToken, file) : uploadHotelHeroImage(accessToken, file),
    onSuccess: (settings) => {
      queryClient.setQueryData(adminQueryKeys.settings(cacheScope), settings);
      setMessage('Mídia do hotel atualizada.');
    },
  });
  const error = settingsQuery.error ?? wifiMutation.error ?? infoMutation.error ?? mediaMutation.error;
  const settings = settingsQuery.data;

  return (
    <section className="table-panel narrow-panel">
      <header className="panel-toolbar"><Typography.Title level={2}>Hotel</Typography.Title></header>
      {message || error ? <Toast tone={error ? 'error' : 'success'} message={error instanceof Error ? error.message : message ?? ''} onClose={() => setMessage(null)} /> : null}
      {settings ? (
        <div className="settings-grid">
          <article><strong>{settings.name}</strong><span className="muted-text">ID {settings.id}</span></article>
          <section className="settings-section">
            <Typography.Title level={3}>Identidade visual</Typography.Title>
            <MediaUpload label="Logo" loading={mediaMutation.isPending} onSelect={(file) => mediaMutation.mutate({ kind: 'logo', file })} />
            {settings.logoUrl ? <img alt="Logo do hotel" className="media-preview" src={settings.logoUrl} /> : null}
            <MediaUpload label="Imagem principal" loading={mediaMutation.isPending} onSelect={(file) => mediaMutation.mutate({ kind: 'hero', file })} />
            {settings.heroImageUrl ? <img alt="Imagem principal do hotel" className="media-preview hero" src={settings.heroImageUrl} /> : null}
          </section>
          <section className="settings-section">
            <Typography.Title level={3}>Wi-Fi do hotel</Typography.Title>
            <form className="stack-form" noValidate onSubmit={wifiForm.handleSubmit((values) => wifiMutation.mutate(values))}>
              <label>Rede<Input {...wifiForm.register('wifiNetwork')} aria-invalid={Boolean(wifiForm.formState.errors.wifiNetwork)} /></label>
              <FieldError message={wifiForm.formState.errors.wifiNetwork?.message} />
              <label>Senha<Input.Password {...wifiForm.register('wifiPassword')} aria-invalid={Boolean(wifiForm.formState.errors.wifiPassword)} /></label>
              <FieldError message={wifiForm.formState.errors.wifiPassword?.message} />
              <div className="modal-footer settings-footer"><Button htmlType="submit" loading={wifiMutation.isPending} type="primary">Salvar Wi-Fi</Button></div>
            </form>
          </section>
          <section className="settings-section">
            <Typography.Title level={3}>Informações para hóspedes</Typography.Title>
            <MiniList items={settings.usefulInfo.map((item) => `${item.title}: ${item.description}`)} emptyLabel="Nenhuma informação cadastrada." />
            <form className="stack-form modal-grid-form" noValidate onSubmit={infoForm.handleSubmit((values) => infoMutation.mutate(values))}>
              <label>Exibição<Controller control={infoForm.control} name="scope" render={({ field }) => <AntSelect {...field} options={[{ label: 'Hoje', value: 'dashboard' }, { label: 'Estadia', value: 'stay' }]} />} /></label>
              <label>Título<Input {...infoForm.register('title')} aria-invalid={Boolean(infoForm.formState.errors.title)} placeholder="Horário do café da manhã" /></label>
              <FieldError message={infoForm.formState.errors.title?.message} />
              <label className="wide-field">Descrição<Input.TextArea {...infoForm.register('description')} aria-invalid={Boolean(infoForm.formState.errors.description)} placeholder="Servido das 06:30 às 10:30 no restaurante do térreo." rows={3} /></label>
              <FieldError message={infoForm.formState.errors.description?.message} />
              <div className="modal-footer settings-footer"><Button htmlType="submit" loading={infoMutation.isPending} type="primary">Adicionar informação</Button></div>
            </form>
          </section>
        </div>
      ) : <p className="empty-state" role="status">Carregando configurações...</p>}
    </section>
  );
}

function MediaUpload({ label, loading, onSelect }: { label: string; loading: boolean; onSelect: (file: File) => void }) {
  return <label>{label}<Upload accept="image/*" beforeUpload={(file) => { onSelect(file); return false; }} disabled={loading} showUploadList={false}><Button loading={loading}>Selecionar imagem</Button></Upload></label>;
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}

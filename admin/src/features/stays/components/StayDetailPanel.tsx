import { FormEvent, useState } from 'react';
import {
  Button, DatePicker, Dropdown, Input, InputNumber, Select as AntSelect, Table, Tag, Typography,
} from 'antd';
import {
  ApartmentOutlined, CalendarOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined,
  MinusOutlined, MobileOutlined, MoreOutlined, PlusOutlined, SendOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStayConsumption, deleteStayConsumption, listStayConsumption, updateStayConsumption,
  type AdminGuest, type AdminStay, type ConsumptionItem,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal } from '@/shared/components/Modal';
import {
  formatDate, formatDecimalInput, formatMoney, formatStayDate, formatStayPeriod,
  parseCurrencyInput, shortStayStatus, stayStatusColor,
} from '@/shared/lib/presentation';
import { StayModal } from './StayForm';

export function StayDetailPanel({
  accessToken,
  cacheScope,
  guests,
  stay,
  onCancel,
  onCheckIn,
  onCheckOut,
  onResend,
  onUpdated,
}: {
  accessToken: string;
  cacheScope: string;
  guests: AdminGuest[];
  stay: AdminStay;
  onCancel: (stay: AdminStay) => void;
  onCheckIn: (stay: AdminStay) => void;
  onCheckOut: (stay: AdminStay) => void;
  onResend: (stay: AdminStay) => void;
  onUpdated: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<null | 'consumption' | 'delete-consumption' | 'edit' | 'resend' | 'check-in' | 'close' | 'cancel'>(null);
  const [editingConsumptionId, setEditingConsumptionId] = useState<string | null>(null);
  const [deletingConsumption, setDeletingConsumption] = useState<ConsumptionItem | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [consumptionForm, setConsumptionForm] = useState({
    title: '',
    description: '',
    category: 'Alimentos e Bebidas',
    quantity: 1,
    icon: 'Receipt',
    amountCents: 0,
    currency: 'BRL',
    occurredAt: new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = useState<string | null>(null);

  const consumptionQuery = useQuery({
    queryKey: adminQueryKeys.stayConsumption(cacheScope, stay.id),
    queryFn: () => listStayConsumption(accessToken, stay.id),
  });
  const consumption = consumptionQuery.data ?? [];

  async function refreshDetails() {
    await queryClient.invalidateQueries({
      queryKey: adminQueryKeys.stayConsumption(cacheScope, stay.id),
    });
  }

  async function handleConsumptionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!consumptionForm.title) {
      setError('Informe o item consumido.');
      return;
    }
    try {
      const { quantity, ...consumptionPayload } = consumptionForm;

      const payload = {
        ...consumptionPayload,
        title: `${consumptionForm.title} ×${quantity}`,
        amountCents: Number(consumptionForm.amountCents) * Number(quantity),
        occurredAt: new Date(consumptionForm.occurredAt).toISOString(),
      };
      if (editingConsumptionId) {
        await updateStayConsumption(accessToken, stay.id, editingConsumptionId, payload);
      } else {
        await createStayConsumption(accessToken, stay.id, payload);
      }
      setConsumptionForm({ ...consumptionForm, title: '', description: '', quantity: 1, amountCents: 0 });
      setEditingConsumptionId(null);
      setActiveModal(null);
      setSuccess(editingConsumptionId ? 'Consumo atualizado com sucesso.' : 'Consumo adicionado com sucesso.');
      await refreshDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar consumo.');
    }
  }

  async function handleDeleteConsumption() {
    if (!deletingConsumption) return;
    setError(null);
    try {
      await deleteStayConsumption(accessToken, stay.id, deletingConsumption.id);
      setDeletingConsumption(null);
      setActiveModal(null);
      setSuccess('Consumo excluído com sucesso.');
      await refreshDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir consumo.');
    }
  }

  const currentStatus = stay.status;
  const guestName = `${stay.guest.firstName} ${stay.guest.lastName}`;
  const consumptionTotal = Number(consumptionForm.amountCents) * Number(consumptionForm.quantity);
  const registeredConsumptionTotal = consumption.reduce((total, item) => total + item.amountCents, 0);
  const primaryAction = currentStatus === 'scheduled'
    ? { label: 'Realizar check-in', modal: 'check-in' as const }
    : currentStatus === 'active'
      ? { label: 'Realizar check-out', modal: 'close' as const }
      : null;

  function closeSecondaryModal() {
    setActiveModal(null);
    setError(null);
  }

  function openNewConsumptionModal() {
    setEditingConsumptionId(null);
    setConsumptionForm({
      title: '',
      description: '',
      category: 'Alimentos e Bebidas',
      quantity: 1,
      icon: 'Receipt',
      amountCents: 0,
      currency: 'BRL',
      occurredAt: new Date().toISOString().slice(0, 16),
    });
    setActiveModal('consumption');
  }

  function openEditConsumptionModal(item: ConsumptionItem) {
    const quantityMatch = item.title.match(/\s×(\d+)$/);
    const quantity = Math.max(1, Number(quantityMatch?.[1] ?? 1));
    setEditingConsumptionId(item.id);
    setConsumptionForm({
      title: item.title.replace(/\s×\d+$/, ''),
      description: item.description,
      category: item.category,
      quantity,
      icon: item.icon,
      amountCents: Math.round(item.amountCents / quantity),
      currency: item.currency,
      occurredAt: dayjs(item.occurredAt).format('YYYY-MM-DDTHH:mm'),
    });
    setActiveModal('consumption');
  }

  return (
    <>
      <div className="detail-panel stay-detail-content">
        <header className="stay-detail-hero">
          <div className="stay-detail-identity">
            <div className="stay-room-chip"><ApartmentOutlined /> Quarto {stay.roomNumber}</div>
            <Tag color={stayStatusColor(currentStatus)}>{shortStayStatus(currentStatus)}</Tag>
          </div>
          <div className="stay-detail-actions" onClick={(event) => event.stopPropagation()}>
            {primaryAction ? (
              <Button onClick={() => setActiveModal(primaryAction.modal)} type="primary">{primaryAction.label}</Button>
            ) : null}
            <Dropdown menu={{ items: [{ key: 'edit', icon: <EditOutlined />, label: 'Editar estadia' }, ...(currentStatus === 'scheduled' || currentStatus === 'active' ? [{ key: 'resend', icon: <SendOutlined />, label: 'Reenviar acesso' }] : []), ...(currentStatus === 'scheduled' ? [{ danger: true, key: 'cancel', icon: <DeleteOutlined />, label: 'Cancelar estadia' }] : [])], onClick: ({ key }) => setActiveModal(key as typeof activeModal) }}><Button aria-label="Mais ações" icon={<MoreOutlined />} /></Dropdown>
          </div>
        </header>
        {success ? <p className="success-state detail-feedback">{success}</p> : null}
        {!activeModal && (error || consumptionQuery.error) ? <p className="form-error">{error ?? consumptionQuery.error?.message}</p> : null}
        <section className="stay-summary-grid">
          <article className="stay-summary-card"><span>Nome do hóspede</span><strong>{guestName}</strong><small><UserOutlined /> {stay.guest.maskedPhone}</small></article>
          <article className="stay-summary-card"><span>Data do check-in</span><strong><CalendarOutlined /> {formatStayDate(stay.checkInDate)}</strong><small><ClockCircleOutlined /> Estadia programada</small></article>
          <article className="stay-summary-card"><span>Data do check-out</span><strong><CalendarOutlined /> {formatStayDate(stay.checkOutDate)}</strong><small><ClockCircleOutlined /> {stay.checkOutTime}</small></article>
          <article className="stay-summary-card"><span>Nº de acessos ao app</span><strong><MobileOutlined /> {stay.activeGuestSessions} {stay.activeGuestSessions === 1 ? 'acesso' : 'acessos'}</strong><small>{formatStayPeriod(stay.checkInDate, stay.checkOutDate)}</small></article>
        </section>
        <section className="stay-consumption-panel">
          <header><Typography.Title level={3}>Histórico de consumos</Typography.Title><Button icon={<PlusOutlined />} onClick={openNewConsumptionModal} size="small">Adicionar consumo</Button></header>
          <Table
            columns={[
              { title: 'Data/hora', dataIndex: 'occurredAt', key: 'occurredAt', render: (value: string) => formatDate(value) },
              { title: 'Categoria', dataIndex: 'category', key: 'category' },
              { title: 'Item', dataIndex: 'title', key: 'title' },
              { title: 'Valor', key: 'amount', align: 'right' as const, render: (_: unknown, item: ConsumptionItem) => formatMoney(item.amountCents, item.currency) },
              {
                title: 'Ações',
                key: 'actions',
                align: 'right' as const,
                width: 78,
                render: (_: unknown, item: ConsumptionItem) => (
                  <div className="consumption-row-actions">
                    <Button aria-label={`Editar ${item.title}`} icon={<EditOutlined />} onClick={() => openEditConsumptionModal(item)} size="small" type="text" />
                    <Button aria-label={`Excluir ${item.title}`} danger icon={<DeleteOutlined />} onClick={() => { setDeletingConsumption(item); setActiveModal('delete-consumption'); }} size="small" type="text" />
                  </div>
                ),
              },
            ]}
            dataSource={consumption}
            loading={consumptionQuery.isLoading}
            locale={{ emptyText: 'Nenhum consumo registrado.' }}
            pagination={false}
            rowKey="id"
            scroll={{ x: 620 }}
            size="small"
          />
          <footer><strong>Total consumido</strong><b>{formatMoney(registeredConsumptionTotal, 'BRL')}</b></footer>
        </section>
      </div>
      {activeModal === 'edit' ? (
        <StayModal
          accessToken={accessToken}
          guests={guests}
          layer="secondary"
          onCancel={closeSecondaryModal}
          onSaved={() => {
            setActiveModal(null);
            setSuccess('Estadia atualizada com sucesso.');
            onUpdated();
          }}
          stay={stay}
        />
      ) : null}
      {activeModal === 'consumption' ? (
        <Modal className="operational-form-modal consumption-modal" layer="secondary" title={editingConsumptionId ? 'Editar consumo' : 'Adicionar consumo'} onClose={closeSecondaryModal} width={600}>
          {error ? <p className="form-error">{error}</p> : null}
          <form className="consumption-modal-form" onSubmit={handleConsumptionSubmit}>
            <div className="consumption-form-grid">
              <label className="consumption-category">Categoria<AntSelect onChange={(value) => setConsumptionForm({ ...consumptionForm, category: value })} options={['Alimentos e Bebidas', 'Serviços', 'Minibar', 'Lavanderia', 'Outros'].map((value) => ({ label: value, value }))} value={consumptionForm.category} /></label>
              <label className="consumption-item">Item<Input placeholder="Digite o item" value={consumptionForm.title} onChange={(event) => setConsumptionForm({ ...consumptionForm, title: event.target.value })} required /></label>
              <label className="consumption-quantity">Quantidade<div className="consumption-stepper"><Button aria-label="Diminuir quantidade" htmlType="button" icon={<MinusOutlined />} onClick={() => setConsumptionForm({ ...consumptionForm, quantity: Math.max(1, consumptionForm.quantity - 1) })} /><InputNumber controls={false} min={1} onChange={(value) => setConsumptionForm({ ...consumptionForm, quantity: Math.max(1, Number(value ?? 1)) })} value={consumptionForm.quantity} /><Button aria-label="Aumentar quantidade" htmlType="button" icon={<PlusOutlined />} onClick={() => setConsumptionForm({ ...consumptionForm, quantity: consumptionForm.quantity + 1 })} /></div></label>
              <label className="consumption-value">Valor unitário<Input addonBefore="R$" inputMode="numeric" placeholder="0,00" value={formatDecimalInput(consumptionForm.amountCents)} onChange={(event) => setConsumptionForm({ ...consumptionForm, amountCents: parseCurrencyInput(event.target.value) })} required /></label>
              <label className="consumption-date">Data/hora<DatePicker format="DD/MM/YYYY HH:mm" onChange={(value) => setConsumptionForm({ ...consumptionForm, occurredAt: value?.format('YYYY-MM-DDTHH:mm') ?? '' })} prefix={<CalendarOutlined />} showTime suffixIcon={null} value={consumptionForm.occurredAt ? dayjs(consumptionForm.occurredAt) : null} /></label>
              <label className="consumption-note">Observação (opcional)<Input placeholder="Adicione uma observação sobre o consumo" value={consumptionForm.description} onChange={(event) => setConsumptionForm({ ...consumptionForm, description: event.target.value })} /></label>
            </div>
            <div className="consumption-submit-row">
              <div className="consumption-total"><span>Total</span><strong>{formatMoney(consumptionTotal, consumptionForm.currency)}</strong></div>
              <div className="modal-footer"><Button onClick={closeSecondaryModal}>Cancelar</Button><Button htmlType="submit" type="primary">{editingConsumptionId ? 'Salvar alterações' : 'Salvar consumo'}</Button></div>
            </div>
          </form>
        </Modal>
      ) : null}
      {activeModal === 'delete-consumption' && deletingConsumption ? (
        <Modal layer="secondary" title="Excluir consumo" onClose={closeSecondaryModal} size="compact">
          {error ? <p className="form-error">{error}</p> : null}
          <p className="muted-text">O consumo “{deletingConsumption.title.replace(/\s×\d+$/, '')}” será excluído permanentemente.</p>
          <div className="modal-footer">
            <Button onClick={closeSecondaryModal}>Cancelar</Button>
            <Button danger onClick={handleDeleteConsumption} type="primary">Excluir consumo</Button>
          </div>
        </Modal>
      ) : null}
      {activeModal === 'check-in' ? (
        <Modal layer="secondary" title="Realizar check-in" onClose={closeSecondaryModal} size="compact">
          <div className="confirmation-summary">
            <strong>{guestName}</strong>
            <span>Quarto {stay.roomNumber}</span>
            <p>{formatStayPeriod(stay.checkInDate, stay.checkOutDate)}</p>
          </div>
          <p className="muted-text">Ao confirmar, a estadia será iniciada.</p>
          <div className="modal-footer">
            <Button onClick={closeSecondaryModal}>Cancelar</Button>
            <Button onClick={() => { closeSecondaryModal(); onCheckIn(stay); }} type="primary">Realizar check-in</Button>
          </div>
        </Modal>
      ) : null}
      {activeModal === 'close' ? (
        <Modal layer="secondary" title="Realizar check-out" onClose={closeSecondaryModal} size="compact">
          <div className="confirmation-summary">
            <strong>{guestName}</strong>
            <span>Quarto {stay.roomNumber}</span>
            <p>{formatStayPeriod(stay.checkInDate, stay.checkOutDate)}</p>
          </div>
          <p className="muted-text">O hóspede perderá o acesso aos recursos vinculados a esta estadia.</p>
          <div className="modal-footer">
            <Button onClick={closeSecondaryModal}>Cancelar</Button>
            <Button onClick={() => { closeSecondaryModal(); onCheckOut(stay); }} type="primary">Realizar check-out</Button>
          </div>
        </Modal>
      ) : null}
      {activeModal === 'resend' ? (
        <Modal layer="secondary" title="Reenviar acesso" onClose={closeSecondaryModal} size="compact">
          <p className="muted-text">Um novo acesso será enviado para {guestName}.</p>
          <div className="modal-footer">
            <Button onClick={closeSecondaryModal}>Cancelar</Button>
            <Button onClick={() => { closeSecondaryModal(); onResend(stay); }} type="primary">Reenviar acesso</Button>
          </div>
        </Modal>
      ) : null}
      {activeModal === 'cancel' ? (
        <Modal layer="secondary" title="Cancelar estadia" onClose={closeSecondaryModal} size="compact">
          <p className="muted-text">A estadia será marcada como cancelada e sairá da operação ativa.</p>
          <div className="modal-footer">
            <Button onClick={closeSecondaryModal}>Cancelar</Button>
            <Button danger onClick={() => { closeSecondaryModal(); onCancel(stay); }} type="primary">Cancelar estadia</Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

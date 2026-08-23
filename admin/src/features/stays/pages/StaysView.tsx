import { useState } from 'react';
import { Button, Input, Select as AntSelect, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelStay, checkInStay, checkOutStay, listGuests, listStays, resendStayAccess, type AdminStay,
} from '../api';
import { adminQueryKeys } from '@/shared/api/query-keys';
import { Modal } from '@/shared/components/Modal';
import { Toast } from '@/shared/components/Toast';
import { getCurrentMonthDateRange } from '@/shared/lib/presentation';
import { StayDateRangePicker } from '../components/StayDateRangePicker';
import { StayDetailPanel } from '../components/StayDetailPanel';
import { StayModal } from '../components/StayForm';
import { Pagination, StaysEmptyState, StaysTable } from '../components/StaysTable';
export function StaysView({ accessToken, cacheScope }: { accessToken: string; cacheScope: string }) {
  const pageSize = 10;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const initialDateRange = getCurrentMonthDateRange();
  const [periodStart, setPeriodStart] = useState(initialDateRange.start);
  const [periodEnd, setPeriodEnd] = useState(initialDateRange.end);
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: 'active',
    periodStart: initialDateRange.start,
    periodEnd: initialDateRange.end,
  });
  const [page, setPage] = useState(1);
  const [detailStay, setDetailStay] = useState<AdminStay | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const staysQuery = useQuery({
    queryKey: adminQueryKeys.stayList(cacheScope, { ...appliedFilters, page, pageSize }),
    queryFn: () => listStays(accessToken, {
      search: appliedFilters.search,
      status: appliedFilters.status,
      dateFrom: appliedFilters.periodStart,
      dateTo: appliedFilters.periodEnd,
      page,
      pageSize,
    }),
  });
  const guestsQuery = useQuery({
    queryKey: adminQueryKeys.guests(cacheScope),
    queryFn: () => listGuests(accessToken),
  });
  const stays = staysQuery.data?.items ?? [];
  const guests = guestsQuery.data ?? [];
  const totalItems = staysQuery.data?.total ?? 0;
  const totalPages = staysQuery.data?.totalPages ?? 0;
  const queryError = staysQuery.error ?? guestsQuery.error;

  async function refreshData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stays(cacheScope) }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.guests(cacheScope) }),
    ]);
  }
  async function handleResend(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      const response = await resendStayAccess(accessToken, stay.id);
      setMessage(`Acesso reenviado para ${response.maskedPhone}. Código ${response.challengeId} criado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível reenviar acesso.');
    }
  }

  async function handleCheckIn(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      await checkInStay(accessToken, stay.id);
      setMessage(`Check-in realizado para o quarto ${stay.roomNumber}.`);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível realizar check-in.');
    }
  }

  async function handleCheckOut(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      const response = await checkOutStay(accessToken, stay.id);
      setMessage(`Estadia encerrada. ${response.revokedSessions} ${response.revokedSessions === 1 ? 'acesso foi revogado' : 'acessos foram revogados'}.`);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível encerrar estadia.');
    }
  }

  async function handleCancel(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      await cancelStay(accessToken, stay.id);
      setMessage(`Estadia do quarto ${stay.roomNumber} cancelada.`);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cancelar estadia.');
    }
  }

  const currentPage = Math.min(page, Math.max(totalPages, 1));

  function applyFilters() {
    setPage(1);
    setAppliedFilters({ search, status, periodStart, periodEnd });
  }

  function clearFilters() {
    setSearch('');
    setStatus('active');
    const currentMonth = getCurrentMonthDateRange();
    setPeriodStart(currentMonth.start);
    setPeriodEnd(currentMonth.end);
    setPage(1);
    setAppliedFilters({
      search: '',
      status: 'active',
      periodStart: currentMonth.start,
      periodEnd: currentMonth.end,
    });
  }

  return (
    <div className="stays-layout">
      <header className="page-heading stays-page-heading">
        <div>
          <Typography.Title level={1}>Estadias</Typography.Title>
          <p>Gerencie as estadias dos hóspedes e o acesso ao app durante a hospedagem.</p>
        </div>
        <Button icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)} size="large" type="primary">Nova estadia</Button>
      </header>

      <section className="stays-filter-panel">
        <form className="stays-toolbar" onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
          <label className="stays-filter-field">
            <span>Buscar hóspede ou quarto</span>
            <Input aria-label="Buscar hóspede ou quarto" placeholder="Buscar hóspede ou quarto" prefix={<SearchOutlined />} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="stays-filter-field">
            <span>Status</span>
            <AntSelect
              onChange={setStatus}
              options={[{ label: 'Todas', value: '' }, { label: 'Ativas', value: 'active' }, { label: 'Agendadas', value: 'scheduled' }, { label: 'Encerradas', value: 'checked_out' }, { label: 'Canceladas', value: 'cancelled' }]}
              value={status}
            />
          </label>
          <label className="stays-filter-field">
            <span>Data</span>
            <StayDateRangePicker
              end={periodEnd}
              onChange={(start, end) => {
                setPeriodStart(start);
                setPeriodEnd(end);
              }}
              start={periodStart}
            />
          </label>
          <Button className="filter-clear-button" onClick={clearFilters}>Limpar filtros</Button>
          <Button htmlType="submit" type="primary">Aplicar filtros</Button>
        </form>
      </section>

      <section className="table-panel stays-results-panel">
        <header className="stays-results-header">
          <span>Total de {totalItems} {totalItems === 1 ? 'registro' : 'registros'}</span>
        </header>
        {message || error || queryError ? (
          <Toast
            tone={error || queryError ? 'error' : 'success'}
            message={error ?? (queryError instanceof Error ? queryError.message : null) ?? message ?? ''}
            onClose={() => {
              setMessage(null);
              setError(null);
              if (queryError) void refreshData();
            }}
          />
        ) : null}
        <StaysTable
          emptyContent={<StaysEmptyState onClearFilters={clearFilters} onCreate={() => setIsCreateOpen(true)} />}
          isLoading={staysQuery.isLoading || guestsQuery.isLoading}
          stays={stays}
          onCancel={handleCancel}
          onSelect={setDetailStay}
          onResend={handleResend}
        />
        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={totalItems} onPageChange={setPage} />
      </section>
      {detailStay ? (
        <Modal title="Detalhes da estadia" onClose={() => setDetailStay(null)} size="large">
          <StayDetailPanel
            accessToken={accessToken}
            cacheScope={cacheScope}
            guests={guests}
            stay={detailStay}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onResend={handleResend}
            onUpdated={() => void refreshData()}
          />
        </Modal>
      ) : null}
      {isCreateOpen ? (
        <StayModal
          accessToken={accessToken}
          guests={guests}
          onCancel={() => setIsCreateOpen(false)}
          onSaved={() => {
            setIsCreateOpen(false);
            setSearch('');
            setStatus('active');
            const currentMonth = getCurrentMonthDateRange();
            setPeriodStart(currentMonth.start);
            setPeriodEnd(currentMonth.end);
            setPage(1);
            setAppliedFilters({
              search: '',
              status: 'active',
              periodStart: currentMonth.start,
              periodEnd: currentMonth.end,
            });
            void refreshData();
          }}
        />
      ) : null}
    </div>
  );
}

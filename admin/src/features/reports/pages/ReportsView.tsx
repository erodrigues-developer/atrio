import { useState } from 'react';
import { Button, DatePicker, Input, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { downloadReport } from '../api';
import { Toast } from '@/shared/components/Toast';

export function ReportsView({ accessToken }: { accessToken: string }) {
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(report: 'stays' | 'requests' | 'reservations') {
    setError(null);
    try {
      await downloadReport(accessToken, report, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível baixar o relatório.');
    }
  }

  return (
    <section className="table-panel narrow-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>Relatórios CSV</Typography.Title>
      </header>
      {error ? <Toast tone="error" message={error} onClose={() => setError(null)} /> : null}
      <div className="report-filters">
        <Input placeholder="Status opcional" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} />
        <DatePicker format="YYYY-MM-DD" onChange={(value) => setFilters({ ...filters, from: value?.format('YYYY-MM-DD') ?? '' })} value={filters.from ? dayjs(filters.from) : null} />
        <DatePicker format="YYYY-MM-DD" onChange={(value) => setFilters({ ...filters, to: value?.format('YYYY-MM-DD') ?? '' })} value={filters.to ? dayjs(filters.to) : null} />
      </div>
      <div className="report-actions">
        <Button icon={<DownloadOutlined />} onClick={() => handleDownload('stays')}>Estadias</Button>
        <Button icon={<DownloadOutlined />} onClick={() => handleDownload('requests')}>Solicitações</Button>
        <Button icon={<DownloadOutlined />} onClick={() => handleDownload('reservations')}>Reservas</Button>
      </div>
    </section>
  );
}

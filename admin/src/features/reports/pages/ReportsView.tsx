import { useState } from 'react';
import { Button, DatePicker, Input, Typography } from 'antd';
import {
  ApartmentOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { downloadReport } from '../api';
import { Toast } from '@/shared/components/Toast';

type ReportKind = 'stays' | 'requests' | 'reservations';

const reports: Array<{
  description: string;
  icon: typeof ApartmentOutlined;
  kind: ReportKind;
  title: string;
}> = [
  {
    description: 'Relação de hóspedes, quartos, períodos e situação de cada estadia.',
    icon: ApartmentOutlined,
    kind: 'stays',
    title: 'Estadias',
  },
  {
    description: 'Histórico operacional de solicitações, responsáveis e status de atendimento.',
    icon: MessageOutlined,
    kind: 'requests',
    title: 'Solicitações',
  },
  {
    description: 'Reservas de experiências com hóspedes, horários e situação atual.',
    icon: CalendarOutlined,
    kind: 'reservations',
    title: 'Reservas',
  },
];

export function ReportsView({ accessToken }: { accessToken: string }) {
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [downloading, setDownloading] = useState<ReportKind | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  async function handleDownload(report: ReportKind) {
    setFeedback(null);
    setDownloading(report);
    try {
      await downloadReport(accessToken, report, filters);
      setFeedback({ message: 'Relatório gerado. O download foi iniciado.', tone: 'success' });
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Não foi possível baixar o relatório.',
        tone: 'error',
      });
    } finally {
      setDownloading(null);
    }
  }

  function clearFilters() {
    setFilters({ status: '', from: '', to: '' });
  }

  return (
    <div className="reports-page">
      <header className="page-heading premium-page-heading">
        <div>
          <Typography.Title level={1}>Relatórios</Typography.Title>
          <p>Exporte dados operacionais do hotel para análise e acompanhamento.</p>
        </div>
      </header>

      {feedback ? <Toast message={feedback.message} onClose={() => setFeedback(null)} tone={feedback.tone} /> : null}

      <section className="premium-surface reports-filter-card">
        <header className="premium-section-heading">
          <span className="premium-section-icon"><FileTextOutlined /></span>
          <div>
            <Typography.Title level={2}>Filtros do relatório</Typography.Title>
            <p>Os filtros abaixo serão aplicados ao arquivo selecionado.</p>
          </div>
        </header>
        <div className="reports-filter-grid">
          <label>
            Status
            <Input
              allowClear
              placeholder="Todos os status"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            />
          </label>
          <label>
            Data inicial
            <DatePicker
              allowClear
              format="DD/MM/YYYY"
              placeholder="Selecione a data"
              value={filters.from ? dayjs(filters.from) : null}
              onChange={(value) => setFilters({ ...filters, from: value?.format('YYYY-MM-DD') ?? '' })}
            />
          </label>
          <label>
            Data final
            <DatePicker
              allowClear
              format="DD/MM/YYYY"
              placeholder="Selecione a data"
              value={filters.to ? dayjs(filters.to) : null}
              onChange={(value) => setFilters({ ...filters, to: value?.format('YYYY-MM-DD') ?? '' })}
            />
          </label>
          <Button className="reports-clear-button" disabled={!filters.status && !filters.from && !filters.to} onClick={clearFilters}>Limpar filtros</Button>
        </div>
      </section>

      <section className="reports-catalog" aria-label="Relatórios disponíveis">
        <div className="reports-catalog-heading">
          <Typography.Title level={2}>Relatórios disponíveis</Typography.Title>
          <p>Escolha o conjunto de dados que deseja exportar em formato CSV.</p>
        </div>
        <div className="reports-card-grid">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <article className="premium-surface report-card" key={report.kind}>
                <span className="report-card-icon"><Icon /></span>
                <div className="report-card-copy">
                  <Typography.Title level={3}>{report.title}</Typography.Title>
                  <p>{report.description}</p>
                </div>
                <footer>
                  <span>Arquivo CSV</span>
                  <Button
                    icon={<DownloadOutlined />}
                    loading={downloading === report.kind}
                    onClick={() => handleDownload(report.kind)}
                    type="primary"
                  >
                    Baixar relatório
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

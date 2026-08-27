import { useState } from 'react';
import { Button, Dropdown, Empty, Table, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  CustomerServiceOutlined,
  LoginOutlined,
  LogoutOutlined,
  MessageOutlined,
  ReloadOutlined,
  StarOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { isAdminView, type AdminView } from '@/app/router/admin-routes';
import { updateAdminRequestStatus, type Dashboard } from '../api';
import { ConfirmActionModal } from '@/shared/components/Modal';
import {
  canCancelRequest, formatDate, formatDuration, formatShortSchedule, formatTodayLabel, movementLabel,
  nextRequestAction, requestActionConfirmLabel, requestActionTitle, requestStatusLabel,
  statusToneClass,
} from '@/shared/lib/presentation';

export function DashboardLoading() {
  return (
    <div className="loading-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
    </div>
  );
}

export function DashboardView({
  accessToken,
  dashboard,
  onNavigate,
  onRefresh,
}: {
  accessToken: string;
  dashboard: Dashboard;
  onNavigate: (view: AdminView) => void;
  onRefresh: () => Promise<void>;
}) {
  const [refreshing, setRefreshing] = useState(false);

  async function updateRequest(itemId: string, status: string) {
    await updateAdminRequestStatus(accessToken, itemId, { status });
    await onRefresh();
  }

  async function refreshDashboard() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="dashboard premium-dashboard">
      <header className="page-heading premium-page-heading dashboard-page-heading">
        <div>
          <Typography.Title level={1}>Dashboard</Typography.Title>
          <p>{dashboard.hotelName} · {formatTodayLabel()}</p>
        </div>
        <Button icon={<ReloadOutlined />} loading={refreshing} onClick={refreshDashboard}>Atualizar dados</Button>
      </header>

      <section className="dashboard-overview-section">
        <header className="dashboard-section-heading">
          <div>
            <Typography.Title level={2}>Operação de hoje</Typography.Title>
            <p>Acompanhe os principais movimentos e indicadores do hotel.</p>
          </div>
        </header>
        <div className="premium-dashboard-metrics" aria-label="Operação de hoje">
          {dashboard.todayMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="dashboard-overview-section">
        <header className="dashboard-section-heading">
          <div>
            <Typography.Title level={2}>Pendências operacionais</Typography.Title>
            <p>Itens que dependem de acompanhamento ou ação da equipe.</p>
          </div>
        </header>
        <div className="premium-dashboard-metrics attention" aria-label="Pendências operacionais">
          {dashboard.attentionMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      <section className="premium-dashboard-primary-grid">
        <RequestPriorityList items={dashboard.pendingRequests} onNavigate={onNavigate} onUpdateStatus={updateRequest} />
        <AttentionList alerts={dashboard.alerts} onNavigate={onNavigate} />
      </section>

      <section className="premium-dashboard-secondary-grid">
        <MovementsList items={dashboard.upcomingMovements} onNavigate={onNavigate} />
        <CompactOperationalList
          actionLabel="Ver experiências"
          emptyLabel="Nenhuma experiência aguardando confirmação."
          items={dashboard.pendingExperiences}
          onNavigate={() => onNavigate('reservations')}
          title="Experiências pendentes"
        />
        <CompactOperationalList
          actionLabel="Ver concierge"
          emptyLabel="Tudo em dia. Nenhuma conversa pendente."
          items={dashboard.conciergeConversations}
          onNavigate={() => onNavigate('concierge')}
          title="Concierge"
        />
      </section>
    </div>
  );
}

function AttentionList({
  alerts,
  onNavigate,
}: {
  alerts: Dashboard['alerts'];
  onNavigate: (view: AdminView) => void;
}) {
  return (
    <section className="premium-surface dashboard-panel dashboard-attention-panel">
      <header className="panel-toolbar">
        <div className="dashboard-panel-title">
          <span><WarningOutlined /></span>
          <div><Typography.Title level={2}>Atenção necessária</Typography.Title><p>Exceções que exigem prioridade da equipe.</p></div>
        </div>
      </header>
      {alerts.length === 0 ? (
        <div className="empty-action">
          <p>Nenhuma exceção operacional no momento.</p>
        </div>
      ) : (
        <ul className="alert-list compact-alert-list">
          {alerts.map((alert) => (
            <li className={`alert-item ${alert.tone}`} key={alert.id}>
              <Button
                block
                onClick={() => {
                  if (isAdminView(alert.targetView)) {
                    onNavigate(alert.targetView);
                  }
                }}
                type="text"
              >
                <span>
                  <strong>{alert.title}</strong>
                  <small>
                    {alert.tone === 'critical' ? <b className="critical-badge">Crítico</b> : null}
                    {alert.helper.replace(/^Crítico ·\s*/, '')}{alert.waitMinutes !== undefined ? ` ${formatDuration(alert.waitMinutes)}` : ''}
                  </small>
                </span>
                <em>{alert.actionLabel}</em>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MetricCard({
  metric,
  onNavigate,
}: {
  metric: { label: string; value: number; helper: string; actionLabel?: string; targetView?: string; detail?: string; tone?: string };
  onNavigate: (view: AdminView) => void;
}) {
  const canNavigate = isAdminView(metric.targetView);
  const icon = metricIcon(metric.label);

  return (
    <Button
      className="metric-card actionable-card"
      disabled={!canNavigate}
      onClick={() => {
        if (isAdminView(metric.targetView)) {
          onNavigate(metric.targetView);
        }
      }}
      type="text"
    >
      <span className="dashboard-metric-top"><span className="dashboard-metric-icon">{icon}</span><span className="dashboard-metric-label">{metric.label}</span></span>
      {metric.detail ? (
        <p className="metric-value-line"><strong>{metric.value}</strong> {metric.helper}</p>
      ) : (
        <>
          <strong>{metric.value}</strong>
          <p>{metric.helper}</p>
        </>
      )}
      {metric.detail ? <b className={metric.tone === 'critical' ? 'metric-detail critical' : 'metric-detail'}>{metric.detail}</b> : null}
      {metric.actionLabel && metric.value > 0 ? <small>{metric.actionLabel}</small> : null}
    </Button>
  );
}

function metricIcon(label: string) {
  if (label.includes('Hóspedes')) return <TeamOutlined />;
  if (label.includes('Check-ins')) return <LoginOutlined />;
  if (label.includes('Check-outs')) return <LogoutOutlined />;
  if (label.includes('Solicitações')) return <MessageOutlined />;
  if (label.includes('Experiências')) return <StarOutlined />;
  return <CustomerServiceOutlined />;
}

function RequestPriorityList({
  items,
  onNavigate,
  onUpdateStatus,
}: {
  items: Dashboard['pendingRequests'];
  onNavigate: (view: AdminView) => void;
  onUpdateStatus: (itemId: string, status: string) => Promise<void>;
}) {
  const [statusCandidate, setStatusCandidate] = useState<{ item: Dashboard['pendingRequests'][number]; status: string } | null>(null);

  return (
    <section className="premium-surface dashboard-panel request-panel">
      <header className="panel-toolbar">
        <div className="dashboard-panel-title">
          <span><MessageOutlined /></span>
          <div>
            <Typography.Title level={2}>Solicitações em andamento</Typography.Title>
            <p>Priorizadas por espera e criticidade.</p>
          </div>
        </div>
        <Button onClick={() => onNavigate('requests')} size="small">Ver todas</Button>
      </header>
      {items.length === 0 ? (
        <Empty description="Nenhuma solicitação aberta." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          columns={[
            { title: 'Solicitação', key: 'title', render: (_: unknown, item: Dashboard['pendingRequests'][number]) => <><strong className="table-primary">{item.title}</strong><span className="table-secondary">Solicitado pelo hóspede</span></> },
            { title: 'Hóspede', key: 'guest', render: (_: unknown, item: Dashboard['pendingRequests'][number]) => <><strong className="table-primary">{item.guestName ?? 'Hóspede'}</strong><span className="table-secondary">Quarto {item.roomNumber}</span></> },
            { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', render: (value: string) => <Tag>{value}</Tag> },
            { title: 'Espera', key: 'wait', render: (_: unknown, item: Dashboard['pendingRequests'][number]) => <strong className="wait-time" title={formatDate(item.createdAt)}>{formatDuration(item.waitMinutes)}</strong> },
            { title: 'Ações', key: 'actions', render: (_: unknown, item: Dashboard['pendingRequests'][number]) => <div className="row-actions dashboard-actions">{nextRequestAction(item.status) ? <Button onClick={() => { const action = nextRequestAction(item.status); if (action) setStatusCandidate({ item, status: action.status }); }} size="small" type="primary">{nextRequestAction(item.status)?.label}</Button> : null}{canCancelRequest(item.status) ? <Button danger onClick={() => setStatusCandidate({ item, status: 'cancelled' })} size="small">Cancelar</Button> : null}<Dropdown menu={{ items: [{ key: 'details', label: 'Abrir detalhes' }, ...(canCancelRequest(item.status) ? [{ danger: true, key: 'cancel', label: 'Cancelar' }] : [])], onClick: ({ key }) => { if (key === 'details') onNavigate('requests'); if (key === 'cancel') setStatusCandidate({ item, status: 'cancelled' }); } }}><Button aria-label="Mais ações" title="Mais ações" type="text">•••</Button></Dropdown></div> },
          ]}
          dataSource={items}
          onRow={() => ({ onClick: () => onNavigate('requests') })}
          pagination={false}
          rowClassName="clickable-row"
          rowKey="id"
        />
      )}
      {statusCandidate ? (
        <ConfirmActionModal
          confirmLabel={requestActionConfirmLabel(statusCandidate.status)}
          message={`A solicitação "${statusCandidate.item.title}" será marcada como ${requestStatusLabel(statusCandidate.status)}.`}
          onCancel={() => setStatusCandidate(null)}
          onConfirm={() => {
            onUpdateStatus(statusCandidate.item.id, statusCandidate.status);
            setStatusCandidate(null);
          }}
          title={requestActionTitle(statusCandidate.status)}
          tone={statusCandidate.status === 'cancelled' ? 'danger' : 'primary'}
        />
      ) : null}
    </section>
  );
}

function MovementsList({
  items,
  onNavigate,
}: {
  items: Dashboard['upcomingMovements'];
  onNavigate: (view: AdminView) => void;
}) {
  return (
    <section className="premium-surface dashboard-panel compact-panel dashboard-movements-panel">
      <header className="panel-toolbar">
        <div className="dashboard-panel-title"><span><CalendarOutlined /></span><div><Typography.Title level={2}>Próximas movimentações</Typography.Title><p>Agenda operacional de hoje.</p></div></div>
        <Button onClick={() => onNavigate('stays')} size="small">Ver estadias</Button>
      </header>
      {items.length === 0 ? (
        <div className="empty-action">
          <p>Nenhuma movimentação prevista para hoje.</p>
        </div>
      ) : (
        <ol className="movement-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.timeLabel} · {movementLabel(item.type)}</span>
              <strong>{item.title}</strong>
              <p>{item.helper}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CompactOperationalList({
  actionLabel,
  emptyLabel,
  items,
  onNavigate,
  title,
}: {
  actionLabel: string;
  emptyLabel: string;
  items: Dashboard['pendingExperiences'];
  onNavigate: () => void;
  title: string;
}) {
  return (
    <section className="premium-surface dashboard-panel compact-panel">
      <header className="panel-toolbar">
        <div className="dashboard-panel-title"><span>{title === 'Concierge' ? <CustomerServiceOutlined /> : <StarOutlined />}</span><div><Typography.Title level={2}>{title}</Typography.Title><p>{title === 'Concierge' ? 'Conversas aguardando retorno.' : 'Confirmações que aguardam revisão.'}</p></div></div>
        <Button onClick={onNavigate} size="small">{actionLabel}</Button>
      </header>
      {items.length === 0 ? (
        <div className="empty-action">
          <p>{emptyLabel}</p>
        </div>
      ) : (
        <ul className="mini-dashboard-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                {item.scheduledAt ? <span>{formatShortSchedule(item.scheduledAt)}</span> : null}
                <span>{item.guestName ?? 'Hóspede'} · Quarto {item.roomNumber}</span>
              </div>
              <span className={`status-pill ${statusToneClass(item)}`}>{item.waitMinutes !== undefined ? formatDuration(item.waitMinutes) : item.statusLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

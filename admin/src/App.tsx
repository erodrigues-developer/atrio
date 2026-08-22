import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Checkbox, DatePicker, Dropdown, Empty, Input, InputNumber, Menu, Modal as AntModal, Pagination as AntPagination, Select as AntSelect, Table, Tag, TimePicker, Typography, Upload } from 'antd';
import { ApartmentOutlined, BankOutlined, BellOutlined, CalendarOutlined, ClockCircleOutlined, DeleteOutlined, DownOutlined, DownloadOutlined, EditOutlined, EyeOutlined, HomeOutlined, LeftOutlined, LogoutOutlined, MailOutlined, MinusOutlined, MobileOutlined, MoreOutlined, MessageOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined, SendOutlined, SettingOutlined, StarOutlined, TeamOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import staysEmptyImage from './assets/stays-empty.png';
import {
  AdminHotelSettings,
  AdminGuest,
  AdminExperience,
  AdminExperienceCollection,
  AdminExperienceSlot,
  AdminReservation,
  AdminSession,
  AdminStay,
  ADMIN_SESSION_EXPIRED_EVENT,
  ConciergeConversation,
  ConciergeMessage,
  ConsumptionItem,
  CreateStayPayload,
  Dashboard,
  ServiceDefinition,
  ServiceRequest,
  cancelStay,
  checkInStay,
  checkOutStay,
  createAdminExperience,
  createAdminExperienceCollection,
  createAdminExperienceSlot,
  createAdminReservation,
  createAdminService,
  createGuest,
  createStayConsumption,
  createHotelUsefulInfo,
  deleteStayConsumption,
  createStay,
  downloadReport,
  getDashboard,
  getHotelSettings,
  getMe,
  linkExperienceToCollection,
  listConciergeConversations,
  listConciergeMessages,
  listAdminExperienceCollections,
  listAdminExperienceSlots,
  listAdminExperiences,
  listAdminReservations,
  listAdminRequests,
  listAdminServices,
  listStayConsumption,
  listGuests,
  listStays,
  login,
  logout,
  resendStayAccess,
  sendConciergeMessage,
  setAdminServicePublished,
  uploadAdminExperienceCollectionImage,
  uploadAdminExperienceImage,
  uploadHotelHeroImage,
  uploadHotelLogo,
  updateHotelWifi,
  updateStay,
  updateStayConsumption,
  updateAdminRequestStatus,
  updateAdminExperienceSlot,
  updateAdminReservationStatus,
} from './api';

const SESSION_STORAGE_KEY = 'atrio-admin-session';
type AdminView = 'dashboard' | 'stays' | 'guests' | 'services' | 'requests' | 'experiences' | 'reservations' | 'concierge' | 'reports' | 'settings';

const VIEW_ROUTES: Record<AdminView, string> = {
  dashboard: '/',
  stays: '/stays',
  guests: '/guests',
  services: '/services',
  requests: '/requests',
  experiences: '/experiences',
  reservations: '/reservations',
  concierge: '/concierge',
  reports: '/reports',
  settings: '/settings',
};

function viewFromPath(pathname: string): AdminView {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.entries(VIEW_ROUTES) as Array<[AdminView, string]>).find(([, path]) => path === normalizedPath);

  return match?.[0] ?? 'dashboard';
}

function pathForView(view: AdminView) {
  return VIEW_ROUTES[view];
}

function readStoredSession(): AdminSession | null {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function App() {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    function expireSession() {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      setSession(null);
    }

    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);

    if (!session) {
      return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    const delay = expiresAt - Date.now();

    if (!Number.isFinite(expiresAt) || delay <= 0) {
      expireSession();
      return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    }

    const timeout = window.setTimeout(expireSession, delay);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, expireSession);
    };
  }, [session?.expiresAt]);

  if (!session) {
    return <LoginScreen onAuthenticated={setSession} />;
  }

  return <AdminShell session={session} onSessionChange={setSession} />;
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: (session: AdminSession) => void }) {
  const [email, setEmail] = useState('admin@atrio.app');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      onAuthenticated(await login(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div>
          <p className="eyebrow">Atrio Admin</p>
          <Typography.Title level={1}>Operacao do hotel</Typography.Title>
          <p className="login-copy">Acesse o ambiente administrativo para acompanhar estadias, reservas e solicitações.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <Input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Senha
            <Input.Password
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button block htmlType="submit" loading={isSubmitting} type="primary">Entrar</Button>
        </form>
      </section>
    </main>
  );
}

function AdminShell({
  session,
  onSessionChange,
}: {
  session: AdminSession;
  onSessionChange: (session: AdminSession | null) => void;
}) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [activeView, setActiveView] = useState<AdminView>(() => viewFromPath(window.location.pathname));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuItems = useMemo<
    Array<{ label: string; icon: typeof HomeOutlined; view?: AdminView }>
  >(
    () => [
      { label: 'Dashboard', icon: HomeOutlined, view: 'dashboard' as const },
      { label: 'Estadias', icon: ApartmentOutlined, view: 'stays' as const },
      { label: 'Hóspedes', icon: TeamOutlined, view: 'guests' as const },
      { label: 'Serviços', icon: UnorderedListOutlined, view: 'services' as const },
      { label: 'Solicitações', icon: MessageOutlined, view: 'requests' as const },
      { label: 'Experiências', icon: StarOutlined, view: 'experiences' as const },
      { label: 'Reservas', icon: CalendarOutlined, view: 'reservations' as const },
      { label: 'Concierge', icon: MessageOutlined, view: 'concierge' as const },
      { label: 'Relatórios', icon: DownloadOutlined, view: 'reports' as const },
      { label: 'Configurações', icon: SettingOutlined, view: 'settings' as const },
    ],
    [],
  );

  useEffect(() => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

    if (!Object.values(VIEW_ROUTES).includes(normalizedPath)) {
      window.history.replaceState({}, '', pathForView('dashboard'));
      setActiveView('dashboard');
    }

    function handlePopState() {
      setActiveView(viewFromPath(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigateToView(view: AdminView) {
    const nextPath = pathForView(view);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setActiveView(view);
  }

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [admin, dashboardResponse] = await Promise.all([
          getMe(session.accessToken),
          getDashboard(session.accessToken),
        ]);

        if (!isMounted) {
          return;
        }

        onSessionChange({ ...session, admin });
        setDashboard(dashboardResponse);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar o dashboard.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [session.accessToken]);

  async function handleLogout() {
    await logout(session.accessToken).catch(() => null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    onSessionChange(null);
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <a className="brand" href={pathForView('dashboard')} onClick={(event) => { event.preventDefault(); navigateToView('dashboard'); }}>
          <span className="brand-mark"><BankOutlined /></span>
          <div>
            <strong>Atrio</strong>
            <span>HOSPITALIDADE</span>
          </div>
        </a>
        <Menu
          items={menuItems.flatMap((item) => {
            if (!item.view) return [];
            const Icon = item.icon;
            return [{ key: item.view, icon: <Icon />, label: item.label }];
          })}
          mode="inline"
          onClick={({ key }) => navigateToView(key as AdminView)}
          selectedKeys={[activeView]}
        />
        <div className="sidebar-footer">
          <Button block className="collapse-menu-button" icon={<LeftOutlined />} type="text">Recolher menu</Button>
          <div className="help-card">
            <QuestionCircleOutlined />
            <div>
              <strong>Precisa de ajuda?</strong>
              <p>Acesse nossa central de ajuda</p>
            </div>
          </div>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="global-search"><Input prefix={<SearchOutlined />} placeholder="Buscar no sistema..." /></div>
          <div className="account">
            <Button aria-label="Notificações" className="topbar-icon-button" icon={<BellOutlined />} type="text" />
            <Button aria-label="Mensagens" className="topbar-icon-button" icon={<MailOutlined />} type="text" />
            <Button aria-label="Ajuda" className="topbar-icon-button" icon={<QuestionCircleOutlined />} type="text" />
            <Dropdown
              menu={{
                items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Sair' }],
                onClick: ({ key }) => { if (key === 'logout') handleLogout(); },
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button className="account-menu-trigger" type="text">
                <span className="account-avatar">{session.admin.name.charAt(0).toUpperCase()}</span>
                <span className="account-copy">
                  <strong>{session.admin.name}</strong>
                  <span>{session.admin.role}</span>
                </span>
                <DownOutlined className="account-chevron" />
              </Button>
            </Dropdown>
          </div>
        </header>
        {activeView !== 'stays' ? (
          <header className="page-heading shared-page-heading">
            <div>
              <Typography.Title level={1}>{viewTitle(activeView)}</Typography.Title>
              <p>{activeView === 'dashboard' ? `${session.admin.hotel.name} · ${formatTodayLabel()}` : `Gerencie ${viewTitle(activeView).toLocaleLowerCase('pt-BR')} do hotel.`}</p>
            </div>
          </header>
        ) : null}
        {activeView === 'dashboard' ? (
          <>
            {isLoading ? <DashboardLoading /> : null}
            {error ? <div className="error-state">{error}</div> : null}
            {!isLoading && !error && dashboard ? (
              <DashboardView
                accessToken={session.accessToken}
                dashboard={dashboard}
                onNavigate={navigateToView}
                onRefresh={async () => setDashboard(await getDashboard(session.accessToken))}
              />
            ) : null}
          </>
        ) : null}
        {activeView === 'stays' ? <StaysView accessToken={session.accessToken} /> : null}
        {activeView === 'guests' ? <GuestsView accessToken={session.accessToken} /> : null}
        {activeView === 'services' ? <ServicesView accessToken={session.accessToken} /> : null}
        {activeView === 'requests' ? <RequestsView accessToken={session.accessToken} /> : null}
        {activeView === 'experiences' ? <ExperiencesView accessToken={session.accessToken} /> : null}
        {activeView === 'reservations' ? <ReservationsView accessToken={session.accessToken} /> : null}
        {activeView === 'concierge' ? <ConciergeView accessToken={session.accessToken} /> : null}
        {activeView === 'reports' ? <ReportsView accessToken={session.accessToken} /> : null}
        {activeView === 'settings' ? <SettingsView accessToken={session.accessToken} /> : null}
      </section>
    </main>
  );
}

function viewTitle(view: AdminView) {
  const titles: Record<AdminView, string> = {
    dashboard: 'Dashboard operacional',
    stays: 'Estadias',
    guests: 'Hóspedes',
    services: 'Serviços',
    requests: 'Solicitações',
    experiences: 'Experiências',
    reservations: 'Reservas',
    concierge: 'Concierge',
    reports: 'Relatórios',
    settings: 'Configurações',
  };

  return titles[view];
}

function DashboardLoading() {
  return (
    <div className="loading-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
    </div>
  );
}

function DashboardView({
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
  async function updateRequest(itemId: string, status: string) {
    await updateAdminRequestStatus(accessToken, itemId, { status });
    await onRefresh();
  }

  return (
    <div className="dashboard">
      <section className="dashboard-columns operational-layout">
        <header className="dashboard-heading">
          <Typography.Title level={2}>Operação de hoje</Typography.Title>
        </header>
        <div className="main-stack">
          <section className="metrics-grid today-grid" aria-label="Operação de hoje">
            {dashboard.todayMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} onNavigate={onNavigate} />
            ))}
          </section>
          <Typography.Title level={2} className="dashboard-section-title">Pendências</Typography.Title>
          <section className="metrics-grid attention-grid" aria-label="Atenção necessária">
            {dashboard.attentionMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} onNavigate={onNavigate} />
            ))}
          </section>
          <RequestPriorityList items={dashboard.pendingRequests} onNavigate={onNavigate} onUpdateStatus={updateRequest} />
        </div>
        <aside className="side-stack">
          <AttentionList alerts={dashboard.alerts} onNavigate={onNavigate} />
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
        </aside>
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
    <section className="table-panel compact-panel">
      <header>
        <Typography.Title level={2}>Atenção necessária</Typography.Title>
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
      <span>{metric.label}</span>
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
    <section className="table-panel request-panel">
      <header className="panel-toolbar">
        <div>
          <Typography.Title level={2}>Solicitações em andamento</Typography.Title>
          <p className="muted-text">Priorizadas por espera e criticidade.</p>
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
            { title: 'Ações', key: 'actions', render: (_: unknown, item: Dashboard['pendingRequests'][number]) => <div className="row-actions dashboard-actions">{nextRequestAction(item.status) ? <Button onClick={() => { const action = nextRequestAction(item.status); if (action) setStatusCandidate({ item, status: action.status }); }} size="small" type="primary">{nextRequestAction(item.status)?.label}</Button> : null}{canCancelRequest(item.status) ? <Button danger onClick={() => setStatusCandidate({ item, status: 'cancelled' })} size="small">Cancelar</Button> : null}<Dropdown menu={{ items: [{ key: 'details', label: 'Abrir detalhes' }, ...(canCancelRequest(item.status) ? [{ danger: true, key: 'cancel', label: 'Cancelar' }] : [])], onClick: ({ key }) => { if (key === 'details') onNavigate('requests'); if (key === 'cancel') setStatusCandidate({ item, status: 'cancelled' }); } }}><Button aria-label="Mais ações" type="text">•••</Button></Dropdown></div> },
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
    <section className="table-panel compact-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>Próximas movimentações</Typography.Title>
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
    <section className="table-panel compact-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>{title}</Typography.Title>
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

function GuestsView({ accessToken }: { accessToken: string }) {
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadGuests(nextSearch = search) {
    setIsLoading(true);
    setError(null);

    try {
      setGuests(await listGuests(accessToken, nextSearch));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar hóspedes.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGuests('');
  }, [accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await createGuest(accessToken, form);
      setForm({ firstName: '', lastName: '', phoneNumber: '' });
      await loadGuests('');
      setSearch('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar hóspede.');
    }
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Hóspedes cadastrados</Typography.Title>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadGuests(search); }}>
            <Input placeholder="Buscar hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button htmlType="submit">Buscar</Button>
          </form>
        </header>
        {error ? <Toast tone="error" message={error} onClose={() => setError(null)} /> : null}
        {isLoading ? <p className="empty-state">Carregando hóspedes...</p> : <GuestsTable guests={guests} />}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Novo hóspede</Typography.Title>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>Nome<Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label>
          <label>Sobrenome<Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label>
          <label>Telefone<Input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required /></label>
          <Button htmlType="submit" type="primary">Cadastrar hóspede</Button>
        </form>
      </section>
    </div>
  );
}

function GuestsTable({ guests }: { guests: AdminGuest[] }) {
  if (guests.length === 0) {
    return <Empty description="Nenhum hóspede encontrado." image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return <Table
    columns={[
      { title: 'Nome', key: 'name', render: (_: unknown, guest: AdminGuest) => `${guest.firstName} ${guest.lastName}` },
      { title: 'Telefone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
      { title: 'Mascarado', dataIndex: 'maskedPhone', key: 'maskedPhone' },
    ]}
    dataSource={guests}
    pagination={false}
    rowKey="id"
  />;
}

function ServicesView({ accessToken }: { accessToken: string }) {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishCandidate, setPublishCandidate] = useState<ServiceDefinition | null>(null);
  const [form, setForm] = useState({
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
  });

  async function loadServices() {
    setError(null);
    try {
      setServices(await listAdminServices(accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar serviços.');
    }
  }

  useEffect(() => {
    loadServices();
  }, [accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await createAdminService(accessToken, {
        id: form.id || undefined,
        title: form.title,
        description: form.description,
        icon: form.icon,
        fulfillmentType: form.fulfillmentType,
        published: form.published,
        requestSchema: {
          fields: [
            {
              name: form.fieldName,
              label: form.fieldLabel,
              type: form.fieldType,
              required: form.fieldRequired,
              maxLength: form.fieldType === 'string' ? 500 : undefined,
            },
          ],
        },
      });
      setMessage('Serviço cadastrado.');
      setForm({ ...form, id: '', title: '', description: '' });
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar serviço.');
    }
  }

  async function togglePublished(service: ServiceDefinition) {
    setMessage(null);
    setError(null);

    try {
      await setAdminServicePublished(accessToken, service.id, !service.published);
      setMessage(service.published ? 'Serviço despublicado.' : 'Serviço publicado.');
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar publicacao.');
    }
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar"><Typography.Title level={2}>Catálogo de serviços</Typography.Title></header>
        {message || error ? <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
        {services.length === 0 ? <Empty description="Nenhum serviço cadastrado." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
          <Table
            columns={[
              { title: 'Serviço', key: 'service', render: (_: unknown, service: ServiceDefinition) => <><strong>{service.title}</strong><br /><span className="muted-text">{service.description}</span></> },
              { title: 'Formulário', key: 'form', render: (_: unknown, service: ServiceDefinition) => `${service.requestSchema.fields.length} campo(s)` },
              { title: 'Status', key: 'status', render: (_: unknown, service: ServiceDefinition) => <Tag>{service.published ? 'Publicado' : 'Rascunho'}</Tag> },
              { title: 'Ações', key: 'actions', render: (_: unknown, service: ServiceDefinition) => <Button onClick={() => setPublishCandidate(service)} size="small">{service.published ? 'Despublicar' : 'Publicar'}</Button> },
            ]}
            dataSource={services}
            pagination={false}
            rowKey="id"
          />
        )}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Novo serviço</Typography.Title>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>ID opcional<Input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></label>
          <label>Titulo<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Descricao<Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <div className="two-columns">
            <label>Icone<Input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} required /></label>
            <label>Atendimento<Input value={form.fulfillmentType} onChange={(event) => setForm({ ...form, fulfillmentType: event.target.value })} required /></label>
          </div>
          <Typography.Title level={3}>Campo do formulario</Typography.Title>
          <div className="two-columns">
            <label>Nome<Input value={form.fieldName} onChange={(event) => setForm({ ...form, fieldName: event.target.value })} required /></label>
            <label>Label<Input value={form.fieldLabel} onChange={(event) => setForm({ ...form, fieldLabel: event.target.value })} required /></label>
          </div>
          <label>Tipo
            <AntSelect onChange={(value) => setForm({ ...form, fieldType: value })} options={[{ label: 'Texto', value: 'string' }, { label: 'Número', value: 'number' }]} value={form.fieldType} />
          </label>
          <label className="check-row"><Checkbox checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publicado</label>
          <Button htmlType="submit" type="primary">Cadastrar serviço</Button>
        </form>
      </section>
      {publishCandidate ? (
        <ConfirmActionModal
          confirmLabel={publishCandidate.published ? 'Despublicar serviço' : 'Publicar serviço'}
          message={`O serviço "${publishCandidate.title}" será ${publishCandidate.published ? 'removido do catálogo publicado' : 'publicado no catálogo'}.`}
          onCancel={() => setPublishCandidate(null)}
          onConfirm={() => {
            togglePublished(publishCandidate);
            setPublishCandidate(null);
          }}
          title={publishCandidate.published ? 'Despublicar serviço?' : 'Publicar serviço?'}
          tone={publishCandidate.published ? 'danger' : 'primary'}
        />
      ) : null}
    </div>
  );
}

function RequestsView({ accessToken }: { accessToken: string }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ request: ServiceRequest; status: string } | null>(null);

  async function loadRequests(nextQuery = { search, status }) {
    setError(null);
    try {
      setRequests(await listAdminRequests(accessToken, nextQuery));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar solicitações.');
    }
  }

  useEffect(() => {
    loadRequests({ search: '', status: '' });
  }, [accessToken]);

  async function updateStatus(request: ServiceRequest, nextStatus: string) {
    setMessage(null);
    setError(null);

    try {
      await updateAdminRequestStatus(accessToken, request.id, { status: nextStatus, internalNote: internalNote || undefined });
      setMessage('Status atualizado.');
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar solicitação.');
    }
  }

  return (
    <section className="table-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>Fila de solicitações</Typography.Title>
        <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadRequests({ search, status }); }}>
          <Input placeholder="Quarto, hóspede ou serviço" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AntSelect onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Recebido', value: 'received' }, { label: 'Aceito', value: 'accepted' }, { label: 'Em preparo', value: 'in_progress' }, { label: 'A caminho', value: 'on_the_way' }, { label: 'Concluído', value: 'completed' }, { label: 'Cancelado', value: 'cancelled' }, { label: 'Recusado', value: 'rejected' }]} value={status} />
          <Button htmlType="submit">Filtrar</Button>
        </form>
      </header>
      <div className="request-note-bar">
        <Input placeholder="Nota interna para a proxima atualizacao" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
      </div>
      {message || error ? <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
      {requests.length === 0 ? <Empty description="Nenhuma solicitação encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
        <Table
          columns={[
            { title: 'Serviço', key: 'title', render: (_: unknown, request: ServiceRequest) => <><strong>{request.title}</strong><br /><span className="muted-text">{formatDate(request.createdAt)}</span></> },
            { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
            { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
            { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', render: (value: string) => <Tag>{value}</Tag> },
            { title: 'Nota', key: 'note', render: (_: unknown, request: ServiceRequest) => request.note || request.internalNote || '-' },
            { title: 'Ações', key: 'actions', render: (_: unknown, request: ServiceRequest) => <div className="row-actions">{nextRequestAction(request.status) ? <Button onClick={() => { const action = nextRequestAction(request.status); if (action) setStatusCandidate({ request, status: action.status }); }} size="small">{nextRequestAction(request.status)?.label}</Button> : null}{canCancelRequest(request.status) ? <Button danger onClick={() => setStatusCandidate({ request, status: 'cancelled' })} size="small">Cancelar</Button> : null}</div> },
          ]}
          dataSource={requests}
          pagination={false}
          rowKey="id"
        />
      )}
      {statusCandidate ? (
        <ConfirmActionModal
          confirmLabel={`Marcar como ${requestStatusLabel(statusCandidate.status)}`}
          message={`A solicitação "${statusCandidate.request.title}" do quarto ${statusCandidate.request.roomNumber} será marcada como ${requestStatusLabel(statusCandidate.status)}.`}
          onCancel={() => setStatusCandidate(null)}
          onConfirm={() => {
            updateStatus(statusCandidate.request, statusCandidate.status);
            setStatusCandidate(null);
          }}
          title={requestActionTitle(statusCandidate.status)}
          tone={statusCandidate.status === 'cancelled' ? 'danger' : 'primary'}
        />
      ) : null}
    </section>
  );
}

function ExperiencesView({ accessToken }: { accessToken: string }) {
  const [experiences, setExperiences] = useState<AdminExperience[]>([]);
  const [collections, setCollections] = useState<AdminExperienceCollection[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState('');
  const [slots, setSlots] = useState<AdminExperienceSlot[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slotCandidate, setSlotCandidate] = useState<AdminExperienceSlot | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    id: '',
    title: '',
    description: '',
    category: 'Gastronomia',
    timeLabel: 'Hoje',
    priceLabel: 'Sob consulta',
    imageUrl: 'https://cdn.atrio.app/experiences/new-experience.webp',
    locationLabel: 'Hotel',
    included: '',
    published: true,
  });
  const [collectionForm, setCollectionForm] = useState({ id: '', title: '', description: '', imageUrl: '', featured: false, published: true });
  const [linkForm, setLinkForm] = useState({ collectionId: '', experienceId: '', position: 1 });
  const [slotForm, setSlotForm] = useState({ startsAt: new Date().toISOString().slice(0, 16), isAvailable: true, position: 1 });

  async function loadAll(nextExperienceId = selectedExperienceId) {
    setError(null);
    try {
      const [experienceResponse, collectionResponse] = await Promise.all([
        listAdminExperiences(accessToken),
        listAdminExperienceCollections(accessToken),
      ]);
      setExperiences(experienceResponse);
      setCollections(collectionResponse);
      const firstExperienceId = nextExperienceId || experienceResponse[0]?.id || '';
      setSelectedExperienceId(firstExperienceId);
      if (firstExperienceId) {
        setSlots(await listAdminExperienceSlots(accessToken, firstExperienceId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar experiências.');
    }
  }

  useEffect(() => {
    loadAll('');
  }, [accessToken]);

  async function handleExperienceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createAdminExperience(accessToken, {
        id: experienceForm.id || undefined,
        title: experienceForm.title,
        description: experienceForm.description,
        category: experienceForm.category,
        timeLabel: experienceForm.timeLabel,
        priceLabel: experienceForm.priceLabel,
        badge: null,
        imageUrl: experienceForm.imageUrl,
        durationLabel: null,
        availabilityLabel: null,
        locationLabel: experienceForm.locationLabel,
        locationDescription: null,
        policy: null,
        included: experienceForm.included.split(',').map((item) => item.trim()).filter(Boolean),
        published: experienceForm.published,
      });
      setMessage('Experiência cadastrada.');
      setExperienceForm({ ...experienceForm, id: '', title: '', description: '', included: '' });
      await loadAll('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cadastrar experiência.');
    }
  }

  async function handleCollectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createAdminExperienceCollection(accessToken, { ...collectionForm, id: collectionForm.id || undefined });
      setMessage('Colecao cadastrada.');
      setCollectionForm({ id: '', title: '', description: '', imageUrl: '', featured: false, published: true });
      await loadAll();
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
    if (!selectedExperienceId) return;
    setMessage(null);
    setError(null);
    try {
      await createAdminExperienceSlot(accessToken, selectedExperienceId, {
        startsAt: new Date(slotForm.startsAt).toISOString(),
        isAvailable: slotForm.isAvailable,
        position: Number(slotForm.position),
      });
      setMessage('Horário cadastrado.');
      setSlots(await listAdminExperienceSlots(accessToken, selectedExperienceId));
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
      setSlots(await listAdminExperienceSlots(accessToken, slot.experienceId));
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
      await loadAll(experienceId);
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
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    }
  }

  return (
    <div className="management-grid wide">
      <section className="table-panel">
        <header className="panel-toolbar"><Typography.Title level={2}>Experiências</Typography.Title></header>
        {message || error ? <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
        <Table
          columns={[
            { title: 'Titulo', key: 'title', render: (_: unknown, experience: AdminExperience) => <><strong>{experience.title}</strong><br /><span className="muted-text">{experience.locationLabel || '-'}</span></> },
            { title: 'Categoria', dataIndex: 'category', key: 'category' },
            { title: 'Status', key: 'status', render: (_: unknown, experience: AdminExperience) => <Tag>{experience.published ? 'Publicado' : 'Rascunho'}</Tag> },
            { title: 'Midia', key: 'media', render: (_: unknown, experience: AdminExperience) => <Upload accept="image/*" beforeUpload={(file) => { const files = new DataTransfer(); files.items.add(file); void handleExperienceImageUpload(experience.id, files.files); return false; }} showUploadList={false}><Button size="small">Enviar imagem</Button></Upload> },
            { title: 'Agenda', key: 'schedule', render: (_: unknown, experience: AdminExperience) => <Button onClick={() => { setSelectedExperienceId(experience.id); listAdminExperienceSlots(accessToken, experience.id).then(setSlots); }} size="small">Ver horários</Button> },
          ]}
          dataSource={experiences}
          pagination={false}
          rowClassName={(experience) => experience.id === selectedExperienceId ? 'selected-row' : ''}
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
        <form className="stack-form" onSubmit={handleExperienceSubmit}>
          <label>ID opcional<Input value={experienceForm.id} onChange={(event) => setExperienceForm({ ...experienceForm, id: event.target.value })} /></label>
          <label>Titulo<Input value={experienceForm.title} onChange={(event) => setExperienceForm({ ...experienceForm, title: event.target.value })} required /></label>
          <label>Descricao<Input value={experienceForm.description} onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })} required /></label>
          <div className="two-columns">
            <label>Categoria<Input value={experienceForm.category} onChange={(event) => setExperienceForm({ ...experienceForm, category: event.target.value })} required /></label>
            <label>Preco<Input value={experienceForm.priceLabel} onChange={(event) => setExperienceForm({ ...experienceForm, priceLabel: event.target.value })} required /></label>
          </div>
          <label>Imagem<Input value={experienceForm.imageUrl} onChange={(event) => setExperienceForm({ ...experienceForm, imageUrl: event.target.value })} required /></label>
          <label>Incluidos<Input value={experienceForm.included} onChange={(event) => setExperienceForm({ ...experienceForm, included: event.target.value })} /></label>
          <label className="check-row"><Checkbox checked={experienceForm.published} onChange={(event) => setExperienceForm({ ...experienceForm, published: event.target.checked })} /> Publicada</label>
          <Button htmlType="submit" type="primary">Cadastrar experiência</Button>
        </form>
        <form className="stack-form section-form" onSubmit={handleCollectionSubmit}>
          <Typography.Title level={3}>Nova coleção</Typography.Title>
          <Input placeholder="ID opcional" value={collectionForm.id} onChange={(event) => setCollectionForm({ ...collectionForm, id: event.target.value })} />
          <Input placeholder="Titulo" value={collectionForm.title} onChange={(event) => setCollectionForm({ ...collectionForm, title: event.target.value })} required />
          <Input placeholder="Descricao" value={collectionForm.description} onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })} required />
          <Input placeholder="URL da imagem" value={collectionForm.imageUrl} onChange={(event) => setCollectionForm({ ...collectionForm, imageUrl: event.target.value })} />
          <label className="check-row"><Checkbox checked={collectionForm.featured} onChange={(event) => setCollectionForm({ ...collectionForm, featured: event.target.checked })} /> Destaque</label>
          <Button htmlType="submit">Cadastrar coleção</Button>
        </form>
        <form className="stack-form section-form" onSubmit={handleLinkSubmit}>
          <Typography.Title level={3}>Vincular a coleção</Typography.Title>
          <AntSelect onChange={(value) => setLinkForm({ ...linkForm, collectionId: value })} options={collections.map((collection) => ({ label: collection.title, value: collection.id }))} placeholder="Colecao" value={linkForm.collectionId || undefined} />
          <AntSelect onChange={(value) => setLinkForm({ ...linkForm, experienceId: value })} options={experiences.map((experience) => ({ label: experience.title, value: experience.id }))} placeholder="Experiência" value={linkForm.experienceId || undefined} />
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

function ReservationsView({ accessToken }: { accessToken: string }) {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [stays, setStays] = useState<AdminStay[]>([]);
  const [experiences, setExperiences] = useState<AdminExperience[]>([]);
  const [slots, setSlots] = useState<AdminExperienceSlot[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCandidate, setStatusCandidate] = useState<{ reservation: AdminReservation; status: string } | null>(null);
  const [form, setForm] = useState({ stayId: '', experienceId: '', slotId: '', guestNote: '' });

  async function loadReservations(nextQuery = { search, status }) {
    setError(null);
    try {
      const [reservationResponse, stayResponse, experienceResponse] = await Promise.all([
        listAdminReservations(accessToken, nextQuery),
        listStays(accessToken, { pageSize: 100 }),
        listAdminExperiences(accessToken),
      ]);
      setReservations(reservationResponse);
      setStays(stayResponse.items);
      setExperiences(experienceResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar reservas.');
    }
  }

  useEffect(() => {
    loadReservations({ search: '', status: '' });
  }, [accessToken]);

  async function handleExperienceChange(experienceId: string) {
    setForm({ ...form, experienceId, slotId: '' });
    setSlots(experienceId ? await listAdminExperienceSlots(accessToken, experienceId) : []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createAdminReservation(accessToken, form);
      setMessage('Reserva criada.');
      setForm({ stayId: '', experienceId: '', slotId: '', guestNote: '' });
      setSlots([]);
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar reserva.');
    }
  }

  async function setReservationStatus(reservation: AdminReservation, nextStatus: string) {
    setMessage(null);
    setError(null);
    try {
      await updateAdminReservationStatus(accessToken, reservation.id, { status: nextStatus });
      setMessage('Status da reserva atualizado.');
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar reserva.');
    }
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Reservas</Typography.Title>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadReservations({ search, status }); }}>
            <Input placeholder="Quarto, hóspede ou experiência" value={search} onChange={(event) => setSearch(event.target.value)} />
            <AntSelect onChange={setStatus} options={[{ label: 'Todos', value: '' }, { label: 'Solicitada', value: 'requested' }, { label: 'Confirmada', value: 'confirmed' }, { label: 'Concluida', value: 'completed' }, { label: 'Cancelada', value: 'cancelled' }, { label: 'Recusada', value: 'rejected' }]} value={status} />
            <Button htmlType="submit">Filtrar</Button>
          </form>
        </header>
        {message || error ? <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
        {reservations.length === 0 ? <Empty description="Nenhuma reserva encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
          <Table
            columns={[
              { title: 'Experiência', key: 'title', render: (_: unknown, reservation: AdminReservation) => <><strong>{reservation.title}</strong><br /><span className="muted-text">{formatDate(reservation.scheduledAt)}</span></> },
              { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
              { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
              { title: 'Status', dataIndex: 'statusLabel', key: 'statusLabel', render: (value: string) => <Tag>{value}</Tag> },
              { title: 'Ações', key: 'actions', render: (_: unknown, reservation: AdminReservation) => <div className="row-actions"><Button onClick={() => setStatusCandidate({ reservation, status: 'confirmed' })} size="small">Confirmar</Button><Button onClick={() => setStatusCandidate({ reservation, status: 'completed' })} size="small">Concluir</Button><Button danger onClick={() => setStatusCandidate({ reservation, status: 'cancelled' })} size="small">Cancelar</Button></div> },
            ]}
            dataSource={reservations}
            pagination={false}
            rowKey="id"
          />
        )}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Nova reserva</Typography.Title>
        <form className="stack-form" onSubmit={handleSubmit}>
          <AntSelect onChange={(value) => setForm({ ...form, stayId: value })} options={stays.map((stay) => ({ label: `Quarto ${stay.roomNumber} - ${stay.guest.firstName}`, value: stay.id }))} placeholder="Estadia" value={form.stayId || undefined} />
          <AntSelect onChange={handleExperienceChange} options={experiences.map((experience) => ({ label: experience.title, value: experience.id }))} placeholder="Experiência" value={form.experienceId || undefined} />
          <AntSelect onChange={(value) => setForm({ ...form, slotId: value })} options={slots.filter((slot) => slot.isAvailable).map((slot) => ({ label: `${slot.dateLabel} ${slot.time}`, value: slot.id }))} placeholder="Horário" value={form.slotId || undefined} />
          <Input placeholder="Observacao opcional" value={form.guestNote} onChange={(event) => setForm({ ...form, guestNote: event.target.value })} />
          <Button htmlType="submit" type="primary">Criar reserva</Button>
        </form>
      </section>
      {statusCandidate ? (
        <ConfirmActionModal
          confirmLabel={`Marcar como ${reservationStatusLabel(statusCandidate.status)}`}
          message={`A reserva "${statusCandidate.reservation.title}" do quarto ${statusCandidate.reservation.roomNumber} será marcada como ${reservationStatusLabel(statusCandidate.status)}.`}
          onCancel={() => setStatusCandidate(null)}
          onConfirm={() => {
            setReservationStatus(statusCandidate.reservation, statusCandidate.status);
            setStatusCandidate(null);
          }}
          title="Atualizar reserva?"
          tone={statusCandidate.status === 'cancelled' ? 'danger' : 'primary'}
        />
      ) : null}
    </div>
  );
}

function ConciergeView({ accessToken }: { accessToken: string }) {
  const [conversations, setConversations] = useState<ConciergeConversation[]>([]);
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [selectedStayId, setSelectedStayId] = useState('');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadConversations(nextSearch = search) {
    setError(null);
    try {
      const response = await listConciergeConversations(accessToken, nextSearch);
      setConversations(response);
      const nextStayId = selectedStayId || response[0]?.stayId || '';
      setSelectedStayId(nextStayId);
      if (nextStayId) {
        setMessages(await listConciergeMessages(accessToken, nextStayId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar conversas.');
    }
  }

  useEffect(() => {
    loadConversations('');
  }, [accessToken]);

  async function selectConversation(stayId: string) {
    setSelectedStayId(stayId);
    setMessages(await listConciergeMessages(accessToken, stayId));
  }

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStayId || !reply.trim()) return;
    setError(null);
    try {
      await sendConciergeMessage(accessToken, selectedStayId, reply.trim());
      setReply('');
      setMessages(await listConciergeMessages(accessToken, selectedStayId));
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar resposta.');
    }
  }

  return (
    <div className="management-grid">
      <section className="table-panel">
        <header className="panel-toolbar">
          <Typography.Title level={2}>Conversas</Typography.Title>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadConversations(search); }}>
            <Input placeholder="Quarto ou hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button htmlType="submit">Filtrar</Button>
          </form>
        </header>
        {error ? <Toast tone="error" message={error} onClose={() => setError(null)} /> : null}
        {conversations.length === 0 ? <Empty description="Nenhuma conversa encontrada." image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
          <Table
            columns={[
              { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
              { title: 'Hóspede', dataIndex: 'guestName', key: 'guestName' },
              { title: 'Mensagens', dataIndex: 'guestMessageCount', key: 'guestMessageCount' },
              { title: 'Última', key: 'lastMessageAt', render: (_: unknown, conversation: ConciergeConversation) => formatDate(conversation.lastMessageAt ?? undefined) },
            ]}
            dataSource={conversations}
            onRow={(conversation) => ({ onClick: () => selectConversation(conversation.stayId) })}
            pagination={false}
            rowClassName={(conversation) => conversation.stayId === selectedStayId ? 'selected-row clickable-row' : 'clickable-row'}
            rowKey="stayId"
          />
        )}
      </section>
      <section className="form-panel">
        <Typography.Title level={2}>Atendimento</Typography.Title>
        <div className="chat-thread">
          {messages.length === 0 ? <p className="mini-empty">Selecione uma conversa.</p> : messages.map((message) => (
            <article className={`chat-message ${message.sender}`} key={message.id}>
              <span>{message.sender === 'hotel' ? 'Hotel' : 'Hóspede'} - {formatDate(message.createdAt)}</span>
              <p>{message.text}</p>
            </article>
          ))}
        </div>
        <form className="stack-form section-form" onSubmit={handleReply}>
          <Input.TextArea placeholder="Responder ao hóspede" value={reply} onChange={(event) => setReply(event.target.value)} rows={4} />
          <Button disabled={!selectedStayId} htmlType="submit" type="primary">Enviar resposta</Button>
        </form>
      </section>
    </div>
  );
}

function ReportsView({ accessToken }: { accessToken: string }) {
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

function SettingsView({ accessToken }: { accessToken: string }) {
  const [settings, setSettings] = useState<AdminHotelSettings | null>(null);
  const [wifiForm, setWifiForm] = useState({ wifiNetwork: '', wifiPassword: '' });
  const [infoForm, setInfoForm] = useState<{
    scope: 'dashboard' | 'stay';
    title: string;
    description: string;
    position: number;
  }>({ scope: 'stay', title: '', description: '', position: 1 });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    setError(null);
    try {
      const response = await getHotelSettings(accessToken);
      setSettings(response);
      setWifiForm({ wifiNetwork: response.wifiNetwork, wifiPassword: response.wifiPassword });
      setInfoForm((current) => ({ ...current, position: response.usefulInfo.length + 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar configurações.');
    }
  }

  useEffect(() => {
    loadSettings();
  }, [accessToken]);

  async function uploadHotelMedia(kind: 'logo' | 'hero', fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setMessage(null);
    setError(null);
    try {
      setSettings(kind === 'logo' ? await uploadHotelLogo(accessToken, file) : await uploadHotelHeroImage(accessToken, file));
      setMessage('Midia do hotel atualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mídia.');
    }
  }

  async function handleWifiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const response = await updateHotelWifi(accessToken, wifiForm);
      setSettings(response);
      setWifiForm({ wifiNetwork: response.wifiNetwork, wifiPassword: response.wifiPassword });
      setMessage('Wi-Fi do hotel atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar Wi-Fi.');
    }
  }

  async function handleInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createHotelUsefulInfo(accessToken, infoForm);
      setInfoForm({ scope: 'stay', title: '', description: '', position: infoForm.position + 1 });
      await loadSettings();
      setMessage('Informação do hotel adicionada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar informação.');
    }
  }

  return (
    <section className="table-panel narrow-panel">
      <header className="panel-toolbar">
        <Typography.Title level={2}>Hotel</Typography.Title>
      </header>
      {message || error ? <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} /> : null}
      {settings ? (
        <div className="settings-grid">
          <article>
            <strong>{settings.name}</strong>
            <span className="muted-text">ID {settings.id}</span>
          </article>
          <section className="settings-section">
            <Typography.Title level={3}>Identidade visual</Typography.Title>
            <label>Logo<Upload accept="image/*" beforeUpload={(file) => { const files = new DataTransfer(); files.items.add(file); void uploadHotelMedia('logo', files.files); return false; }} showUploadList={false}><Button>Selecionar logo</Button></Upload></label>
            {settings.logoUrl ? <img alt="Logo do hotel" className="media-preview" src={settings.logoUrl} /> : null}
            <label>Imagem principal<Upload accept="image/*" beforeUpload={(file) => { const files = new DataTransfer(); files.items.add(file); void uploadHotelMedia('hero', files.files); return false; }} showUploadList={false}><Button>Selecionar imagem</Button></Upload></label>
            {settings.heroImageUrl ? <img alt="Imagem principal do hotel" className="media-preview hero" src={settings.heroImageUrl} /> : null}
          </section>
          <section className="settings-section">
            <Typography.Title level={3}>Wi-Fi do hotel</Typography.Title>
            <form className="stack-form" onSubmit={handleWifiSubmit}>
              <label>Rede<Input value={wifiForm.wifiNetwork} onChange={(event) => setWifiForm({ ...wifiForm, wifiNetwork: event.target.value })} required /></label>
              <label>Senha<Input.Password value={wifiForm.wifiPassword} onChange={(event) => setWifiForm({ ...wifiForm, wifiPassword: event.target.value })} required /></label>
              <div className="modal-footer settings-footer">
                <Button htmlType="submit" type="primary">Salvar Wi-Fi</Button>
              </div>
            </form>
          </section>
          <section className="settings-section">
            <Typography.Title level={3}>Informações para hóspedes</Typography.Title>
            <MiniList items={settings.usefulInfo.map((item) => `${item.title}: ${item.description}`)} emptyLabel="Nenhuma informação cadastrada." />
            <form className="stack-form modal-grid-form" onSubmit={handleInfoSubmit}>
              <label>Exibição
                <AntSelect onChange={(value) => setInfoForm({ ...infoForm, scope: value as 'dashboard' | 'stay' })} options={[{ label: 'Hoje', value: 'dashboard' }, { label: 'Estadia', value: 'stay' }]} value={infoForm.scope} />
              </label>
              <label>Título<Input placeholder="Horário do café da manhã" value={infoForm.title} onChange={(event) => setInfoForm({ ...infoForm, title: event.target.value })} required /></label>
              <label className="wide-field">Descrição<Input.TextArea placeholder="Servido das 06:30 às 10:30 no restaurante do térreo." rows={3} value={infoForm.description} onChange={(event) => setInfoForm({ ...infoForm, description: event.target.value })} required /></label>
              <div className="modal-footer settings-footer">
                <Button htmlType="submit" type="primary">Adicionar informação</Button>
              </div>
            </form>
          </section>
        </div>
      ) : <p className="empty-state">Carregando configurações...</p>}
    </section>
  );
}

function StaysView({ accessToken }: { accessToken: string }) {
  const pageSize = 10;
  const [stays, setStays] = useState<AdminStay[]>([]);
  const [guests, setGuests] = useState<AdminGuest[]>([]);
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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [detailStay, setDetailStay] = useState<AdminStay | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData(nextQuery: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {
    search: appliedFilters.search,
    status: appliedFilters.status,
    dateFrom: appliedFilters.periodStart,
    dateTo: appliedFilters.periodEnd,
    page,
    pageSize,
  }) {
    setIsLoading(true);
    setError(null);

    try {
      const [staysResponse, guestsResponse] = await Promise.all([
        listStays(accessToken, nextQuery),
        listGuests(accessToken),
      ]);
      setStays(staysResponse.items);
      setTotalItems(staysResponse.total);
      setTotalPages(staysResponse.totalPages);
      setGuests(guestsResponse);
      setDetailStay((current) => current ? staysResponse.items.find((stay) => stay.id === current.id) ?? current : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar estadias.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData({
      search: appliedFilters.search,
      status: appliedFilters.status,
      dateFrom: appliedFilters.periodStart,
      dateTo: appliedFilters.periodEnd,
      page,
      pageSize,
    });
  }, [accessToken, appliedFilters.search, appliedFilters.status, appliedFilters.periodStart, appliedFilters.periodEnd, page]);

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
      await loadData();
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
      await loadData();
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
      await loadData();
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
        {message || error ? (
          <Toast tone={error ? 'error' : 'success'} message={error ?? message ?? ''} onClose={() => { setMessage(null); setError(null); }} />
        ) : null}
        <StaysTable
          emptyContent={<StaysEmptyState onClearFilters={clearFilters} onCreate={() => setIsCreateOpen(true)} />}
          isLoading={isLoading}
          stays={stays}
          onCancel={handleCancel}
          onSelect={setDetailStay}
          onResend={handleResend}
        />
        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={totalItems} totalPages={totalPages} onPageChange={setPage} />
      </section>
      {detailStay ? (
        <Modal title="Detalhes da estadia" onClose={() => setDetailStay(null)} size="large">
          <StayDetailPanel
            accessToken={accessToken}
            guests={guests}
            stay={detailStay}
            onCancel={handleCancel}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onResend={handleResend}
            onUpdated={() => loadData()}
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
            loadData({
              search: '',
              status: 'active',
              dateFrom: currentMonth.start,
              dateTo: currentMonth.end,
              page: 1,
              pageSize,
            });
          }}
        />
      ) : null}
    </div>
  );
}

function StaysEmptyState({ onClearFilters, onCreate }: { onClearFilters: () => void; onCreate: () => void }) {
  return (
    <div className="stays-empty-state">
      <img alt="Porta de hotel com uma mala" src={staysEmptyImage} />
      <Typography.Title level={3}>Nenhuma estadia encontrada</Typography.Title>
      <p>Tente ajustar os filtros ou crie uma nova estadia para começar.</p>
      <div className="empty-state-actions">
        <Button onClick={onClearFilters}>Limpar filtros</Button>
        <Button icon={<PlusOutlined />} onClick={onCreate} type="primary">Nova estadia</Button>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}) {
  return (
    <footer className="pagination-bar">
      <div className="pagination-size">
        <span>Itens por página</span>
        <AntSelect options={[{ label: '10', value: 10 }]} value={pageSize} />
      </div>
      <AntPagination current={currentPage} disabled={totalItems === 0} onChange={onPageChange} pageSize={pageSize} showSizeChanger={false} total={Math.max(totalItems, 1)} />
    </footer>
  );
}

function Toast({ message, onClose, tone }: { message: string; onClose: () => void; tone: 'success' | 'error' }) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return <Alert closable message={message} onClose={onClose} showIcon type={tone === 'error' ? 'error' : 'success'} />;
}

function ConfirmActionModal({
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  title,
  tone = 'primary',
}: {
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  tone?: 'primary' | 'danger';
}) {
  return (
    <Modal title={title} onClose={onCancel} size="compact">
      <p className="muted-text">{message}</p>
      <div className="modal-footer">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button danger={tone === 'danger'} onClick={onConfirm} type="primary">{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

function StaysTable({
  emptyContent,
  isLoading,
  stays,
  onCancel,
  onSelect,
  onResend,
}: {
  emptyContent: ReactNode;
  isLoading: boolean;
  stays: AdminStay[];
  onCancel: (stay: AdminStay) => void;
  onSelect: (stay: AdminStay) => void;
  onResend: (stay: AdminStay) => void;
}) {
  const [workflowCandidate, setWorkflowCandidate] = useState<{ action: 'resend' | 'cancel'; stay: AdminStay } | null>(null);

  const columns = [
    { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: 'Hóspede', key: 'guest', render: (_: unknown, stay: AdminStay) => `${stay.guest.firstName} ${stay.guest.lastName}` },
    { title: 'Check-in', dataIndex: 'checkInDate', key: 'checkInDate', render: (value: string) => formatStayDate(value) },
    { title: 'Check-out', dataIndex: 'checkOutDate', key: 'checkOutDate', render: (value: string) => formatStayDate(value) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color={stayStatusColor(value)}>{shortStayStatus(value)}</Tag> },
    { title: 'Nº acessos ao App', key: 'app', align: 'center' as const, render: (_: unknown, stay: AdminStay) => stay.activeGuestSessions },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, stay: AdminStay) => (
        <div className="stay-table-actions" onClick={(event) => event.stopPropagation()}>
          <Button aria-label="Ver detalhes" icon={<EyeOutlined />} onClick={() => onSelect(stay)} type="text" />
          <Button aria-label="Reenviar acesso" disabled={!['scheduled', 'active'].includes(stay.status)} icon={<SendOutlined />} onClick={() => setWorkflowCandidate({ action: 'resend', stay })} type="text" />
          <Button aria-label="Cancelar estadia" danger disabled={stay.status !== 'scheduled'} icon={<DeleteOutlined />} onClick={() => setWorkflowCandidate({ action: 'cancel', stay })} type="text" />
        </div>
      ),
    },
  ];

  return (
    <>
    <Table className="stays-table" columns={columns} dataSource={stays} loading={isLoading} locale={{ emptyText: emptyContent }} onRow={(stay) => ({ onClick: () => onSelect(stay) })} pagination={false} rowClassName="clickable-row" rowKey="id" />
    {workflowCandidate ? (
      <Modal title={stayWorkflowTitle(workflowCandidate.action)} onClose={() => setWorkflowCandidate(null)} size="compact">
        <p className="muted-text">
          {stayWorkflowMessage(workflowCandidate.action, workflowCandidate.stay)}
        </p>
        <div className="modal-footer">
          <Button onClick={() => setWorkflowCandidate(null)}>Cancelar</Button>
          <Button
            danger={workflowCandidate.action === 'cancel'}
            onClick={() => {
              if (workflowCandidate.action === 'resend') {
                onResend(workflowCandidate.stay);
              } else {
                onCancel(workflowCandidate.stay);
              }
              setWorkflowCandidate(null);
            }}
            type="primary"
          >
            {stayWorkflowConfirmLabel(workflowCandidate.action)}
          </Button>
        </div>
      </Modal>
    ) : null}
    </>
  );
}

function StayDetailPanel({
  accessToken,
  guests,
  stay,
  onCancel,
  onCheckIn,
  onCheckOut,
  onResend,
  onUpdated,
}: {
  accessToken: string;
  guests: AdminGuest[];
  stay: AdminStay;
  onCancel: (stay: AdminStay) => void;
  onCheckIn: (stay: AdminStay) => void;
  onCheckOut: (stay: AdminStay) => void;
  onResend: (stay: AdminStay) => void;
  onUpdated: () => void;
}) {
  const [consumption, setConsumption] = useState<ConsumptionItem[]>([]);
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

  async function loadDetails() {
    setError(null);
    try {
      const consumptionResponse = await listStayConsumption(accessToken, stay.id);
      setConsumption(consumptionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar detalhes.');
    }
  }

  useEffect(() => {
    loadDetails();
  }, [accessToken, stay.id]);

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
      await loadDetails();
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
      await loadDetails();
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
        {!activeModal && error ? <p className="form-error">{error}</p> : null}
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

function MiniList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="mini-empty">{emptyLabel}</p>;
  }

  return (
    <ul className="mini-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function Modal({
  children,
  className,
  layer = 'primary',
  onClose,
  size = 'default',
  title,
  width,
}: {
  children: ReactNode;
  className?: string;
  layer?: 'primary' | 'secondary';
  onClose: () => void;
  size?: 'default' | 'large' | 'compact';
  title: string;
  width?: number;
}) {
  return (
    <AntModal
      centered
      className={`atrio-modal${className ? ` ${className}` : ''}`}
      destroyOnClose
      footer={null}
      onCancel={onClose}
      open
      rootClassName={`atrio-modal-root atrio-modal-${layer}`}
      title={title}
      width={width ?? (size === 'large' ? 820 : size === 'compact' ? 480 : 620)}
      zIndex={layer === 'secondary' ? 1200 : 1000}
    >
      {children}
    </AntModal>
  );
}

function ModalFooter({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="modal-footer">
      <Button onClick={onCancel}>Cancelar</Button>
      <Button htmlType="submit" type="primary">{submitLabel}</Button>
    </div>
  );
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountCents / 100);
}

function formatDecimalInput(amountCents: number) {
  return (amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

function formatStayPeriod(checkInDate: string, checkOutDate: string) {
  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  const currentYear = new Date().getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear() && start.getFullYear() === currentYear;
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  const formatter = new Intl.DateTimeFormat('pt-BR', options);

  return `${formatter.format(start).replace('.', '')} → ${formatter.format(end).replace('.', '')}`;
}

function formatStayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = date.getFullYear() === currentYear
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' };

  return new Intl.DateTimeFormat('pt-BR', options).format(date).replace('.', '');
}

function requestStatusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: 'aceita',
    received: 'recebida',
    in_progress: 'em atendimento',
    on_the_way: 'a caminho',
    completed: 'concluída',
    cancelled: 'cancelada',
    rejected: 'recusada',
  };

  return labels[status] ?? status;
}

function nextRequestAction(status?: string) {
  const actions: Record<string, { label: string; status: string }> = {
    received: { label: 'Aceitar', status: 'accepted' },
    accepted: { label: 'A caminho', status: 'on_the_way' },
    in_progress: { label: 'A caminho', status: 'on_the_way' },
    on_the_way: { label: 'Concluir', status: 'completed' },
  };

  return status ? actions[status] : actions.received;
}

function canCancelRequest(status?: string) {
  return !['cancelled', 'completed', 'rejected'].includes(status ?? '');
}

function requestActionConfirmLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: 'Aceitar solicitação',
    on_the_way: 'Marcar como a caminho',
    completed: 'Concluir solicitação',
    cancelled: 'Cancelar solicitação',
  };

  return labels[status] ?? `Marcar como ${requestStatusLabel(status)}`;
}

function requestActionTitle(status: string) {
  const titles: Record<string, string> = {
    accepted: 'Aceitar solicitação?',
    on_the_way: 'Marcar como a caminho?',
    completed: 'Concluir solicitação?',
    cancelled: 'Cancelar solicitação?',
  };

  return titles[status] ?? 'Atualizar solicitação?';
}

function reservationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    confirmed: 'confirmada',
    completed: 'concluída',
    cancelled: 'cancelada',
    rejected: 'recusada',
  };

  return labels[status] ?? status;
}

function stayWorkflowTitle(action: 'resend' | 'check-in' | 'check-out' | 'cancel') {
  const titles = {
    resend: 'Reenviar acesso?',
    'check-in': 'Realizar check-in?',
    'check-out': 'Encerrar estadia?',
    cancel: 'Cancelar estadia?',
  };

  return titles[action];
}

function stayWorkflowConfirmLabel(action: 'resend' | 'check-in' | 'check-out' | 'cancel') {
  const labels = {
    resend: 'Reenviar acesso',
    'check-in': 'Realizar check-in',
    'check-out': 'Encerrar estadia',
    cancel: 'Cancelar estadia',
  };

  return labels[action];
}

function stayWorkflowMessage(action: 'resend' | 'check-in' | 'check-out' | 'cancel', stay: AdminStay) {
  const guestName = `${stay.guest.firstName} ${stay.guest.lastName}`;

  if (action === 'resend') {
    return `Um novo acesso será enviado para ${guestName}.`;
  }

  if (action === 'check-in') {
    return `A estadia do quarto ${stay.roomNumber} será marcada como ativa.`;
  }

  if (action === 'check-out') {
    return 'O hóspede perderá o acesso aos recursos vinculados a esta estadia.';
  }

  return 'A estadia será marcada como cancelada e sairá da operação ativa.';
}

function shortStayStatus(status: string) {
  const labels: Record<string, string> = {
    active: 'Ativa',
    scheduled: 'Agendada',
    checked_out: 'Encerrada',
    cancelled: 'Cancelada',
  };

  return labels[status] ?? status;
}

function stayStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'success',
    scheduled: 'processing',
    checked_out: 'default',
    cancelled: 'error',
  };

  return colors[status] ?? 'default';
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentMonthDateRange() {
  const today = new Date();
  return {
    start: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    end: formatDateInput(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

function StayDateRangePicker({
  end,
  onChange,
  start,
}: {
  end: string;
  onChange: (start: string, end: string) => void;
  start: string;
}) {
  return (
    <div className="stays-date-range-picker">
      <DatePicker.RangePicker
        allowClear={false}
        format="DD/MM/YYYY"
        onChange={(values) => {
          onChange(values?.[0]?.format('YYYY-MM-DD') ?? '', values?.[1]?.format('YYYY-MM-DD') ?? '');
        }}
        placeholder={['Data inicial', 'Data final']}
        value={[dayjs(start), dayjs(end)]}
      />
    </div>
  );
}

function StayModal({
  accessToken,
  guests,
  layer = 'primary',
  onCancel,
  onSaved,
  stay,
}: {
  accessToken: string;
  guests: AdminGuest[];
  layer?: 'primary' | 'secondary';
  onCancel: () => void;
  onSaved: () => void;
  stay?: AdminStay;
}) {
  return (
    <Modal
      className="operational-form-modal stay-form-modal"
      layer={layer}
      onClose={onCancel}
      title={stay ? 'Editar estadia' : 'Nova estadia'}
      width={600}
    >
      <StayForm accessToken={accessToken} guests={guests} onCancel={onCancel} onSaved={onSaved} stay={stay} />
    </Modal>
  );
}

function StayForm({
  accessToken,
  guests,
  onCancel,
  onSaved,
  stay,
}: {
  accessToken: string;
  guests: AdminGuest[];
  onCancel: () => void;
  onSaved: () => void;
  stay?: AdminStay;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [useNewGuest, setUseNewGuest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    guestId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    checkOutTime: string;
    consumptionView: 'ready' | 'empty' | 'unavailable';
  }>({
    guestId: stay?.guest.id ?? '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roomNumber: stay?.roomNumber ?? '',
    checkInDate: stay?.checkInDate ?? today,
    checkOutDate: stay?.checkOutDate ?? today,
    checkOutTime: stay?.checkOutTime ?? '12:00',
    consumptionView: stay?.consumptionView ?? 'ready' as const,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const stayFields = {
      roomNumber: form.roomNumber,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      checkOutTime: form.checkOutTime,
      consumptionEnabled: true,
      consumptionView: form.consumptionView,
    };

    try {
      if (stay) {
        await updateStay(accessToken, stay.id, {
          ...stayFields,
          guestId: form.guestId,
        });
      } else {
        const payload: CreateStayPayload = {
          ...stayFields,
          ...(useNewGuest
            ? { guest: { firstName: form.firstName, lastName: form.lastName, phoneNumber: form.phoneNumber } }
            : { guestId: form.guestId }),
        };
        await createStay(accessToken, payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Não foi possível ${stay ? 'editar' : 'criar'} estadia.`);
    }
  }

  return (
      <form className="stay-modal-form" onSubmit={handleSubmit}>
        {!stay ? (
          <label className="stay-form-toggle">
            <Checkbox checked={useNewGuest} onChange={(event) => setUseNewGuest(event.target.checked)} />
            Cadastrar novo hóspede
          </label>
        ) : null}
        {useNewGuest ? (
          <>
            <label>Nome<Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label>
            <label>Sobrenome<Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label>
            <label className="stay-form-wide">Telefone<Input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required /></label>
          </>
        ) : (
          <label className="stay-form-wide">Hóspede
            <AntSelect onChange={(value) => setForm({ ...form, guestId: value })} options={guests.map((guest) => ({ key: guest.id, label: `${guest.firstName} ${guest.lastName}`, value: guest.id }))} placeholder="Selecione" value={form.guestId || undefined} />
          </label>
        )}
        <label>Quarto<Input value={form.roomNumber} onChange={(event) => setForm({ ...form, roomNumber: event.target.value })} required /></label>
        <label>Horário de saída<TimePicker format="HH:mm" onChange={(value) => setForm({ ...form, checkOutTime: value?.format('HH:mm') ?? '' })} prefix={<ClockCircleOutlined />} suffixIcon={null} value={form.checkOutTime ? dayjs(form.checkOutTime, 'HH:mm') : null} /></label>
        <label>Check-in<DatePicker format="DD/MM/YYYY" onChange={(value) => setForm({ ...form, checkInDate: value?.format('YYYY-MM-DD') ?? '' })} prefix={<CalendarOutlined />} suffixIcon={null} value={form.checkInDate ? dayjs(form.checkInDate) : null} /></label>
        <label>Check-out<DatePicker format="DD/MM/YYYY" onChange={(value) => setForm({ ...form, checkOutDate: value?.format('YYYY-MM-DD') ?? '' })} prefix={<CalendarOutlined />} suffixIcon={null} value={form.checkOutDate ? dayjs(form.checkOutDate) : null} /></label>
        <label className="stay-form-wide">Lançamento de consumos
            <AntSelect onChange={(value) => setForm({ ...form, consumptionView: value as 'ready' | 'empty' | 'unavailable' })} options={[{ label: 'Permitido', value: 'ready' }, { label: 'Permitido, sem itens lançados', value: 'empty' }, { label: 'Indisponível', value: 'unavailable' }]} value={form.consumptionView} />
        </label>
        <p className="stay-form-status">Status operacional: <strong>{stay ? shortStayStatus(stay.status) : 'Agendada'}</strong></p>
        {error ? <p className="form-error">{error}</p> : null}
        <ModalFooter onCancel={onCancel} submitLabel={stay ? 'Salvar alterações' : 'Cadastrar estadia'} />
      </form>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTodayLabel() {
  const label = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDuration(minutes?: number) {
  if (minutes === undefined || Number.isNaN(minutes)) {
    return '-';
  }

  const safeMinutes = Math.max(0, Math.floor(minutes));

  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }

  const hours = Math.floor(safeMinutes / 60);

  if (hours < 24) {
    const remainder = safeMinutes % 60;
    return remainder ? `${hours}h ${remainder}min` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days >= 7) {
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  const remainingHours = hours % 24;
  const dayLabel = days === 1 ? 'dia' : 'dias';
  return remainingHours ? `${days} ${dayLabel} ${remainingHours}h` : `${days} ${dayLabel}`;
}

function formatShortSchedule(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value)).replace(',', ' ·');
}

function statusToneClass(item: { status?: string; statusLabel?: string; priority?: string }) {
  if (item.priority === 'critical' || item.statusLabel === 'Atrasada') {
    return 'danger';
  }

  if (item.status === 'in_progress' || item.status === 'on_the_way' || item.statusLabel === 'Em atendimento') {
    return 'info';
  }

  if (item.status === 'completed' || item.statusLabel === 'Concluída') {
    return 'success';
  }

  return 'warning';
}

function movementLabel(type: string) {
  const labels: Record<string, string> = {
    'check-in': 'Check-in',
    'check-out': 'Check-out',
    experience: 'Experiência',
  };

  return labels[type] ?? type;
}

function isAdminView(view?: string): view is AdminView {
  return Boolean(view && ['dashboard', 'stays', 'guests', 'services', 'requests', 'experiences', 'reservations', 'concierge', 'reports', 'settings'].includes(view));
}

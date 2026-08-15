import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BedDouble, CalendarClock, ClipboardList, Download, Hotel, LogOut, MessageSquare, Settings, Sparkles, Users } from 'lucide-react';
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
  StayUsefulInfo,
  createAdminExperience,
  createAdminExperienceCollection,
  createAdminExperienceSlot,
  createAdminReservation,
  createAdminService,
  createGuest,
  createStayConsumption,
  createStayUsefulInfo,
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
  listStayUsefulInfo,
  listGuests,
  listStays,
  login,
  logout,
  resendStayAccess,
  revokeStaySessions,
  sendConciergeMessage,
  setAdminServicePublished,
  uploadAdminExperienceCollectionImage,
  uploadAdminExperienceImage,
  uploadHotelHeroImage,
  uploadHotelLogo,
  updateAdminRequestStatus,
  updateAdminExperienceSlot,
  updateAdminReservationStatus,
  updateStayWifi,
} from './api';

const SESSION_STORAGE_KEY = 'atrio-admin-session';
type AdminView = 'dashboard' | 'stays' | 'guests' | 'services' | 'requests' | 'experiences' | 'reservations' | 'concierge' | 'reports' | 'settings';

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
          <h1>Operacao do hotel</h1>
          <p className="login-copy">Acesse o ambiente administrativo para acompanhar estadias, reservas e solicitações.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Senha
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
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
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuItems = useMemo<
    Array<{ label: string; icon: typeof Hotel; view?: AdminView }>
  >(
    () => [
      { label: 'Dashboard', icon: Hotel, view: 'dashboard' as const },
      { label: 'Estadias', icon: BedDouble, view: 'stays' as const },
      { label: 'Hóspedes', icon: Users, view: 'guests' as const },
      { label: 'Serviços', icon: ClipboardList, view: 'services' as const },
      { label: 'Solicitações', icon: MessageSquare, view: 'requests' as const },
      { label: 'Experiências', icon: Sparkles, view: 'experiences' as const },
      { label: 'Reservas', icon: CalendarClock, view: 'reservations' as const },
      { label: 'Concierge', icon: MessageSquare, view: 'concierge' as const },
      { label: 'Relatórios', icon: Download, view: 'reports' as const },
      { label: 'Configurações', icon: Settings, view: 'settings' as const },
    ],
    [],
  );

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
        <button className="brand" onClick={() => setActiveView('dashboard')} type="button">
          <span className="brand-mark">A</span>
          <div>
            <strong>Atrio</strong>
            <span>Admin</span>
          </div>
        </button>
        <nav className="nav-list" aria-label="Principal">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={'view' in item && item.view === activeView ? 'nav-item active' : 'nav-item'}
                key={item.label}
                onClick={() => {
                  if (item.view) {
                    setActiveView(item.view);
                  }
                }}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="topbar-context">
              {activeView === 'dashboard' ? `${session.admin.hotel.name} · ${formatTodayLabel()}` : session.admin.hotel.name}
            </p>
            <h1>{viewTitle(activeView)}</h1>
          </div>
          <div className="account">
            <div>
              <strong>{session.admin.name}</strong>
              <span>{session.admin.role}</span>
            </div>
            <button className="icon-button" onClick={handleLogout} title="Sair" type="button">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {activeView === 'dashboard' ? (
          <>
            {isLoading ? <DashboardLoading /> : null}
            {error ? <div className="error-state">{error}</div> : null}
            {!isLoading && !error && dashboard ? (
              <DashboardView
                accessToken={session.accessToken}
                dashboard={dashboard}
                onNavigate={setActiveView}
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
          <h2>Operação de hoje</h2>
        </header>
        <div className="main-stack">
          <section className="metrics-grid today-grid" aria-label="Operação de hoje">
            {dashboard.todayMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} onNavigate={onNavigate} />
            ))}
          </section>
          <h2 className="dashboard-section-title">Pendências</h2>
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
        <h2>Atenção necessária</h2>
      </header>
      {alerts.length === 0 ? (
        <div className="empty-action">
          <p>Nenhuma exceção operacional no momento.</p>
        </div>
      ) : (
        <ul className="alert-list compact-alert-list">
          {alerts.map((alert) => (
            <li className={`alert-item ${alert.tone}`} key={alert.id}>
              <button
                onClick={() => {
                  if (isAdminView(alert.targetView)) {
                    onNavigate(alert.targetView);
                  }
                }}
                type="button"
              >
                <span>
                  <strong>{alert.title}</strong>
                  <small>
                    {alert.tone === 'critical' ? <b className="critical-badge">Crítico</b> : null}
                    {alert.helper.replace(/^Crítico ·\s*/, '')}{alert.waitMinutes !== undefined ? ` ${formatDuration(alert.waitMinutes)}` : ''}
                  </small>
                </span>
                <em>{alert.actionLabel}</em>
              </button>
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
    <button
      className="metric-card actionable-card"
      disabled={!canNavigate}
      onClick={() => {
        if (isAdminView(metric.targetView)) {
          onNavigate(metric.targetView);
        }
      }}
      type="button"
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
    </button>
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) {
      return undefined;
    }

    function closeMenu() {
      setOpenMenuId(null);
    }

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [openMenuId]);

  return (
    <section className="table-panel request-panel">
      <header className="panel-toolbar">
        <div>
          <h2>Solicitações em andamento</h2>
          <p className="muted-text">Priorizadas por espera e criticidade.</p>
        </div>
        <button className="ghost-button compact" onClick={() => onNavigate('requests')} type="button">Ver todas</button>
      </header>
      {items.length === 0 ? (
        <p className="empty-state">Nenhuma solicitação aberta.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Solicitação</th>
              <th>Hóspede</th>
              <th>Status</th>
              <th>Espera</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                className="clickable-row"
                key={item.id}
                onClick={() => onNavigate('requests')}
              >
                <td>
                  <strong className="table-primary">{item.title}</strong>
                  <span className="table-secondary">Solicitado pelo hóspede</span>
                </td>
                <td>
                  <strong className="table-primary">{item.guestName ?? 'Hóspede'}</strong>
                  <span className="table-secondary">Quarto {item.roomNumber}</span>
                </td>
                <td>
                  <span className={`status-pill ${statusToneClass(item)}`}>{item.statusLabel}</span>
                </td>
                <td title={formatDate(item.createdAt)}>
                  <strong className="wait-time">{formatDuration(item.waitMinutes)}</strong>
                </td>
                <td>
                  <div className="row-actions dashboard-actions">
                    <button
                      className="primary-button compact"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUpdateStatus(item.id, isRequestInProgress(item.status) ? 'completed' : 'in_progress');
                      }}
                      type="button"
                    >
                      {isRequestInProgress(item.status) ? 'Concluir' : 'Assumir'}
                    </button>
                    <div className="row-menu" onClick={(event) => event.stopPropagation()}>
                      <button
                        aria-expanded={openMenuId === item.id}
                        aria-label="Mais ações"
                        className="menu-trigger"
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        type="button"
                      >
                        •••
                      </button>
                      {openMenuId === item.id ? (
                        <div className="row-menu-popover">
                          <button onClick={() => { setOpenMenuId(null); onNavigate('requests'); }} type="button">Abrir detalhes</button>
                          <button onClick={() => { setOpenMenuId(null); onUpdateStatus(item.id, 'completed'); }} type="button">Concluir</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
        <h2>Próximas movimentações</h2>
        <button className="ghost-button compact" onClick={() => onNavigate('stays')} type="button">Ver estadias</button>
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
        <h2>{title}</h2>
        <button className="ghost-button compact" onClick={onNavigate} type="button">{actionLabel}</button>
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
          <h2>Hóspedes cadastrados</h2>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadGuests(search); }}>
            <input placeholder="Buscar hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button className="secondary-button" type="submit">Buscar</button>
          </form>
        </header>
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? <p className="empty-state">Carregando hóspedes...</p> : <GuestsTable guests={guests} />}
      </section>
      <section className="form-panel">
        <h2>Novo hóspede</h2>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>Nome<input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label>
          <label>Sobrenome<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label>
          <label>Telefone<input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required /></label>
          <button className="primary-button" type="submit">Cadastrar hóspede</button>
        </form>
      </section>
    </div>
  );
}

function GuestsTable({ guests }: { guests: AdminGuest[] }) {
  if (guests.length === 0) {
    return <p className="empty-state">Nenhum hóspede encontrado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Mascarado</th>
        </tr>
      </thead>
      <tbody>
        {guests.map((guest) => (
          <tr key={guest.id}>
            <td>{guest.firstName} {guest.lastName}</td>
            <td>{guest.phoneNumber}</td>
            <td>{guest.maskedPhone}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ServicesView({ accessToken }: { accessToken: string }) {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        <header className="panel-toolbar"><h2>Catálogo de serviços</h2></header>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {services.length === 0 ? <p className="empty-state">Nenhum serviço cadastrado.</p> : (
          <table>
            <thead>
              <tr><th>Serviço</th><th>Formulário</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.title}<br /><span className="muted-text">{service.description}</span></td>
                  <td>{service.requestSchema.fields.length} campo(s)</td>
                  <td><span className="status-pill">{service.published ? 'Publicado' : 'Rascunho'}</span></td>
                  <td><button className="secondary-button compact" onClick={() => togglePublished(service)} type="button">{service.published ? 'Despublicar' : 'Publicar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="form-panel">
        <h2>Novo serviço</h2>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>ID opcional<input value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></label>
          <label>Titulo<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Descricao<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <div className="two-columns">
            <label>Icone<input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} required /></label>
            <label>Atendimento<input value={form.fulfillmentType} onChange={(event) => setForm({ ...form, fulfillmentType: event.target.value })} required /></label>
          </div>
          <h3>Campo do formulario</h3>
          <div className="two-columns">
            <label>Nome<input value={form.fieldName} onChange={(event) => setForm({ ...form, fieldName: event.target.value })} required /></label>
            <label>Label<input value={form.fieldLabel} onChange={(event) => setForm({ ...form, fieldLabel: event.target.value })} required /></label>
          </div>
          <label>Tipo
            <select value={form.fieldType} onChange={(event) => setForm({ ...form, fieldType: event.target.value })}>
              <option value="string">Texto</option>
              <option value="number">Número</option>
            </select>
          </label>
          <label className="check-row"><input checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} type="checkbox" /> Publicado</label>
          <button className="primary-button" type="submit">Cadastrar serviço</button>
        </form>
      </section>
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
        <h2>Fila de solicitações</h2>
        <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadRequests({ search, status }); }}>
          <input placeholder="Quarto, hóspede ou serviço" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos</option>
            <option value="received">Recebido</option>
            <option value="accepted">Aceito</option>
            <option value="in_progress">Em preparo</option>
            <option value="on_the_way">A caminho</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
            <option value="rejected">Recusado</option>
          </select>
          <button className="secondary-button" type="submit">Filtrar</button>
        </form>
      </header>
      <div className="request-note-bar">
        <input placeholder="Nota interna para a proxima atualizacao" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
      </div>
      {message ? <p className="success-state">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {requests.length === 0 ? <p className="empty-state">Nenhuma solicitação encontrada.</p> : (
        <table>
          <thead>
            <tr><th>Serviço</th><th>Quarto</th><th>Hóspede</th><th>Status</th><th>Nota</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.title}<br /><span className="muted-text">{formatDate(request.createdAt)}</span></td>
                <td>{request.roomNumber}</td>
                <td>{request.guestName}</td>
                <td><span className="status-pill">{request.statusLabel}</span></td>
                <td>{request.note || request.internalNote || '-'}</td>
                <td>
                  <div className="row-actions">
                    <button className="secondary-button compact" onClick={() => updateStatus(request, 'accepted')} type="button">Aceitar</button>
                    <button className="secondary-button compact" onClick={() => updateStatus(request, 'on_the_way')} type="button">A caminho</button>
                    <button className="ghost-button compact" onClick={() => updateStatus(request, 'completed')} type="button">Concluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
    await updateAdminExperienceSlot(accessToken, slot.experienceId, slot.id, { isAvailable: !slot.isAvailable });
    setSlots(await listAdminExperienceSlots(accessToken, slot.experienceId));
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
        <header className="panel-toolbar"><h2>Experiências</h2></header>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <table>
          <thead><tr><th>Titulo</th><th>Categoria</th><th>Status</th><th>Midia</th><th>Agenda</th></tr></thead>
          <tbody>
            {experiences.map((experience) => (
              <tr className={experience.id === selectedExperienceId ? 'selected-row' : ''} key={experience.id}>
                <td>{experience.title}<br /><span className="muted-text">{experience.locationLabel || '-'}</span></td>
                <td>{experience.category}</td>
                <td><span className="status-pill">{experience.published ? 'Publicado' : 'Rascunho'}</span></td>
                <td><input className="file-input" accept="image/*" onChange={(event) => handleExperienceImageUpload(experience.id, event.target.files)} type="file" /></td>
                <td><button className="secondary-button compact" onClick={() => { setSelectedExperienceId(experience.id); listAdminExperienceSlots(accessToken, experience.id).then(setSlots); }} type="button">Ver horarios</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <section className="subsection">
          <h2>Colecoes</h2>
          {collections.length === 0 ? <p className="mini-empty">Sem colecoes.</p> : (
            <ul className="mini-list">
              {collections.map((collection) => (
                <li className="media-list-item" key={collection.id}>
                  <span>{collection.title} - {collection.published ? 'publicada' : 'rascunho'}</span>
                  <input className="file-input" accept="image/*" onChange={(event) => handleCollectionImageUpload(collection.id, event.target.files)} type="file" />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="subsection">
          <h2>Horários</h2>
          <MiniList items={slots.map((slot) => `${slot.dateLabel} ${slot.time} - ${slot.isAvailable ? 'disponivel' : 'bloqueado'}`)} emptyLabel="Sem horarios." />
          <div className="row-actions wrap">
            {slots.map((slot) => (
              <button className="ghost-button compact" key={slot.id} onClick={() => toggleSlot(slot)} type="button">
                {slot.isAvailable ? 'Bloquear' : 'Reabrir'} {slot.time}
              </button>
            ))}
          </div>
        </section>
      </section>
      <section className="form-panel">
        <h2>Nova experiência</h2>
        <form className="stack-form" onSubmit={handleExperienceSubmit}>
          <label>ID opcional<input value={experienceForm.id} onChange={(event) => setExperienceForm({ ...experienceForm, id: event.target.value })} /></label>
          <label>Titulo<input value={experienceForm.title} onChange={(event) => setExperienceForm({ ...experienceForm, title: event.target.value })} required /></label>
          <label>Descricao<input value={experienceForm.description} onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })} required /></label>
          <div className="two-columns">
            <label>Categoria<input value={experienceForm.category} onChange={(event) => setExperienceForm({ ...experienceForm, category: event.target.value })} required /></label>
            <label>Preco<input value={experienceForm.priceLabel} onChange={(event) => setExperienceForm({ ...experienceForm, priceLabel: event.target.value })} required /></label>
          </div>
          <label>Imagem<input value={experienceForm.imageUrl} onChange={(event) => setExperienceForm({ ...experienceForm, imageUrl: event.target.value })} required /></label>
          <label>Incluidos<input value={experienceForm.included} onChange={(event) => setExperienceForm({ ...experienceForm, included: event.target.value })} /></label>
          <label className="check-row"><input checked={experienceForm.published} onChange={(event) => setExperienceForm({ ...experienceForm, published: event.target.checked })} type="checkbox" /> Publicada</label>
          <button className="primary-button" type="submit">Cadastrar experiência</button>
        </form>
        <form className="stack-form section-form" onSubmit={handleCollectionSubmit}>
          <h3>Nova coleção</h3>
          <input placeholder="ID opcional" value={collectionForm.id} onChange={(event) => setCollectionForm({ ...collectionForm, id: event.target.value })} />
          <input placeholder="Titulo" value={collectionForm.title} onChange={(event) => setCollectionForm({ ...collectionForm, title: event.target.value })} required />
          <input placeholder="Descricao" value={collectionForm.description} onChange={(event) => setCollectionForm({ ...collectionForm, description: event.target.value })} required />
          <input placeholder="URL da imagem" value={collectionForm.imageUrl} onChange={(event) => setCollectionForm({ ...collectionForm, imageUrl: event.target.value })} />
          <label className="check-row"><input checked={collectionForm.featured} onChange={(event) => setCollectionForm({ ...collectionForm, featured: event.target.checked })} type="checkbox" /> Destaque</label>
          <button className="secondary-button" type="submit">Cadastrar coleção</button>
        </form>
        <form className="stack-form section-form" onSubmit={handleLinkSubmit}>
          <h3>Vincular a coleção</h3>
          <select value={linkForm.collectionId} onChange={(event) => setLinkForm({ ...linkForm, collectionId: event.target.value })} required>
            <option value="">Colecao</option>
            {collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.title}</option>)}
          </select>
          <select value={linkForm.experienceId} onChange={(event) => setLinkForm({ ...linkForm, experienceId: event.target.value })} required>
            <option value="">Experiência</option>
            {experiences.map((experience) => <option key={experience.id} value={experience.id}>{experience.title}</option>)}
          </select>
          <button className="secondary-button" type="submit">Vincular</button>
        </form>
        <form className="stack-form section-form" onSubmit={handleSlotSubmit}>
          <h3>Novo horario</h3>
          <input type="datetime-local" value={slotForm.startsAt} onChange={(event) => setSlotForm({ ...slotForm, startsAt: event.target.value })} required />
          <button className="secondary-button" type="submit">Cadastrar horario</button>
        </form>
      </section>
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
  const [form, setForm] = useState({ stayId: '', experienceId: '', slotId: '', guestNote: '' });

  async function loadReservations(nextQuery = { search, status }) {
    setError(null);
    try {
      const [reservationResponse, stayResponse, experienceResponse] = await Promise.all([
        listAdminReservations(accessToken, nextQuery),
        listStays(accessToken),
        listAdminExperiences(accessToken),
      ]);
      setReservations(reservationResponse);
      setStays(stayResponse);
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
          <h2>Reservas</h2>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadReservations({ search, status }); }}>
            <input placeholder="Quarto, hóspede ou experiência" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              <option value="requested">Solicitada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Concluida</option>
              <option value="cancelled">Cancelada</option>
              <option value="rejected">Recusada</option>
            </select>
            <button className="secondary-button" type="submit">Filtrar</button>
          </form>
        </header>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {reservations.length === 0 ? <p className="empty-state">Nenhuma reserva encontrada.</p> : (
          <table>
            <thead><tr><th>Experiência</th><th>Quarto</th><th>Hóspede</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.title}<br /><span className="muted-text">{formatDate(reservation.scheduledAt)}</span></td>
                  <td>{reservation.roomNumber}</td>
                  <td>{reservation.guestName}</td>
                  <td><span className="status-pill">{reservation.statusLabel}</span></td>
                  <td><div className="row-actions">
                    <button className="secondary-button compact" onClick={() => setReservationStatus(reservation, 'confirmed')} type="button">Confirmar</button>
                    <button className="ghost-button compact" onClick={() => setReservationStatus(reservation, 'completed')} type="button">Concluir</button>
                    <button className="ghost-button compact" onClick={() => setReservationStatus(reservation, 'cancelled')} type="button">Cancelar</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="form-panel">
        <h2>Nova reserva</h2>
        <form className="stack-form" onSubmit={handleSubmit}>
          <select value={form.stayId} onChange={(event) => setForm({ ...form, stayId: event.target.value })} required>
            <option value="">Estadia</option>
            {stays.map((stay) => <option key={stay.id} value={stay.id}>Quarto {stay.roomNumber} - {stay.guest.firstName}</option>)}
          </select>
          <select value={form.experienceId} onChange={(event) => handleExperienceChange(event.target.value)} required>
            <option value="">Experiência</option>
            {experiences.map((experience) => <option key={experience.id} value={experience.id}>{experience.title}</option>)}
          </select>
          <select value={form.slotId} onChange={(event) => setForm({ ...form, slotId: event.target.value })} required>
            <option value="">Horário</option>
            {slots.filter((slot) => slot.isAvailable).map((slot) => <option key={slot.id} value={slot.id}>{slot.dateLabel} {slot.time}</option>)}
          </select>
          <input placeholder="Observacao opcional" value={form.guestNote} onChange={(event) => setForm({ ...form, guestNote: event.target.value })} />
          <button className="primary-button" type="submit">Criar reserva</button>
        </form>
      </section>
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
          <h2>Conversas</h2>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadConversations(search); }}>
            <input placeholder="Quarto ou hóspede" value={search} onChange={(event) => setSearch(event.target.value)} />
            <button className="secondary-button" type="submit">Filtrar</button>
          </form>
        </header>
        {error ? <p className="form-error">{error}</p> : null}
        {conversations.length === 0 ? <p className="empty-state">Nenhuma conversa encontrada.</p> : (
          <table>
            <thead><tr><th>Quarto</th><th>Hóspede</th><th>Mensagens</th><th>Última</th></tr></thead>
            <tbody>
              {conversations.map((conversation) => (
                <tr className={conversation.stayId === selectedStayId ? 'selected-row' : ''} key={conversation.stayId} onClick={() => selectConversation(conversation.stayId)}>
                  <td>{conversation.roomNumber}</td>
                  <td>{conversation.guestName}</td>
                  <td>{conversation.guestMessageCount}</td>
                  <td>{formatDate(conversation.lastMessageAt ?? undefined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className="form-panel">
        <h2>Atendimento</h2>
        <div className="chat-thread">
          {messages.length === 0 ? <p className="mini-empty">Selecione uma conversa.</p> : messages.map((message) => (
            <article className={`chat-message ${message.sender}`} key={message.id}>
              <span>{message.sender === 'hotel' ? 'Hotel' : 'Hóspede'} - {formatDate(message.createdAt)}</span>
              <p>{message.text}</p>
            </article>
          ))}
        </div>
        <form className="stack-form section-form" onSubmit={handleReply}>
          <textarea placeholder="Responder ao hóspede" value={reply} onChange={(event) => setReply(event.target.value)} rows={4} />
          <button className="primary-button" disabled={!selectedStayId} type="submit">Enviar resposta</button>
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
        <h2>Relatórios CSV</h2>
      </header>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="report-filters">
        <input placeholder="Status opcional" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} />
        <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
      </div>
      <div className="report-actions">
        <button className="secondary-button" onClick={() => handleDownload('stays')} type="button"><Download size={16} /> Estadias</button>
        <button className="secondary-button" onClick={() => handleDownload('requests')} type="button"><Download size={16} /> Solicitações</button>
        <button className="secondary-button" onClick={() => handleDownload('reservations')} type="button"><Download size={16} /> Reservas</button>
      </div>
    </section>
  );
}

function SettingsView({ accessToken }: { accessToken: string }) {
  const [settings, setSettings] = useState<AdminHotelSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    setError(null);
    try {
      setSettings(await getHotelSettings(accessToken));
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

  return (
    <section className="table-panel narrow-panel">
      <header className="panel-toolbar">
        <h2>Hotel</h2>
      </header>
      {message ? <p className="success-state">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {settings ? (
        <div className="settings-grid">
          <article>
            <strong>{settings.name}</strong>
            <span className="muted-text">ID {settings.id}</span>
          </article>
          <label>Logo<input accept="image/*" onChange={(event) => uploadHotelMedia('logo', event.target.files)} type="file" /></label>
          {settings.logoUrl ? <img alt="Logo do hotel" className="media-preview" src={settings.logoUrl} /> : null}
          <label>Imagem principal<input accept="image/*" onChange={(event) => uploadHotelMedia('hero', event.target.files)} type="file" /></label>
          {settings.heroImageUrl ? <img alt="Imagem principal do hotel" className="media-preview hero" src={settings.heroImageUrl} /> : null}
        </div>
      ) : <p className="empty-state">Carregando configurações...</p>}
    </section>
  );
}

function StaysView({ accessToken }: { accessToken: string }) {
  const [stays, setStays] = useState<AdminStay[]>([]);
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedStay, setSelectedStay] = useState<AdminStay | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData(nextQuery = { search, status }) {
    setIsLoading(true);
    setError(null);

    try {
      const [staysResponse, guestsResponse] = await Promise.all([
        listStays(accessToken, nextQuery),
        listGuests(accessToken),
      ]);
      setStays(staysResponse);
      setGuests(guestsResponse);
      setSelectedStay((current) => current ? staysResponse.find((stay) => stay.id === current.id) ?? current : staysResponse[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar estadias.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData({ search: '', status: '' });
  }, [accessToken]);

  async function handleResend(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      const response = await resendStayAccess(accessToken, stay.id);
      setMessage(`Acesso reenviado para ${response.maskedPhone}. Codigo ${response.challengeId} criado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível reenviar acesso.');
    }
  }

  async function handleRevoke(stay: AdminStay) {
    setMessage(null);
    setError(null);

    try {
      const response = await revokeStaySessions(accessToken, stay.id);
      setMessage(`${response.revokedSessions} sessão(oes) encerrada(s).`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível encerrar sessões.');
    }
  }

  return (
    <div className="management-grid wide">
      <section className="table-panel">
        <header className="panel-toolbar">
          <h2>Estadias</h2>
          <form className="inline-search" onSubmit={(event) => { event.preventDefault(); loadData({ search, status }); }}>
            <input placeholder="Quarto, hóspede ou telefone" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              <option value="scheduled">Agendada</option>
              <option value="active">Ativa</option>
              <option value="checked_out">Check-out</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <button className="secondary-button" type="submit">Filtrar</button>
          </form>
        </header>
        {message ? <p className="success-state">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? <p className="empty-state">Carregando estadias...</p> : (
          <StaysTable stays={stays} selectedStayId={selectedStay?.id} onSelect={setSelectedStay} onResend={handleResend} onRevoke={handleRevoke} />
        )}
      </section>
      {selectedStay ? (
        <StayDetailPanel accessToken={accessToken} stay={selectedStay} onUpdated={() => loadData()} />
      ) : (
        <StayForm accessToken={accessToken} guests={guests} onCreated={() => loadData({ search: '', status: '' })} />
      )}
      {selectedStay ? <StayForm accessToken={accessToken} guests={guests} onCreated={() => loadData({ search: '', status: '' })} /> : null}
    </div>
  );
}

function StaysTable({
  stays,
  selectedStayId,
  onSelect,
  onResend,
  onRevoke,
}: {
  stays: AdminStay[];
  selectedStayId?: string;
  onSelect: (stay: AdminStay) => void;
  onResend: (stay: AdminStay) => void;
  onRevoke: (stay: AdminStay) => void;
}) {
  if (stays.length === 0) {
    return <p className="empty-state">Nenhuma estadia encontrada.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Quarto</th>
          <th>Hóspede</th>
          <th>Periodo</th>
          <th>Status</th>
          <th>Sessoes</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {stays.map((stay) => (
          <tr className={stay.id === selectedStayId ? 'selected-row' : ''} key={stay.id}>
            <td>{stay.roomNumber}</td>
            <td>{stay.guest.firstName} {stay.guest.lastName}</td>
            <td>{stay.checkInDate} - {stay.checkOutDate}</td>
            <td><span className="status-pill">{stay.statusLabel}</span></td>
            <td>{stay.activeGuestSessions}</td>
            <td>
              <div className="row-actions">
                <button className="secondary-button compact" onClick={() => onResend(stay)} type="button">Reenviar</button>
                <button className="ghost-button compact" onClick={() => onRevoke(stay)} type="button">Encerrar</button>
                <button className="ghost-button compact" onClick={() => onSelect(stay)} type="button">Detalhes</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StayDetailPanel({
  accessToken,
  stay,
  onUpdated,
}: {
  accessToken: string;
  stay: AdminStay;
  onUpdated: () => void;
}) {
  const [usefulInfo, setUsefulInfo] = useState<StayUsefulInfo[]>([]);
  const [consumption, setConsumption] = useState<ConsumptionItem[]>([]);
  const [wifi, setWifi] = useState({ wifiNetwork: stay.wifiNetwork, wifiPassword: stay.wifiPassword });
  const [infoForm, setInfoForm] = useState<{
    scope: 'dashboard' | 'stay';
    title: string;
    description: string;
    position: number;
  }>({ scope: 'stay', title: '', description: '', position: 1 });
  const [consumptionForm, setConsumptionForm] = useState({
    title: '',
    description: '',
    category: 'minibar',
    icon: 'Receipt',
    amountCents: 0,
    currency: 'BRL',
    occurredAt: new Date().toISOString().slice(0, 16),
  });
  const [error, setError] = useState<string | null>(null);

  async function loadDetails() {
    setError(null);
    try {
      const [infoResponse, consumptionResponse] = await Promise.all([
        listStayUsefulInfo(accessToken, stay.id),
        listStayConsumption(accessToken, stay.id),
      ]);
      setUsefulInfo(infoResponse);
      setConsumption(consumptionResponse);
      setWifi({ wifiNetwork: stay.wifiNetwork, wifiPassword: stay.wifiPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar detalhes.');
    }
  }

  useEffect(() => {
    loadDetails();
  }, [accessToken, stay.id]);

  async function handleWifiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await updateStayWifi(accessToken, stay.id, wifi);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar Wi-Fi.');
    }
  }

  async function handleInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createStayUsefulInfo(accessToken, stay.id, infoForm);
      setInfoForm({ scope: 'stay', title: '', description: '', position: infoForm.position + 1 });
      await loadDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar informação.');
    }
  }

  async function handleConsumptionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createStayConsumption(accessToken, stay.id, {
        ...consumptionForm,
        amountCents: Number(consumptionForm.amountCents),
        occurredAt: new Date(consumptionForm.occurredAt).toISOString(),
      });
      setConsumptionForm({ ...consumptionForm, title: '', description: '', amountCents: 0 });
      await loadDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar consumo.');
    }
  }

  return (
    <section className="form-panel detail-panel">
      <h2>Detalhes do quarto {stay.roomNumber}</h2>
      <p className="muted-text">{stay.guest.firstName} {stay.guest.lastName}</p>
      {error ? <p className="form-error">{error}</p> : null}
      <form className="stack-form section-form" onSubmit={handleWifiSubmit}>
        <h3>Wi-Fi</h3>
        <label>Rede<input value={wifi.wifiNetwork} onChange={(event) => setWifi({ ...wifi, wifiNetwork: event.target.value })} /></label>
        <label>Senha<input value={wifi.wifiPassword} onChange={(event) => setWifi({ ...wifi, wifiPassword: event.target.value })} /></label>
        <button className="secondary-button" type="submit">Salvar Wi-Fi</button>
      </form>
      <form className="stack-form section-form" onSubmit={handleInfoSubmit}>
        <h3>Dados uteis</h3>
        <select value={infoForm.scope} onChange={(event) => setInfoForm({ ...infoForm, scope: event.target.value as 'dashboard' | 'stay' })}>
          <option value="stay">Estadia</option>
          <option value="dashboard">Dashboard</option>
        </select>
        <input placeholder="Titulo" value={infoForm.title} onChange={(event) => setInfoForm({ ...infoForm, title: event.target.value })} required />
        <input placeholder="Descricao" value={infoForm.description} onChange={(event) => setInfoForm({ ...infoForm, description: event.target.value })} required />
        <button className="secondary-button" type="submit">Adicionar informação</button>
      </form>
      <MiniList items={usefulInfo.map((item) => `${item.scope}: ${item.title}`)} emptyLabel="Sem dados uteis." />
      <form className="stack-form section-form" onSubmit={handleConsumptionSubmit}>
        <h3>Consumo manual</h3>
        <input placeholder="Titulo" value={consumptionForm.title} onChange={(event) => setConsumptionForm({ ...consumptionForm, title: event.target.value })} required />
        <input placeholder="Descricao" value={consumptionForm.description} onChange={(event) => setConsumptionForm({ ...consumptionForm, description: event.target.value })} required />
        <div className="two-columns">
          <input placeholder="Categoria" value={consumptionForm.category} onChange={(event) => setConsumptionForm({ ...consumptionForm, category: event.target.value })} required />
          <input placeholder="Valor centavos" type="number" value={consumptionForm.amountCents} onChange={(event) => setConsumptionForm({ ...consumptionForm, amountCents: Number(event.target.value) })} required />
        </div>
        <input type="datetime-local" value={consumptionForm.occurredAt} onChange={(event) => setConsumptionForm({ ...consumptionForm, occurredAt: event.target.value })} required />
        <button className="secondary-button" type="submit">Adicionar consumo</button>
      </form>
      <MiniList items={consumption.map((item) => `${item.title} - ${formatMoney(item.amountCents, item.currency)}`)} emptyLabel="Sem consumo." />
    </section>
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

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amountCents / 100);
}

function StayForm({
  accessToken,
  guests,
  onCreated,
}: {
  accessToken: string;
  guests: AdminGuest[];
  onCreated: () => void;
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
    status: string;
    wifiNetwork: string;
    wifiPassword: string;
    consumptionView: 'ready' | 'empty' | 'unavailable';
  }>({
    guestId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roomNumber: '',
    checkInDate: today,
    checkOutDate: today,
    checkOutTime: '12:00',
    status: 'active',
    wifiNetwork: 'Atrio Guest',
    wifiPassword: '',
    consumptionView: 'ready' as const,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload: CreateStayPayload = {
      roomNumber: form.roomNumber,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      checkOutTime: form.checkOutTime,
      status: form.status,
      wifiNetwork: form.wifiNetwork,
      wifiPassword: form.wifiPassword,
      consumptionEnabled: true,
      consumptionView: form.consumptionView,
      ...(useNewGuest
        ? { guest: { firstName: form.firstName, lastName: form.lastName, phoneNumber: form.phoneNumber } }
        : { guestId: form.guestId }),
    };

    try {
      await createStay(accessToken, payload);
      setForm({
        guestId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        roomNumber: '',
        checkInDate: today,
        checkOutDate: today,
        checkOutTime: '12:00',
        status: 'active',
        wifiNetwork: 'Atrio Guest',
        wifiPassword: '',
        consumptionView: 'ready',
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar estadia.');
    }
  }

  return (
    <section className="form-panel">
      <h2>Nova estadia</h2>
      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="check-row">
          <input type="checkbox" checked={useNewGuest} onChange={(event) => setUseNewGuest(event.target.checked)} />
          Cadastrar novo hóspede
        </label>
        {useNewGuest ? (
          <>
            <label>Nome<input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></label>
            <label>Sobrenome<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></label>
            <label>Telefone<input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} required /></label>
          </>
        ) : (
          <label>Hóspede
            <select value={form.guestId} onChange={(event) => setForm({ ...form, guestId: event.target.value })} required>
              <option value="">Selecione</option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>{guest.firstName} {guest.lastName}</option>
              ))}
            </select>
          </label>
        )}
        <div className="two-columns">
          <label>Quarto<input value={form.roomNumber} onChange={(event) => setForm({ ...form, roomNumber: event.target.value })} required /></label>
          <label>Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Ativa</option>
              <option value="scheduled">Agendada</option>
              <option value="checked_out">Check-out</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
        </div>
        <div className="two-columns">
          <label>Check-in<input type="date" value={form.checkInDate} onChange={(event) => setForm({ ...form, checkInDate: event.target.value })} required /></label>
          <label>Check-out<input type="date" value={form.checkOutDate} onChange={(event) => setForm({ ...form, checkOutDate: event.target.value })} required /></label>
        </div>
        <div className="two-columns">
          <label>Horário saida<input value={form.checkOutTime} onChange={(event) => setForm({ ...form, checkOutTime: event.target.value })} required /></label>
          <label>Consumo
            <select value={form.consumptionView} onChange={(event) => setForm({ ...form, consumptionView: event.target.value as 'ready' | 'empty' | 'unavailable' })}>
              <option value="ready">Disponível</option>
              <option value="empty">Sem itens</option>
              <option value="unavailable">Indisponível</option>
            </select>
          </label>
        </div>
        <label>Rede Wi-Fi<input value={form.wifiNetwork} onChange={(event) => setForm({ ...form, wifiNetwork: event.target.value })} required /></label>
        <label>Senha Wi-Fi<input value={form.wifiPassword} onChange={(event) => setForm({ ...form, wifiPassword: event.target.value })} required /></label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit">Cadastrar estadia</button>
      </form>
    </section>
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

function isRequestInProgress(status?: string) {
  return status === 'in_progress' || status === 'on_the_way';
}

function isAdminView(view?: string): view is AdminView {
  return Boolean(view && ['dashboard', 'stays', 'guests', 'services', 'requests', 'experiences', 'reservations', 'concierge', 'reports', 'settings'].includes(view));
}

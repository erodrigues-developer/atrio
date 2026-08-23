import { Dispatch, lazy, SetStateAction, Suspense, useEffect, useMemo } from 'react';
import { Button, Dropdown, Input, Menu, Typography } from 'antd';
import {
  ApartmentOutlined, BankOutlined, BellOutlined, CalendarOutlined, DownOutlined, DownloadOutlined,
  HomeOutlined, LeftOutlined, LogoutOutlined, MailOutlined, MessageOutlined, QuestionCircleOutlined,
  SearchOutlined, SettingOutlined, StarOutlined, TeamOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminView, VIEW_ROUTES, pathForView, viewFromPath } from '@/app/router/admin-routes';
import { clearStoredAdminSession } from '@/features/auth';
import { formatTodayLabel } from '@/shared/lib/presentation';
import { getDashboard, logout, type AdminSession } from './api';
import { adminQueryKeys } from '@/shared/api/query-keys';

const DashboardView = lazy(async () => ({ default: (await import('@/features/dashboard')).DashboardView }));
const StaysView = lazy(async () => ({ default: (await import('@/features/stays')).StaysView }));
const GuestsView = lazy(async () => ({ default: (await import('@/features/guests')).GuestsView }));
const ServicesView = lazy(async () => ({ default: (await import('@/features/services')).ServicesView }));
const RequestsView = lazy(async () => ({ default: (await import('@/features/requests')).RequestsView }));
const ExperiencesView = lazy(async () => ({ default: (await import('@/features/experiences')).ExperiencesView }));
const ReservationsView = lazy(async () => ({ default: (await import('@/features/reservations')).ReservationsView }));
const ConciergeView = lazy(async () => ({ default: (await import('@/features/concierge')).ConciergeView }));
const ReportsView = lazy(async () => ({ default: (await import('@/features/reports')).ReportsView }));
const SettingsView = lazy(async () => ({ default: (await import('@/features/settings')).SettingsView }));
export function AdminShell({
  session,
  onSessionChange,
}: {
  session: AdminSession;
  onSessionChange: Dispatch<SetStateAction<AdminSession | null>>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeView = viewFromPath(location.pathname);
  const dashboardQuery = useQuery({
    queryKey: adminQueryKeys.dashboard(session.admin.hotel.id),
    queryFn: () => getDashboard(session.accessToken),
  });
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
    const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';

    if (!Object.values(VIEW_ROUTES).includes(normalizedPath)) {
      navigate(pathForView('dashboard'), { replace: true });
    }
  }, [location.pathname, navigate]);

  function navigateToView(view: AdminView) {
    navigate(pathForView(view));
  }

  async function handleLogout() {
    await logout(session.accessToken).catch(() => null);
    clearStoredAdminSession();
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
        <Suspense fallback={<ViewLoading />}>
          {activeView === 'dashboard' ? (
            <>
              {dashboardQuery.isLoading ? <ViewLoading /> : null}
              {dashboardQuery.error ? <div className="error-state">{dashboardQuery.error.message}</div> : null}
              {!dashboardQuery.isLoading && !dashboardQuery.error && dashboardQuery.data ? (
                <DashboardView
                  accessToken={session.accessToken}
                  dashboard={dashboardQuery.data}
                  onNavigate={navigateToView}
                  onRefresh={async () => {
                    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard(session.admin.hotel.id) });
                  }}
                />
              ) : null}
            </>
          ) : null}
          {activeView === 'stays' ? <StaysView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'guests' ? <GuestsView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'services' ? <ServicesView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'requests' ? <RequestsView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'experiences' ? <ExperiencesView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'reservations' ? <ReservationsView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'concierge' ? <ConciergeView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
          {activeView === 'reports' ? <ReportsView accessToken={session.accessToken} /> : null}
          {activeView === 'settings' ? <SettingsView accessToken={session.accessToken} cacheScope={session.admin.hotel.id} /> : null}
        </Suspense>
      </section>
    </main>
  );
}

function ViewLoading() {
  return <div className="view-loading" role="status">Carregando área...</div>;
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

export const ADMIN_VIEWS = [
  'dashboard',
  'stays',
  'guests',
  'services',
  'requests',
  'experiences',
  'reservations',
  'concierge',
  'reports',
  'settings',
] as const;

export type AdminView = (typeof ADMIN_VIEWS)[number];

export const VIEW_ROUTES: Readonly<Record<AdminView, string>> = {
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

export function isAdminView(value: string | undefined): value is AdminView {
  return value !== undefined && ADMIN_VIEWS.some((view) => view === value);
}

export function viewFromPath(pathname: string): AdminView {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const match = ADMIN_VIEWS.find((view) => VIEW_ROUTES[view] === normalizedPath);

  return match ?? 'dashboard';
}

export function pathForView(view: AdminView) {
  return VIEW_ROUTES[view];
}

import { lazy, Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LoginScreen, useAdminSession } from '@/features/auth';
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary';

const AdminShell = lazy(async () => {
  const module = await import('@/features/admin/AdminShell');

  return { default: module.AdminShell };
});

export function App() {
  const { session, setSession } = useAdminSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session) queryClient.clear();
  }, [queryClient, session]);

  return (
    <AppErrorBoundary>
      {!session ? <LoginScreen onAuthenticated={setSession} /> : (
        <Suspense fallback={<div className="app-loading" role="status">Carregando painel...</div>}>
          <AdminShell session={session} onSessionChange={setSession} />
        </Suspense>
      )}
    </AppErrorBoundary>
  );
}

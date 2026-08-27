import { ReactNode, useState } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

type AppProvidersProps = { children: ReactNode };

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  }));

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
        locale={ptBR}
        theme={{
          token: {
            colorPrimary: '#0b63f6', colorInfo: '#0b63f6', colorLink: '#0b63f6', borderRadius: 8,
            colorText: '#17233b', colorTextSecondary: '#65718b', colorBorder: '#dce3ee', colorBgLayout: '#f6f8fc',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
        }}
        >
          <AntApp message={{ maxCount: 3, top: 24 }}>{children}</AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

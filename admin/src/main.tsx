import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { App } from './App';
import './styles.css';
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#0b63f6',
          colorInfo: '#0b63f6',
          colorLink: '#0b63f6',
          borderRadius: 8,
          colorText: '#17233b',
          colorTextSecondary: '#65718b',
          colorBorder: '#dce3ee',
          colorBgLayout: '#f6f8fc',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProviders } from '@/app/providers/AppProviders';
import './styles.css';
import 'antd/dist/reset.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);

import { App } from 'antd';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceFormModal } from './ServicesView';

vi.mock('@/shared/components/Modal', () => ({
  Modal: ({ children, title }: { children: ReactNode; title: string }) => <section aria-label={title}>{children}</section>,
  ModalFooter: ({ submitLabel }: { submitLabel: string }) => <button type="submit">{submitLabel}</button>,
}));

vi.stubGlobal('ResizeObserver', class {
  disconnect() {}
  observe() {}
  unobserve() {}
});

afterEach(cleanup);

describe('ServiceFormModal', () => {
  it('loads the selected service when switching to edit mode', async () => {
    const commonProps = {
      error: null,
      isSubmitting: false,
      layer: 'primary' as const,
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    };
    const { rerender } = render(
      <App>
        <ServiceFormModal {...commonProps} />
      </App>,
    );

    rerender(
      <App>
        <ServiceFormModal
          {...commonProps}
          service={{
            id: 'spa',
            title: 'Spa no quarto',
            description: 'Massagem e tratamentos de bem-estar.',
            icon: 'Sparkles',
            fulfillmentType: 'spa_team',
            published: false,
            requestSchema: {
              fields: [
                {
                  name: 'flower',
                  label: 'Quantidade de flores',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'message',
                  label: 'Mensagem do cartão',
                  type: 'string',
                  required: false,
                },
              ],
            },
          }}
        />
      </App>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Spa no quarto');
      expect(screen.getByLabelText('Ícone')).toHaveValue('Sparkles');
      expect(screen.getByLabelText('Descrição')).toHaveValue('Massagem e tratamentos de bem-estar.');
      expect(screen.getByLabelText('Atendimento')).toHaveValue('spa_team');
      expect(screen.getByText('Quantidade — seletor com + e −')).toBeInTheDocument();
      expect(screen.getByText('Observação — campo de texto')).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Rótulo exibido ao hóspede/)).toHaveLength(2);
      expect(screen.getAllByLabelText(/Rótulo exibido ao hóspede/)[0]).toHaveValue('Quantidade de flores');
      expect(screen.getAllByLabelText(/Rótulo exibido ao hóspede/)[1]).toHaveValue('Mensagem do cartão');
      expect(screen.getAllByRole('button', { name: /Excluir campo/ })).toHaveLength(2);
      expect(screen.getByRole('checkbox', { name: 'Publicado no catálogo' })).not.toBeChecked();
      expect(screen.getAllByRole('checkbox', { name: 'Preenchimento obrigatório' })[0]).toBeChecked();
      expect(screen.getAllByRole('checkbox', { name: 'Preenchimento obrigatório' })[1]).not.toBeChecked();
    });
  });

  it('adds and removes fields from the guest app form', async () => {
    render(
      <App>
        <ServiceFormModal
          error={null}
          isSubmitting={false}
          layer="primary"
          onCancel={vi.fn()}
          onSubmit={vi.fn()}
        />
      </App>,
    );

    const addButton = screen.getByRole('button', { name: /Adicionar campo/ });
    expect(screen.getAllByRole('button', { name: /Excluir campo/ })).toHaveLength(1);

    fireEvent.click(addButton);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Excluir campo/ })).toHaveLength(2));
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir campo 1' }));
    await waitFor(() => expect(screen.getAllByRole('button', { name: /Excluir campo/ })).toHaveLength(1));
    expect(addButton).toBeEnabled();
  });
});

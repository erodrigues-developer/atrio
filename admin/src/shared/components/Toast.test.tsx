import { App } from 'antd';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  it('shows feedback through Ant Design message at the application level', async () => {
    render(
      <App>
        <section data-testid="page-content">
          <Toast message="Não foi possível concluir a operação." onClose={vi.fn()} tone="error" />
        </section>
      </App>,
    );

    expect(await screen.findByText('Não foi possível concluir a operação.')).toBeInTheDocument();
    expect(document.querySelector('.ant-message')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).not.toHaveTextContent('Não foi possível concluir a operação.');
  });
});

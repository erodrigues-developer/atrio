import { App } from 'antd';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuestFormModal } from './GuestsView';

describe('GuestFormModal', () => {
  it('fills every field with the selected guest data when editing', () => {
    render(
      <App>
        <GuestFormModal
          error={null}
          guest={{
            id: 'guest_001',
            firstName: 'Everton',
            lastName: 'Rodrigues',
            maskedPhone: '*****-1234',
            phoneNumber: '+5531999991234',
          }}
          isSubmitting={false}
          layer="primary"
          onCancel={vi.fn()}
          onSubmit={vi.fn()}
        />
      </App>,
    );

    expect(screen.getByLabelText('Nome')).toHaveValue('Everton');
    expect(screen.getByLabelText('Sobrenome')).toHaveValue('Rodrigues');
    expect(screen.getByLabelText('Telefone')).toHaveValue('+5531999991234');
  });
});

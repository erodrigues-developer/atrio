import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AdminStay } from '../api';
import { StaysTable } from './StaysTable';

const stay: AdminStay = {
  id: 'stay-1',
  hotelId: 'hotel-1',
  roomNumber: '101',
  status: 'scheduled',
  statusLabel: 'Agendada',
  checkInDate: '2030-01-01',
  checkInTime: '14:00',
  checkOutDate: '2030-01-03',
  checkOutTime: '12:00',
  consumptionEnabled: true,
  consumptionView: 'ready',
  guest: {
    id: 'guest-1', firstName: 'Ana', lastName: 'Silva', phoneNumber: '+5511999999999', maskedPhone: '***9999',
  },
  activeGuestSessions: 0,
};

describe('StaysTable', () => {
  it('requires confirmation before cancelling a scheduled stay', async () => {
    const onCancel = vi.fn();
    render(
      <StaysTable
        emptyContent="Sem estadias"
        isLoading={false}
        onCancel={onCancel}
        onResend={vi.fn()}
        onSelect={vi.fn()}
        stays={[stay]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar estadia' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/sairá da operação ativa/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar estadia' }));
    expect(onCancel).toHaveBeenCalledWith(stay);
  });
});

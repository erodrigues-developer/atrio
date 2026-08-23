import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '../api';
import { LoginScreen } from './LoginScreen';

vi.mock('../api', () => ({ login: vi.fn() }));

const session = {
  accessToken: 'access-token',
  expiresAt: '2030-01-01T00:00:00.000Z',
  admin: {
    adminUserId: 'admin-1',
    name: 'Admin',
    email: 'admin@atrio.app',
    role: 'manager',
    permissions: [],
    hotel: { id: 'hotel-1', name: 'Atrio' },
  },
};

describe('LoginScreen', () => {
  beforeEach(() => vi.mocked(login).mockReset());

  it('authenticates with normalized credentials', async () => {
    const onAuthenticated = vi.fn();
    vi.mocked(login).mockResolvedValue(session);
    render(<LoginScreen onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' admin@atrio.app ' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith(session));
    expect(login).toHaveBeenCalledWith('admin@atrio.app', 'secret');
  });
});

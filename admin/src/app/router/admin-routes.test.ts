import { describe, expect, it } from 'vitest';
import { isAdminView, pathForView, viewFromPath } from './admin-routes';

describe('admin routes', () => {
  it('maps known URLs in both directions', () => {
    expect(viewFromPath('/reservations/')).toBe('reservations');
    expect(pathForView('stays')).toBe('/stays');
  });

  it('falls back to the dashboard for an unknown URL', () => {
    expect(viewFromPath('/unknown')).toBe('dashboard');
    expect(isAdminView('unknown')).toBe(false);
  });
});

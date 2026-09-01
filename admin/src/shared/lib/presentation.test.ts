import { describe, expect, it } from 'vitest';
import { formatDuration, nextRequestAction, parseCurrencyInput, requestStatusLabel } from './presentation';

describe('admin presentation rules', () => {
  it('formats operational durations without negative values', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(-10)).toBe('0 min');
    expect(formatDuration()).toBe('-');
  });

  it('maps the service request workflow', () => {
    expect(nextRequestAction('received')).toEqual({ label: 'Aceitar', status: 'accepted' });
    expect(requestStatusLabel('completed')).toBe('concluída');
  });

  it('normalizes a localized currency input to cents', () => {
    expect(parseCurrencyInput('R$ 123,45')).toBe(12_345);
  });
});

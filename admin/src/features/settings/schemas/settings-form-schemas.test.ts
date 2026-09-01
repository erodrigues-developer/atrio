import { describe, expect, it } from 'vitest';
import { usefulInfoFormSchema, wifiFormSchema } from './settings-form-schemas';

describe('settings form schemas', () => {
  it('requires both Wi-Fi fields', () => {
    expect(wifiFormSchema.safeParse({ wifiNetwork: '', wifiPassword: '' }).success).toBe(false);
  });

  it('accepts useful information with a supported scope', () => {
    expect(usefulInfoFormSchema.safeParse({ scope: 'stay', title: 'Café', description: 'Das 7h às 10h.' }).success).toBe(true);
  });

  it('rejects unknown useful-information scopes', () => {
    expect(usefulInfoFormSchema.safeParse({ scope: 'public', title: 'Café', description: 'Aberto.' }).success).toBe(false);
  });
});

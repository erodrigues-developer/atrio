import { describe, expect, it } from 'vitest';
import { serviceFormSchema } from './service-form-schema';

describe('serviceFormSchema', () => {
  it('rejects an incomplete service definition', () => {
    expect(serviceFormSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('accepts a complete service definition', () => {
    expect(serviceFormSchema.safeParse({
      id: '', title: 'Room service', description: 'Entrega no quarto', icon: 'Package',
      fulfillmentType: 'hotel_staff', fields: [
        { kind: 'quantity', label: 'Quantidade', required: true },
        { kind: 'note', label: 'Detalhes', required: false },
      ], published: true,
    }).success).toBe(true);
  });

  it('rejects duplicate app fields', () => {
    expect(serviceFormSchema.safeParse({
      id: '', title: 'Room service', description: 'Entrega no quarto', icon: 'Package',
      fulfillmentType: 'hotel_staff', fields: [
        { kind: 'note', label: 'Detalhes', required: true },
        { kind: 'note', label: 'Observação', required: false },
      ], published: true,
    }).success).toBe(false);
  });
});

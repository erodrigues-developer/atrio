import { describe, expect, it } from 'vitest';
import { serviceFormSchema } from './service-form-schema';

describe('serviceFormSchema', () => {
  it('rejects an incomplete service definition', () => {
    expect(serviceFormSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('accepts a complete service definition', () => {
    expect(serviceFormSchema.safeParse({
      id: '', title: 'Room service', description: 'Entrega no quarto', icon: 'Package',
      fulfillmentType: 'hotel_staff', fieldName: 'note', fieldLabel: 'Detalhes',
      fieldType: 'string', fieldRequired: true, published: true,
    }).success).toBe(true);
  });
});

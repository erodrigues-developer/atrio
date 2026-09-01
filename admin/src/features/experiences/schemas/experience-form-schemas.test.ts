import { describe, expect, it } from 'vitest';
import { collectionFormSchema, experienceFormSchema } from './experience-form-schemas';

describe('experience form schemas', () => {
  it('validates an experience and its image URL', () => {
    const result = experienceFormSchema.safeParse({ id: '', title: 'Jantar', description: 'Menu degustação', category: 'Gastronomia', timeLabel: 'Hoje', priceLabel: 'R$ 100', imageUrl: 'invalid', locationLabel: 'Hotel', included: '', published: true });
    expect(result.success).toBe(false);
  });

  it('allows a collection without an image', () => {
    expect(collectionFormSchema.safeParse({ id: '', title: 'Destaques', description: 'Seleção', imageUrl: '', featured: true, published: true }).success).toBe(true);
  });
});

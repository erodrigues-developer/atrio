import { describe, expect, it } from 'vitest';
import { guestFormSchema } from './guest-form-schema';

describe('guestFormSchema', () => {
  it('normalizes valid guest data', () => {
    expect(guestFormSchema.parse({ firstName: ' Ana ', lastName: ' Silva ', phoneNumber: ' 11999999999 ' })).toEqual({
      firstName: 'Ana', lastName: 'Silva', phoneNumber: '11999999999',
    });
  });

  it('rejects incomplete guest data', () => {
    expect(guestFormSchema.safeParse({ firstName: '', lastName: '', phoneNumber: '123' }).success).toBe(false);
  });
});

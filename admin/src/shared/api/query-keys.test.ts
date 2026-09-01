import { describe, expect, it } from 'vitest';
import { adminQueryKeys } from './query-keys';

describe('adminQueryKeys', () => {
  it('keeps list keys under a domain prefix for safe invalidation', () => {
    const prefix = adminQueryKeys.stays('hotel-1');
    const list = adminQueryKeys.stayList('hotel-1', { page: 2, status: 'active' });
    expect(list.slice(0, prefix.length)).toEqual(prefix);
  });

  it('isolates cached data by hotel without including access tokens', () => {
    expect(adminQueryKeys.services('hotel-1')).not.toEqual(adminQueryKeys.services('hotel-2'));
    expect(JSON.stringify(adminQueryKeys.root('hotel-1'))).not.toContain('access-token');
  });
});

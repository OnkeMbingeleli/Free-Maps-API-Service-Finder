import { describe, it, expect, vi } from 'vitest';

// Example unit test — matches the QA sign-off checklist in blueprint §12A.
// Mock supabaseAdmin so this test doesn't hit a real database.
vi.mock('../../src/config/supabase.js', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [{ id: '1', name: 'Test Clinic', type: 'clinic' }], error: null }),
      }),
    }),
  },
}));

import { listServices } from '../../src/controllers/servicesController.js';

describe('listServices', () => {
  it('returns approved services as JSON', async () => {
    const req = { query: {} };
    const res = { json: vi.fn() };
    const next = vi.fn();

    await listServices(req, res, next);

    expect(res.json).toHaveBeenCalledWith([{ id: '1', name: 'Test Clinic', type: 'clinic' }]);
    expect(next).not.toHaveBeenCalled();
  });
});

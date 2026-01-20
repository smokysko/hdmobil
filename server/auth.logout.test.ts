import { describe, expect, it } from 'vitest';

const hasSupabaseConfig =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

describe.skipIf(!hasSupabaseConfig)('auth.logout', () => {
  it('reports success', async () => {
    const { appRouter } = await import('./routers');
    const ctx = {
      user: {
        id: 'sample-user-id',
        email: 'sample@example.com',
        role: 'user',
      },
      req: {
        protocol: 'https',
        headers: {},
      },
      res: {},
    };

    const caller = appRouter.createCaller(ctx as any);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });
});

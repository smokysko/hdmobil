import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasCredentials = supabaseUrl && supabaseAnonKey;
const hasServiceRole = serviceRoleKey;

describe('Supabase Connection', () => {
  it.skipIf(!hasCredentials)('should connect to Supabase with valid credentials', async () => {
    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
    expect(supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const { data, error } = await supabase
      .from('shipping_methods')
      .select('code, name_sk')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it.skipIf(!hasServiceRole)('should have service role key for server operations', async () => {
    expect(serviceRoleKey).toBeDefined();
    expect(serviceRoleKey).toMatch(/^(eyJ|sb_secret_)/);
  });
});

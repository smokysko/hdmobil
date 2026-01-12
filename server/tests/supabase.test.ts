import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection', () => {
  it('should connect to Supabase with valid credentials', async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
    expect(supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);
    
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    
    // Test connection by fetching shipping methods (public table)
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('code, name_sk')
      .limit(1);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have service role key for server operations', async () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    expect(serviceRoleKey).toBeDefined();
    // Service role key can be JWT or sb_secret format
    expect(serviceRoleKey).toMatch(/^(eyJ|sb_secret_)/);
  });
});

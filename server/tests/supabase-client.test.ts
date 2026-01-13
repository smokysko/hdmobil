import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Client Credentials', () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  it('should have VITE_SUPABASE_URL configured', () => {
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseUrl).toContain('supabase.co');
  });

  it('should have VITE_SUPABASE_ANON_KEY configured', () => {
    expect(supabaseAnonKey).toBeTruthy();
    expect(supabaseAnonKey.length).toBeGreaterThan(100); // JWT tokens are long
  });

  it('should be able to create Supabase client and connect', async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by checking auth status (doesn't require authentication)
    const { data, error } = await supabase.auth.getSession();
    
    // Should not have an error (even if no session exists)
    expect(error).toBeNull();
    // Data should be an object with session property
    expect(data).toHaveProperty('session');
  });

  it('should be able to query public tables', async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to query shipping_methods table (should be public readable)
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('id, name')
      .limit(1);
    
    // If table doesn't exist or RLS blocks, we'll get an error
    // But the connection itself should work
    if (error) {
      // Check if it's a connection error vs RLS/table error
      expect(error.message).not.toContain('Invalid API key');
      expect(error.message).not.toContain('invalid_api_key');
    }
  });
});

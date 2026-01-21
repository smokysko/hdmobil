/*
  # Fix Function Search Path Security
  
  This migration sets explicit search_path for all functions to prevent
  search_path injection vulnerabilities.
  
  1. Modified Functions
    - handle_new_user
    - update_updated_at
    - generate_order_number
    - generate_invoice_number
*/

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.generate_order_number() SET search_path = public;
ALTER FUNCTION public.generate_invoice_number() SET search_path = public;

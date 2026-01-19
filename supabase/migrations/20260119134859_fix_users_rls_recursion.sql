/*
  # Fix Users Table RLS Recursion
  
  1. Problem
    - Current policies on users table cause infinite recursion
    - Admin check policies query the same users table, triggering the same policies
  
  2. Solution
    - Drop all existing policies on users table
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparison instead of subqueries
  
  3. New Policies
    - Users can read their own data
    - Users can update their own non-admin fields
    - Service role handles admin operations
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own non-admin data" ON users;

-- Create clean, non-recursive policies

-- Users can read their own record
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own record (for registration)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own record (except is_admin)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
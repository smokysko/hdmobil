
/*
  # Fix admin_users SELECT policy to allow self-read

  The existing SELECT policy requires checking if the user is already an admin,
  which creates a chicken-and-egg problem: a user can't verify they are an admin
  because they can't read their own record without already being an admin.

  This migration adds a policy that allows any authenticated user to read
  their own row in admin_users (matched by auth_user_id = auth.uid()).
*/

CREATE POLICY "Admins can read own record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

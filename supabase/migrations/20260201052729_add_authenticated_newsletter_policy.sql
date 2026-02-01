/*
  # Add authenticated role policy for newsletter_subscribers

  1. Security Changes
    - Add SELECT policy for authenticated users to view all subscribers (for admin panel)
    - This allows logged-in admins to see the subscriber list

  2. Notes
    - The admin panel needs to read all subscribers for the marketing section
*/

CREATE POLICY "Authenticated users can view all newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);
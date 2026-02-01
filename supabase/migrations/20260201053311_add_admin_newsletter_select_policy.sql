/*
  # Add authenticated users policy for newsletter subscribers

  1. Security Changes
    - Add SELECT policy for authenticated users (admin panel) to view newsletter subscribers
    - This allows admin panel to display the list of newsletter subscribers
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletter_subscribers'
    AND policyname = 'Authenticated users can view newsletter subscribers'
  ) THEN
    CREATE POLICY "Authenticated users can view newsletter subscribers"
      ON newsletter_subscribers
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

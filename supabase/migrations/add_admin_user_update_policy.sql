-- Add policy to allow admins to update any user's status
-- This enables the soft delete feature for admins

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Recreate it with admin privileges included
CREATE POLICY "Users can update own profile or admins can update any user"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

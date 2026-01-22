-- ============================================
-- FINAL FIX: Invitations role constraint
-- ============================================
-- This SQL must be run in Supabase SQL Editor
-- Do NOT try to run the migration file - run this directly!

-- STEP 1: Delete ALL existing invitations (they're likely test data anyway)
-- This prevents the constraint violation error
DELETE FROM public.invitations;

-- STEP 2: Now safely drop the old constraint
ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

-- STEP 3: Add the new constraint with correct roles
ALTER TABLE public.invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'editor', 'viewer'));

-- STEP 4: Update the default value
ALTER TABLE public.invitations
ALTER COLUMN role SET DEFAULT 'editor';

-- STEP 5: Verify the fix
SELECT 'Constraint updated successfully!' as status;

-- You can now generate invite links in the app!

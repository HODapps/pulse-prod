-- ============================================
-- CRITICAL FIX: Update invitations table role constraint
-- ============================================
-- Run this SQL directly in Supabase SQL Editor
-- This fixes the mismatch between old roles (admin, designer) and new roles (admin, editor, viewer)

-- STEP 1: Check current constraint (informational)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.invitations'::regclass 
AND conname = 'invitations_role_check';

-- STEP 2: Update all existing rows to use valid new roles
UPDATE public.invitations
SET role = CASE 
  WHEN role = 'designer' THEN 'editor'
  ELSE role
END;

-- STEP 3: Drop the old constraint (if it exists)
ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

-- STEP 4: Add the new constraint with correct roles
ALTER TABLE public.invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'editor', 'viewer'));

-- STEP 5: Update the default value
ALTER TABLE public.invitations
ALTER COLUMN role SET DEFAULT 'editor';

-- STEP 6: Verify the new constraint is in place
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.invitations'::regclass 
AND conname = 'invitations_role_check';

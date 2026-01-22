-- Fix role constraints to match current role system
-- The database was using old roles (admin, designer) but the app uses (admin, editor, viewer)

-- STEP 1: Update any existing 'designer' invitations to 'editor' BEFORE changing constraint
UPDATE public.invitations
SET role = 'editor'
WHERE role = 'designer';

-- STEP 2: Drop the old constraint
ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

-- STEP 3: Add the new constraint with correct roles
ALTER TABLE public.invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'editor', 'viewer'));

-- STEP 4: Update the default value for invitations
ALTER TABLE public.invitations
ALTER COLUMN role SET DEFAULT 'editor';

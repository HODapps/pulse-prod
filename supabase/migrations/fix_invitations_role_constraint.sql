-- Fix role constraints to match current role system
-- The database was using old roles (admin, designer) but the app uses (admin, editor, viewer)

-- Fix invitations table role constraint
ALTER TABLE public.invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE public.invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'editor', 'viewer'));

-- Update the default value for invitations
ALTER TABLE public.invitations
ALTER COLUMN role SET DEFAULT 'editor';

-- Update any existing 'designer' invitations to 'editor'
UPDATE public.invitations
SET role = 'editor'
WHERE role = 'designer';

-- Note: Users table role constraint should also be updated separately if needed
-- However, we're keeping existing user roles intact for now

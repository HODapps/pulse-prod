-- Migration: Update user roles from admin/designer to admin/viewer/editor
-- This migration updates the role system to support three roles: admin, viewer, and editor

-- Step 1: Drop the old CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new CHECK constraint with the new roles
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'viewer', 'editor'));

-- Step 3: Update existing 'designer' roles to 'editor' (closest equivalent)
UPDATE users SET role = 'editor' WHERE role = 'designer';

-- Step 4: Update the default value for role column (for new users)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'editor';

-- Note: You may also want to update RLS policies if they reference specific roles
-- The existing policies should still work as long as admins and editors have appropriate permissions

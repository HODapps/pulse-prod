-- Migration: Fix database schema for correct status values and project persistence
-- Run this in Supabase SQL Editor BEFORE deploying the new code

-- Step 1: Fix projects table status constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('backlog', 'todo', 'in-progress', 'delivered', 'audit', 'complete', 'archived'));

-- Step 2: If there are any projects with old status values, update them
-- Map old values to new ones:
-- 'to-do' -> 'todo'
-- 'in-review' -> 'audit'
-- 'approved' -> 'complete'
-- 'in-production' -> 'complete'
-- 'completed' -> 'complete'
UPDATE projects SET status = 'todo' WHERE status = 'to-do';
UPDATE projects SET status = 'audit' WHERE status = 'in-review';
UPDATE projects SET status = 'complete' WHERE status = 'approved';
UPDATE projects SET status = 'complete' WHERE status = 'in-production';
UPDATE projects SET status = 'complete' WHERE status = 'completed';

-- Step 3: Verify the constraint is correct
SELECT
  table_name,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'projects_status_check';

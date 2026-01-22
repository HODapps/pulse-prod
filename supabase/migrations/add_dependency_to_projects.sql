-- Add dependency column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS dependency TEXT NOT NULL DEFAULT 'none'
CHECK (dependency IN ('none', 'wip', 'paused', 'blocked'));

-- Add comment to explain the column
COMMENT ON COLUMN projects.dependency IS 'Project dependency status: none, wip (Work in Progress), paused, or blocked';

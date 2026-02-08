-- =====================================================
-- Multi-Board Management Schema
-- =====================================================
-- This migration transforms the app from single-board with hardcoded
-- workflow statuses to multi-board with customizable workflow steps

-- Create boards table (replaces board_settings single-record pattern)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_title TEXT NOT NULL,
  project_color TEXT NOT NULL DEFAULT '160 84% 39%',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_archived ON boards(is_archived);

-- Create workflow_steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color_dot TEXT NOT NULL,
  color_progress TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_board_slug UNIQUE(board_id, slug),
  CONSTRAINT unique_board_position UNIQUE(board_id, position)
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_board_id ON workflow_steps(board_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_position ON workflow_steps(board_id, position);

-- Add board_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES boards(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_projects_board_id ON projects(board_id);

-- Remove hardcoded status constraint to allow dynamic workflow statuses
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Migrate existing data from board_settings to boards
INSERT INTO boards (owner_id, name, team_title, project_color)
SELECT owner_id, board_name, team_title, project_color
FROM board_settings
WHERE NOT EXISTS (SELECT 1 FROM boards); -- Only insert if boards table is empty

-- Link existing projects to their board
UPDATE projects p
SET board_id = (
  SELECT b.id FROM boards b
  WHERE b.owner_id IN (SELECT owner_id FROM board_settings LIMIT 1)
  LIMIT 1
)
WHERE board_id IS NULL;

-- Create default workflow steps for migrated boards (7 default steps)
INSERT INTO workflow_steps (board_id, name, slug, color_dot, color_progress, position)
SELECT
  b.id,
  unnest(ARRAY['Backlog', 'To-Do', 'In Progress', 'Delivered', 'Audit', 'In Production', 'Archived']),
  unnest(ARRAY['backlog', 'todo', 'in-progress', 'delivered', 'audit', 'complete', 'archived']),
  unnest(ARRAY['status-dot-backlog', 'status-dot-todo', 'status-dot-in-progress', 'status-dot-delivered', 'status-dot-audit', 'status-dot-complete', 'status-dot-archived']),
  unnest(ARRAY['progress-bar-backlog', 'progress-bar-todo', 'progress-bar-in-progress', 'progress-bar-delivered', 'progress-bar-audit', 'progress-bar-complete', 'progress-bar-archived']),
  unnest(ARRAY[0, 1, 2, 3, 4, 5, 6])
FROM boards b
WHERE NOT EXISTS (SELECT 1 FROM workflow_steps WHERE board_id = b.id); -- Only insert if no steps exist

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
DROP POLICY IF EXISTS "Users can view own boards" ON boards;
CREATE POLICY "Users can view own boards" ON boards FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own boards" ON boards;
CREATE POLICY "Users can create own boards" ON boards FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own boards" ON boards;
CREATE POLICY "Users can update own boards" ON boards FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own boards" ON boards;
CREATE POLICY "Users can delete own boards" ON boards FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for workflow_steps
DROP POLICY IF EXISTS "Users can view workflow steps for own boards" ON workflow_steps;
CREATE POLICY "Users can view workflow steps for own boards" ON workflow_steps FOR SELECT
  USING (board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage workflow steps for own boards" ON workflow_steps;
CREATE POLICY "Users can manage workflow steps for own boards" ON workflow_steps FOR ALL
  USING (board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid()));

-- Update projects RLS to filter by board ownership
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects in own boards" ON projects;
CREATE POLICY "Users can view projects in own boards" ON projects FOR SELECT
  USING (board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid()));

-- Update projects INSERT policy to ensure board_id is set
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- Add trigger to auto-update updated_at for boards
CREATE OR REPLACE FUNCTION update_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_boards_updated_at_trigger ON boards;
CREATE TRIGGER update_boards_updated_at_trigger
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_boards_updated_at();

-- Enable realtime for boards and workflow_steps
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_steps;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Verify boards table has data from board_settings
-- 2. Verify workflow_steps has 7 default steps per board
-- 3. Verify projects have board_id populated
-- 4. Test creating new boards with custom workflow steps
-- =====================================================

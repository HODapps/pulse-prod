export interface Board {
  id: string;
  owner_id: string;
  name: string;
  team_title: string;
  project_color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  board_id: string;
  name: string;
  slug: string;
  color_dot: string;
  color_progress: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BoardWithWorkflow extends Board {
  workflow_steps: WorkflowStep[];
}

export interface CreateBoardInput {
  name: string;
  team_title: string;
  project_color: string;
  workflow_steps: Omit<WorkflowStep, 'id' | 'board_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateBoardInput {
  name?: string;
  team_title?: string;
  project_color?: string;
  is_archived?: boolean;
}

// Default workflow steps template for new boards
export const DEFAULT_WORKFLOW_STEPS: Omit<WorkflowStep, 'id' | 'board_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Backlog', slug: 'backlog', color_dot: 'status-dot-backlog', color_progress: 'progress-bar-backlog', position: 0 },
  { name: 'To-Do', slug: 'todo', color_dot: 'status-dot-todo', color_progress: 'progress-bar-todo', position: 1 },
  { name: 'In Progress', slug: 'in-progress', color_dot: 'status-dot-in-progress', color_progress: 'progress-bar-in-progress', position: 2 },
  { name: 'Delivered', slug: 'delivered', color_dot: 'status-dot-delivered', color_progress: 'progress-bar-delivered', position: 3 },
  { name: 'Audit', slug: 'audit', color_dot: 'status-dot-audit', color_progress: 'progress-bar-audit', position: 4 },
  { name: 'In Production', slug: 'complete', color_dot: 'status-dot-complete', color_progress: 'progress-bar-complete', position: 5 },
  { name: 'Archived', slug: 'archived', color_dot: 'status-dot-archived', color_progress: 'progress-bar-archived', position: 6 },
];

// Color palette for board selection
export const BOARD_COLORS = [
  { name: 'Green', value: '160 84% 39%' },
  { name: 'Blue', value: '217 91% 60%' },
  { name: 'Purple', value: '262 83% 58%' },
  { name: 'Orange', value: '25 95% 53%' },
  { name: 'Pink', value: '330 81% 60%' },
  { name: 'Teal', value: '173 80% 40%' },
];

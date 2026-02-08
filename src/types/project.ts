export type Priority = 'low' | 'medium' | 'high';

export type DependencyStatus = 'none' | 'wip' | 'paused' | 'blocked';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type UserRole = 'admin' | 'viewer' | 'editor';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarColor?: string;
  role: UserRole;
  status?: 'pending' | 'active' | 'inactive';
  last_active_at?: string | null;
}

export interface Project {
  id: string;
  board_id: string;
  title: string;
  description: string;
  status: string; // Dynamic status from workflow_steps
  priority: Priority;
  dependency: DependencyStatus;
  assigneeId: string;
  createdById: string;
  startDate: string;
  dueDate: string;
  subTasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  'low': { label: 'Low', className: 'priority-low' },
  'medium': { label: 'Medium', className: 'priority-medium' },
  'high': { label: 'High', className: 'priority-high' },
};

export const DEPENDENCY_CONFIG: Record<DependencyStatus, { label: string; className: string }> = {
  'none': { label: 'None', className: 'dependency-none' },
  'wip': { label: 'WIP', className: 'dependency-wip' },
  'paused': { label: 'Paused', className: 'dependency-paused' },
  'blocked': { label: 'Blocked', className: 'dependency-blocked' },
};
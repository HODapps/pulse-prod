export type ProjectStatus = 
  | 'backlog' 
  | 'todo' 
  | 'in-progress' 
  | 'delivered' 
  | 'audit' 
  | 'complete' 
  | 'archived';

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
  title: string;
  description: string;
  status: ProjectStatus;
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

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; dotClass: string; progressClass: string }> = {
  'backlog': { label: 'Backlog', dotClass: 'status-dot-backlog', progressClass: 'progress-bar-backlog' },
  'todo': { label: 'To-Do', dotClass: 'status-dot-todo', progressClass: 'progress-bar-todo' },
  'in-progress': { label: 'In Progress', dotClass: 'status-dot-in-progress', progressClass: 'progress-bar-in-progress' },
  'delivered': { label: 'Delivered', dotClass: 'status-dot-delivered', progressClass: 'progress-bar-delivered' },
  'audit': { label: 'Audit', dotClass: 'status-dot-audit', progressClass: 'progress-bar-audit' },
  'complete': { label: 'In Production', dotClass: 'status-dot-complete', progressClass: 'progress-bar-complete' },
  'archived': { label: 'Archived', dotClass: 'status-dot-archived', progressClass: 'progress-bar-archived' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  'low': { label: 'Low', className: 'priority-low' },
  'medium': { label: 'Medium', className: 'priority-medium' },
  'high': { label: 'High', className: 'priority-high' },
};

export const DEPENDENCY_CONFIG: Record<DependencyStatus, { label: string; className: string; icon?: string }> = {
  'none': { label: 'None', className: 'dependency-none' },
  'wip': { label: 'WIP', className: 'dependency-wip', icon: '🚧' },
  'paused': { label: 'Paused', className: 'dependency-paused', icon: '⏸️' },
  'blocked': { label: 'Blocked', className: 'dependency-blocked', icon: '🚫' },
};

export const ALL_STATUSES: ProjectStatus[] = [
  'backlog',
  'todo',
  'in-progress',
  'delivered',
  'audit',
  'complete',
  'archived',
];
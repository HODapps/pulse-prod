import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectStatus, TeamMember, SubTask } from '@/types/project';

// Sample team members with avatar colors
const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@design.co', role: 'admin', avatarColor: 'bg-emerald-500' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@design.co', role: 'designer', avatarColor: 'bg-pink-400' },
  { id: '3', name: 'James Wilson', email: 'james@design.co', role: 'designer', avatarColor: 'bg-blue-400' },
  { id: '4', name: 'Emma Davis', email: 'emma@design.co', role: 'designer', avatarColor: 'bg-amber-400' },
  { id: '5', name: 'Michael Brown', email: 'michael@design.co', role: 'designer', avatarColor: 'bg-violet-400' },
  { id: '6', name: 'Lisa Johnson', email: 'lisa@design.co', role: 'designer', avatarColor: 'bg-cyan-400' },
  { id: '7', name: 'David Lee', email: 'david@design.co', role: 'designer', avatarColor: 'bg-rose-400' },
  { id: '8', name: 'Anna Martinez', email: 'anna@design.co', role: 'designer', avatarColor: 'bg-teal-400' },
  { id: '9', name: 'Chris Taylor', email: 'chris@design.co', role: 'designer', avatarColor: 'bg-orange-400' },
  { id: '10', name: 'Sophie Anderson', email: 'sophie@design.co', role: 'designer', avatarColor: 'bg-indigo-400' },
];

// Sample projects matching the reference
const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Onboarding Experience',
    description: 'Redesign the user onboarding flow to improve activation rates.',
    status: 'backlog',
    priority: 'low',
    assigneeId: '2',
    createdById: '2',
    startDate: '2025-01-31',
    dueDate: '2025-02-28',
    subTasks: [],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-20',
  },
  {
    id: '2',
    title: 'Search Experience',
    description: 'Improve search functionality with filters and better results.',
    status: 'backlog',
    priority: 'medium',
    assigneeId: '3',
    createdById: '3',
    startDate: '2025-02-14',
    dueDate: '2025-03-29',
    subTasks: [],
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
  },
  {
    id: '3',
    title: 'Dashboard Analytics',
    description: 'Create a new analytics dashboard for business users with customizable...',
    status: 'todo',
    priority: 'medium',
    assigneeId: '4',
    createdById: '4',
    startDate: '2025-01-24',
    dueDate: '2025-02-19',
    subTasks: [
      { id: '3-1', title: 'User research', completed: false },
      { id: '3-2', title: 'Wireframes', completed: false },
      { id: '3-3', title: 'Visual design', completed: false },
    ],
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
  {
    id: '4',
    title: 'User Settings Redesign',
    description: 'Simplify user settings and preferences management.',
    status: 'todo',
    priority: 'low',
    assigneeId: '5',
    createdById: '5',
    startDate: '2025-01-31',
    dueDate: '2025-02-27',
    subTasks: [
      { id: '4-1', title: 'Information architecture', completed: false },
      { id: '4-2', title: 'UI design', completed: false },
    ],
    createdAt: '2025-01-05',
    updatedAt: '2025-01-15',
  },
  {
    id: '5',
    title: 'Mobile App Redesign',
    description: 'Complete redesign of the mobile banking application with focus on...',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '6',
    createdById: '6',
    startDate: '2025-01-09',
    dueDate: '2025-02-27',
    subTasks: [
      { id: '5-1', title: 'User research', completed: true },
      { id: '5-2', title: 'Wireframes', completed: true },
      { id: '5-3', title: 'High-fidelity mockups', completed: true },
      { id: '5-4', title: 'Prototype', completed: false },
      { id: '5-5', title: 'User testing', completed: false },
      { id: '5-6', title: 'Handoff', completed: false },
    ],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-20',
  },
  {
    id: '6',
    title: 'Design System V2',
    description: 'Update and expand the design system with new components, tokens, and...',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '7',
    createdById: '7',
    startDate: '2025-01-04',
    dueDate: '2025-03-14',
    subTasks: [
      { id: '6-1', title: 'Audit current system', completed: true },
      { id: '6-2', title: 'Define new tokens', completed: true },
      { id: '6-3', title: 'Create components', completed: false },
      { id: '6-4', title: 'Documentation', completed: false },
    ],
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
  },
  {
    id: '7',
    title: 'Dark Mode Implementation',
    description: 'Add dark mode support across all applications.',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: '8',
    createdById: '8',
    startDate: '2025-01-14',
    dueDate: '2025-02-09',
    subTasks: [
      { id: '7-1', title: 'Color palette', completed: true },
      { id: '7-2', title: 'Component updates', completed: false },
      { id: '7-3', title: 'Testing', completed: false },
    ],
    createdAt: '2025-01-05',
    updatedAt: '2025-01-18',
  },
  {
    id: '8',
    title: 'E-commerce Checkout Flow',
    description: 'Optimize the checkout experience to reduce cart abandonment rate.',
    status: 'delivered',
    priority: 'medium',
    assigneeId: '9',
    createdById: '9',
    startDate: '2024-12-14',
    dueDate: '2025-01-19',
    subTasks: [
      { id: '8-1', title: 'User research', completed: true },
      { id: '8-2', title: 'Wireframes', completed: true },
      { id: '8-3', title: 'UI design', completed: true },
    ],
    createdAt: '2024-12-01',
    updatedAt: '2025-01-18',
  },
  {
    id: '9',
    title: 'Customer Portal',
    description: 'Design a self-service portal for enterprise customers.',
    status: 'delivered',
    priority: 'high',
    assigneeId: '10',
    createdById: '10',
    startDate: '2024-11-30',
    dueDate: '2025-01-17',
    subTasks: [
      { id: '9-1', title: 'Requirements', completed: true },
      { id: '9-2', title: 'IA', completed: true },
      { id: '9-3', title: 'Design', completed: true },
      { id: '9-4', title: 'Prototype', completed: true },
    ],
    createdAt: '2024-11-28',
    updatedAt: '2025-01-15',
  },
  {
    id: '10',
    title: 'Accessibility Audit',
    description: 'Conduct WCAG 2.1 AA compliance audit across all products.',
    status: 'audit',
    priority: 'high',
    assigneeId: '2',
    createdById: '1',
    startDate: '2025-01-11',
    dueDate: '2025-01-29',
    subTasks: [
      { id: '10-1', title: 'Automated testing', completed: true },
      { id: '10-2', title: 'Manual review', completed: true },
      { id: '10-3', title: 'Report', completed: false },
      { id: '10-4', title: 'Recommendations', completed: false },
    ],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
  },
];

interface ProjectStore {
  projects: Project[];
  teamMembers: TeamMember[];
  currentUserId: string;
  searchQuery: string;
  viewMode: 'kanban' | 'list';
  collapsedColumns: ProjectStatus[];
  expandedCards: string[];
  teamTitle: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'kanban' | 'list') => void;
  toggleColumnCollapse: (status: ProjectStatus) => void;
  toggleCardExpand: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProject: (projectId: string, newStatus: ProjectStatus) => void;
  toggleSubTask: (projectId: string, subTaskId: string) => void;
  setCurrentUser: (userId: string) => void;
  removeTeamMember: (memberId: string) => void;
  setTeamTitle: (title: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: SAMPLE_PROJECTS,
      teamMembers: TEAM_MEMBERS,
      currentUserId: '1', // Admin by default
      searchQuery: '',
      viewMode: 'kanban',
      collapsedColumns: [],
      expandedCards: [],
      teamTitle: 'UX Project Hub',

      setSearchQuery: (query) => set({ searchQuery: query }),

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleColumnCollapse: (status) => set((state) => ({
        collapsedColumns: state.collapsedColumns.includes(status)
          ? state.collapsedColumns.filter((s) => s !== status)
          : [...state.collapsedColumns, status],
      })),

      toggleCardExpand: (projectId) => set((state) => ({
        expandedCards: state.expandedCards.includes(projectId)
          ? state.expandedCards.filter((id) => id !== projectId)
          : [...state.expandedCards, projectId],
      })),

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
            : p
        ),
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      })),

      moveProject: (projectId, newStatus) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : p
        ),
      })),

      toggleSubTask: (projectId, subTaskId) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                subTasks: p.subTasks.map((st) =>
                  st.id === subTaskId ? { ...st, completed: !st.completed } : st
                ),
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        ),
      })),

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      removeTeamMember: (memberId) => set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m.id !== memberId),
      })),

      setTeamTitle: (title) => set({ teamTitle: title }),
    }),
    {
      name: 'project-store',
    }
  )
);
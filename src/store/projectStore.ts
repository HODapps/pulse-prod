import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectStatus, TeamMember, SubTask } from '@/types/project';
import { supabase } from '@/lib/supabase';

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
  addSampleProjects: () => void;
  loadTeamMembers: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      teamMembers: [],
      currentUserId: '',
      searchQuery: '',
      viewMode: 'kanban',
      collapsedColumns: [],
      expandedCards: [],
      teamTitle: '',

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

      addSampleProjects: () => {
        // This function is deprecated and no longer used
        // Keeping for backward compatibility but does nothing
        console.warn('addSampleProjects is deprecated');
      },

      loadTeamMembers: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, avatar_color')
            .order('name', { ascending: true });

          if (error) throw error;

          if (data) {
            set({
              teamMembers: data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as 'admin' | 'designer',
                avatarColor: user.avatar_color,
              }))
            });
          }
        } catch (error) {
          console.error('Error loading team members:', error);
        }
      },
    }),
    {
      name: 'project-store',
    }
  )
);
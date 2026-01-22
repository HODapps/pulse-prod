import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectStatus, TeamMember, SubTask, UserRole } from '@/types/project';
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
  isLoadingProjects: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'kanban' | 'list') => void;
  toggleColumnCollapse: (status: ProjectStatus) => void;
  toggleCardExpand: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  moveProject: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  toggleSubTask: (projectId: string, subTaskId: string) => Promise<void>;
  setCurrentUser: (userId: string) => void;
  removeTeamMember: (memberId: string) => void;
  setTeamTitle: (title: string) => void;
  addSampleProjects: () => void;
  loadTeamMembers: () => Promise<void>;
  loadProjects: () => Promise<void>;
  subscribeToChanges: () => () => void;
}

// Transform database project to frontend format
function transformProjectFromDB(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    status: dbProject.status,
    priority: dbProject.priority,
    dependency: dbProject.dependency || 'none',
    assigneeId: dbProject.assignee_id || '',
    createdById: dbProject.created_by_id || '',
    startDate: dbProject.start_date || '',
    dueDate: dbProject.due_date || '',
    subTasks: dbProject.sub_tasks || [],
    createdAt: dbProject.created_at ? dbProject.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    updatedAt: dbProject.updated_at ? dbProject.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

// Transform frontend project to database format
function transformProjectToDB(project: Partial<Project>) {
  return {
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    dependency: project.dependency || 'none',
    assignee_id: project.assigneeId || null,
    created_by_id: project.createdById || null,
    start_date: project.startDate || null,
    due_date: project.dueDate || null,
    sub_tasks: project.subTasks || [],
  };
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
      isLoadingProjects: false,

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

      loadProjects: async () => {
        set({ isLoadingProjects: true });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (data) {
            const transformedProjects = data.map(transformProjectFromDB);
            set({ projects: transformedProjects });
          }
        } catch (error) {
          console.error('Error loading projects:', error);
        } finally {
          set({ isLoadingProjects: false });
        }
      },

      addProject: async (projectData) => {
        try {
          const dbProject = transformProjectToDB(projectData as Project);

          const { data, error } = await supabase
            .from('projects')
            .insert(dbProject)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const newProject = transformProjectFromDB(data);
            set((state) => ({ projects: [...state.projects, newProject] }));
          }
        } catch (error) {
          console.error('Error adding project:', error);
          throw error;
        }
      },

      updateProject: async (id, updates) => {
        try {
          const dbUpdates = transformProjectToDB(updates);

          const { data, error} = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const updatedProject = transformProjectFromDB(data);
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? updatedProject : p
              ),
            }));
          }
        } catch (error) {
          console.error('Error updating project:', error);
          throw error;
        }
      },

      deleteProject: async (id) => {
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting project:', error);
          throw error;
        }
      },

      moveProject: async (projectId, newStatus) => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .update({ status: newStatus })
            .eq('id', projectId)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const updatedProject = transformProjectFromDB(data);
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
            }));
          }
        } catch (error) {
          console.error('Error moving project:', error);
          throw error;
        }
      },

      toggleSubTask: async (projectId, subTaskId) => {
        try {
          const project = get().projects.find((p) => p.id === projectId);
          if (!project) return;

          const updatedSubTasks = project.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );

          const { data, error } = await supabase
            .from('projects')
            .update({ sub_tasks: updatedSubTasks })
            .eq('id', projectId)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const updatedProject = transformProjectFromDB(data);
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
            }));
          }
        } catch (error) {
          console.error('Error toggling subtask:', error);
          throw error;
        }
      },

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
            .select('id, name, email, role, avatar, avatar_color')
            .order('name', { ascending: true });

          if (error) throw error;

          if (data) {
            set({
              teamMembers: data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
                avatar: user.avatar || undefined,
                avatarColor: user.avatar_color,
              }))
            });
          }
        } catch (error) {
          console.error('Error loading team members:', error);
        }
      },

      subscribeToChanges: () => {
        // Subscribe to projects table changes
        const projectsChannel = supabase
          .channel('projects-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'projects' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newProject = transformProjectFromDB(payload.new);
                set((state) => {
                  // Only add if not already in state
                  if (!state.projects.find(p => p.id === newProject.id)) {
                    return { projects: [...state.projects, newProject] };
                  }
                  return state;
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedProject = transformProjectFromDB(payload.new);
                set((state) => ({
                  projects: state.projects.map((p) =>
                    p.id === updatedProject.id ? updatedProject : p
                  ),
                }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({
                  projects: state.projects.filter((p) => p.id !== payload.old.id),
                }));
              }
            }
          )
          .subscribe();

        // Subscribe to users table changes
        const usersChannel = supabase
          .channel('users-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            () => {
              // Reload team members when users change
              get().loadTeamMembers();
            }
          )
          .subscribe();

        // Return cleanup function
        return () => {
          supabase.removeChannel(projectsChannel);
          supabase.removeChannel(usersChannel);
        };
      },
    }),
    {
      name: 'project-store',
      // Only persist UI preferences, not data
      partialize: (state) => ({
        viewMode: state.viewMode,
        collapsedColumns: state.collapsedColumns,
        expandedCards: state.expandedCards,
        teamTitle: state.teamTitle,
      }),
    }
  )
);

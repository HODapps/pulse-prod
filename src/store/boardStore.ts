import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, WorkflowStep, BoardWithWorkflow, CreateBoardInput, UpdateBoardInput } from '@/types/board';
import { supabase } from '@/lib/supabase';

interface BoardStore {
  boards: Board[];
  activeBoard: BoardWithWorkflow | null;
  workflowSteps: WorkflowStep[];
  isLoadingBoards: boolean;

  // Actions
  loadBoards: () => Promise<void>;
  loadActiveBoard: (boardId: string) => Promise<void>;
  setActiveBoard: (board: BoardWithWorkflow | null) => void;
  createBoard: (boardData: CreateBoardInput) => Promise<Board>;
  updateBoard: (boardId: string, updates: UpdateBoardInput) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  updateWorkflowSteps: (boardId: string, steps: Omit<WorkflowStep, 'id' | 'board_id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  subscribeToBoards: () => () => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      boards: [],
      activeBoard: null,
      workflowSteps: [],
      isLoadingBoards: false,

      loadBoards: async () => {
        set({ isLoadingBoards: true });
        try {
          const { data, error } = await supabase
            .from('boards')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ boards: data || [] });
        } catch (error) {
          console.error('Error loading boards:', error);
        } finally {
          set({ isLoadingBoards: false });
        }
      },

      loadActiveBoard: async (boardId: string) => {
        try {
          console.log('Loading active board:', boardId);

          // Load board
          const { data: board, error: boardError } = await supabase
            .from('boards')
            .select('*')
            .eq('id', boardId)
            .single();

          if (boardError) {
            console.error('Error loading board:', boardError);
            throw boardError;
          }

          // Load workflow steps
          const { data: steps, error: stepsError } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('board_id', boardId)
            .order('position', { ascending: true });

          if (stepsError) {
            console.error('Error loading workflow steps:', stepsError);
            throw stepsError;
          }

          const boardWithWorkflow: BoardWithWorkflow = {
            ...board,
            workflow_steps: steps || []
          };

          console.log('Board loaded successfully:', boardWithWorkflow);

          set({
            activeBoard: boardWithWorkflow,
            workflowSteps: steps || []
          });

          // Apply board color to CSS variable
          document.documentElement.style.setProperty('--primary', board.project_color);
        } catch (error) {
          console.error('Error loading active board:', error);
          set({ activeBoard: null, workflowSteps: [] });
        }
      },

      setActiveBoard: (board) => set({ activeBoard: board }),

      createBoard: async (boardData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        try {
          // Create board
          const { data: board, error: boardError } = await supabase
            .from('boards')
            .insert({
              owner_id: user.id,
              name: boardData.name,
              team_title: boardData.team_title,
              project_color: boardData.project_color,
            })
            .select()
            .single();

          if (boardError) {
            console.error('Error creating board:', boardError);
            throw boardError;
          }

          // Create workflow steps
          const stepsToInsert = boardData.workflow_steps.map(step => ({
            board_id: board.id,
            name: step.name,
            slug: step.slug,
            color_dot: step.color_dot,
            color_progress: step.color_progress,
            position: step.position,
          }));

          const { error: stepsError } = await supabase
            .from('workflow_steps')
            .insert(stepsToInsert);

          if (stepsError) {
            console.error('Error creating workflow steps:', stepsError);
            throw stepsError;
          }

          // Reload boards
          await get().loadBoards();

          return board;
        } catch (error) {
          console.error('Error in createBoard:', error);
          throw error;
        }
      },

      updateBoard: async (boardId, updates) => {
        try {
          const { error } = await supabase
            .from('boards')
            .update(updates)
            .eq('id', boardId);

          if (error) throw error;

          // Reload boards
          await get().loadBoards();

          // If updating active board, reload it
          if (get().activeBoard?.id === boardId) {
            await get().loadActiveBoard(boardId);
          }
        } catch (error) {
          console.error('Error updating board:', error);
          throw error;
        }
      },

      deleteBoard: async (boardId) => {
        try {
          const { error } = await supabase
            .from('boards')
            .delete()
            .eq('id', boardId);

          if (error) throw error;

          // Update local state
          set(state => ({
            boards: state.boards.filter(b => b.id !== boardId),
            activeBoard: state.activeBoard?.id === boardId ? null : state.activeBoard
          }));
        } catch (error) {
          console.error('Error deleting board:', error);
          throw error;
        }
      },

      updateWorkflowSteps: async (boardId, steps) => {
        try {
          // Delete existing steps
          const { error: deleteError } = await supabase
            .from('workflow_steps')
            .delete()
            .eq('board_id', boardId);

          if (deleteError) throw deleteError;

          // Insert new steps
          const stepsToInsert = steps.map(step => ({
            board_id: boardId,
            name: step.name,
            slug: step.slug,
            color_dot: step.color_dot,
            color_progress: step.color_progress,
            position: step.position,
          }));

          const { error: insertError } = await supabase
            .from('workflow_steps')
            .insert(stepsToInsert);

          if (insertError) throw insertError;

          // If this is the active board, reload it
          if (get().activeBoard?.id === boardId) {
            await get().loadActiveBoard(boardId);
          }
        } catch (error) {
          console.error('Error updating workflow steps:', error);
          throw error;
        }
      },

      subscribeToBoards: () => {
        const channel = supabase
          .channel('boards-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'boards' },
            () => {
              console.log('Board change detected, reloading boards');
              get().loadBoards();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'workflow_steps' },
            (payload) => {
              console.log('Workflow step change detected:', payload);
              const activeBoard = get().activeBoard;
              if (activeBoard && payload.new && (payload.new as any).board_id === activeBoard.id) {
                get().loadActiveBoard(activeBoard.id);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },
    }),
    {
      name: 'board-store',
      partialize: (state) => ({
        activeBoard: state.activeBoard,
      }),
    }
  )
);

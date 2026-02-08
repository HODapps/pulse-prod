import { useState, useEffect } from 'react';
import { Edit2, Trash2, FolderKanban } from 'lucide-react';
import { Board } from '@/types/board';
import { useBoardStore } from '@/store/boardStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
  onEdit: () => void;
}

export function BoardCard({ board, onClick, onEdit }: BoardCardProps) {
  const { deleteBoard } = useBoardStore();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  // Load project count for this board
  useEffect(() => {
    const loadProjectCount = async () => {
      try {
        const { count, error } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('board_id', board.id);

        if (error) throw error;
        setProjectCount(count || 0);
      } catch (error) {
        console.error('Error loading project count:', error);
      }
    };

    loadProjectCount();
  }, [board.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBoard(board.id);
      toast({
        title: 'Board deleted',
        description: `${board.name} has been deleted successfully.`,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting board:', error);
      toast({
        title: 'Failed to delete board',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary cursor-pointer transition-all hover:shadow-md"
      >
        {/* Color indicator */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
          style={{ backgroundColor: `hsl(${board.project_color})` }}
        />

        {/* Content */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: `hsl(${board.project_color} / 0.1)` }}
            >
              <FolderKanban
                className="h-6 w-6"
                style={{ color: `hsl(${board.project_color})` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{board.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{board.team_title}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditClick}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Project count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Projects</span>
          <span className="font-medium">{projectCount}</span>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{board.name}</strong>?
              This will permanently delete the board and all {projectCount} projects within it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Board'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

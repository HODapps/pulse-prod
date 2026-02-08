import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useBoardStore } from '@/store/boardStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { BoardCard } from '@/components/boards/BoardCard';
import { BoardSheet } from '@/components/boards/BoardSheet';
import { Board } from '@/types/board';

export default function Boards() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { boards, loadBoards, isLoadingBoards } = useBoardStore();
  const [showBoardSheet, setShowBoardSheet] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setShowBoardSheet(true);
  };

  const handleNewBoard = () => {
    setEditingBoard(null);
    setShowBoardSheet(true);
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const handleCloseSheet = () => {
    setShowBoardSheet(false);
    setEditingBoard(null);
  };

  if (isLoadingBoards) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Boards</h1>
            <p className="text-sm text-muted-foreground">
              Select a board to manage your projects
            </p>
          </div>
          <Button onClick={handleNewBoard}>
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {boards.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Create Your First Board</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Boards help you organize your projects with custom workflows.
              Get started by creating your first board.
            </p>
            <Button onClick={handleNewBoard} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        ) : (
          // Boards grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => handleBoardClick(board.id)}
                onEdit={() => handleEditBoard(board)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Board Sheet */}
      <BoardSheet
        open={showBoardSheet}
        onOpenChange={handleCloseSheet}
        board={editingBoard}
      />
    </div>
  );
}

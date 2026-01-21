import { useState } from 'react';
import { Sparkles, Rocket, Users, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSampleProjects: () => Promise<void>;
  onStartFromScratch: () => void;
}

export function WelcomeModal({
  open,
  onOpenChange,
  onAddSampleProjects,
  onStartFromScratch,
}: WelcomeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddSamples = async () => {
    setIsLoading(true);
    try {
      await onAddSampleProjects();
      toast({
        title: 'Sample projects added!',
        description: 'Explore the board to see how it works.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to add sample projects',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFresh = () => {
    onStartFromScratch();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-3xl shadow-lg">
              U
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Project Pulse! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your new home for managing UX projects from concept to production.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features Overview */}
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Visual Kanban Board</h4>
                <p className="text-sm text-muted-foreground">
                  Drag and drop projects across 7 workflow stages from backlog to completion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Team Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  Invite team members, assign projects, and collaborate in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Track Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Manage subtasks, set deadlines, and monitor project status at a glance.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started Options */}
          <div className="border-t pt-6 space-y-3">
            <h3 className="font-semibold text-center mb-4">How would you like to start?</h3>

            <Button
              onClick={handleAddSamples}
              disabled={isLoading}
              className="w-full h-auto py-4 flex-col gap-2 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Adding sample projects...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold">Add 3 Sample Projects</span>
                  </div>
                  <span className="text-xs font-normal opacity-90">
                    See how the board works with example projects
                  </span>
                </>
              )}
            </Button>

            <Button
              onClick={handleStartFresh}
              variant="outline"
              disabled={isLoading}
              className="w-full h-auto py-4 flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span className="font-semibold">Start From Scratch</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Begin with an empty board and create your own projects
              </span>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can always invite team members later from Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Plus, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onCreateProject: () => void;
  onInviteTeam: () => void;
  isAdmin: boolean;
}

export function EmptyState({ onCreateProject, onInviteTeam, isAdmin }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8">
      <Card className="max-w-2xl w-full p-12 text-center shadow-elevation-2">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-3">Your Board is Empty</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Start by creating your first project or inviting team members to collaborate.
        </p>

        <div className="space-y-4">
          <Button
            onClick={onCreateProject}
            size="lg"
            className="w-full sm:w-auto px-8 h-12 text-base"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </Button>

          {isAdmin && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">or</span>
              <Button
                onClick={onInviteTeam}
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base"
              >
                <Users className="h-5 w-5 mr-2" />
                Invite Team Members
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Workflow Stages
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">Backlog</div>
              <div className="text-xs text-muted-foreground">Ideas & planning</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">To Do</div>
              <div className="text-xs text-muted-foreground">Ready to start</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">In Progress</div>
              <div className="text-xs text-muted-foreground">Active work</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">In Review</div>
              <div className="text-xs text-muted-foreground">Awaiting feedback</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">Approved</div>
              <div className="text-xs text-muted-foreground">Ready for prod</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium mb-1">In Production</div>
              <div className="text-xs text-muted-foreground">Live & deployed</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 col-span-2">
              <div className="font-medium mb-1">Completed</div>
              <div className="text-xs text-muted-foreground">Done & archived</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

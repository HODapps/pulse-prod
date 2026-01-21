import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface BoardSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const PROJECT_COLORS = [
  { name: 'Green', value: '160 84% 39%', css: 'hsl(160, 84%, 39%)' },
  { name: 'Blue', value: '217 91% 60%', css: 'hsl(217, 91%, 60%)' },
  { name: 'Purple', value: '262 83% 58%', css: 'hsl(262, 83%, 58%)' },
  { name: 'Orange', value: '25 95% 53%', css: 'hsl(25, 95%, 53%)' },
  { name: 'Pink', value: '330 81% 60%', css: 'hsl(330, 81%, 60%)' },
  { name: 'Teal', value: '173 80% 40%', css: 'hsl(173, 80%, 40%)' },
];

export function BoardSetupWizard({ open, onOpenChange, onComplete }: BoardSetupWizardProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [boardName, setBoardName] = useState('');
  const [teamTitle, setTeamTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);

  const handleNext = () => {
    if (step === 1 && !boardName.trim()) {
      toast({
        title: 'Board name required',
        description: 'Please enter a name for your board',
        variant: 'destructive',
      });
      return;
    }
    if (step === 2 && !teamTitle.trim()) {
      toast({
        title: 'Team title required',
        description: 'Please enter a title for your team',
        variant: 'destructive',
      });
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save board settings to database
      const { error } = await supabase
        .from('board_settings')
        .insert({
          owner_id: user.id,
          board_name: boardName.trim(),
          team_title: teamTitle.trim(),
          project_color: selectedColor,
        });

      if (error) throw error;

      // Update user status to active
      await supabase
        .from('users')
        .update({
          status: 'active',
          last_active_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Apply the selected color to the document
      document.documentElement.style.setProperty('--primary', selectedColor);

      toast({
        title: 'Board setup complete!',
        description: 'Your board has been configured successfully',
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving board settings:', error);
      toast({
        title: 'Failed to save settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-3xl shadow-lg">
              {step === 3 ? <Check className="h-8 w-8" /> : step}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {step === 1 && 'Name Your Board'}
            {step === 2 && 'Set Team Title'}
            {step === 3 && 'Choose Project Color'}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {step === 1 && 'Give your project board a memorable name'}
            {step === 2 && 'Set the title for your team workspace'}
            {step === 3 && 'Pick a color theme for your projects'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={cn(
                  'h-2 w-12 rounded-full transition-colors',
                  num === step ? 'bg-primary' : num < step ? 'bg-primary/50' : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Step 1: Board Name */}
          {step === 1 && (
            <div className="space-y-3">
              <Label htmlFor="board-name" className="text-base">Board Name</Label>
              <Input
                id="board-name"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="e.g., Product Design Hub"
                className="h-12 text-base"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext();
                }}
              />
              <p className="text-sm text-muted-foreground">
                This is the main name of your project board
              </p>
            </div>
          )}

          {/* Step 2: Team Title */}
          {step === 2 && (
            <div className="space-y-3">
              <Label htmlFor="team-title" className="text-base">Team Title</Label>
              <Input
                id="team-title"
                value={teamTitle}
                onChange={(e) => setTeamTitle(e.target.value)}
                placeholder="e.g., Design Team"
                className="h-12 text-base"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext();
                }}
              />
              <p className="text-sm text-muted-foreground">
                The name of your team or department
              </p>
            </div>
          )}

          {/* Step 3: Project Color */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base">Project Color</Label>
              <div className="flex flex-wrap justify-center gap-4">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'relative w-16 h-16 rounded-full transition-all ring-offset-2 ring-offset-background hover:scale-110',
                      selectedColor === color.value && 'ring-2 ring-foreground scale-110'
                    )}
                    style={{ backgroundColor: color.css }}
                    aria-label={`Select ${color.name} color`}
                  >
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-8 w-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                This color will be used as the theme for your board
              </p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-11"
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-11"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex-1 h-11"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GripVertical, Plus, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Board, DEFAULT_WORKFLOW_STEPS, BOARD_COLORS } from '@/types/board';
import { useBoardStore } from '@/store/boardStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100),
  team_title: z.string().min(1, 'Team title is required').max(100),
  project_color: z.string(),
  workflow_steps: z.array(z.object({
    name: z.string().min(1, 'Step name is required'),
    slug: z.string(),
    color_dot: z.string(),
    color_progress: z.string(),
    position: z.number(),
  })).min(1, 'At least one workflow step is required').max(10, 'Maximum 10 workflow steps allowed'),
});

type FormValues = z.infer<typeof formSchema>;

interface BoardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board | null;
}

function SortableWorkflowStep({ id, index, name, onRemove, onChange }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 bg-muted rounded-lg",
        isDragging && "opacity-50"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <Input
          placeholder="Step name (e.g., In Progress)"
          value={name}
          onChange={(e) => onChange(index, e.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function BoardSheet({ open, onOpenChange, board }: BoardSheetProps) {
  const { createBoard, updateBoard, updateWorkflowSteps, loadActiveBoard } = useBoardStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team_title: '',
      project_color: BOARD_COLORS[0].value,
      workflow_steps: DEFAULT_WORKFLOW_STEPS,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load board data when editing
  useEffect(() => {
    if (board && open) {
      // Load workflow steps for this board
      const loadSteps = async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('board_id', board.id)
            .order('position');

          if (data) {
            const steps = data.map((step, index) => ({
              name: step.name,
              slug: step.slug,
              color_dot: step.color_dot,
              color_progress: step.color_progress,
              position: index,
            }));
            setWorkflowSteps(steps);
            form.reset({
              name: board.name,
              team_title: board.team_title,
              project_color: board.project_color,
              workflow_steps: steps,
            });
          }
        } catch (error) {
          console.error('Error loading workflow steps:', error);
        }
      };
      loadSteps();
    } else if (!board && open) {
      // Reset for new board
      setWorkflowSteps(DEFAULT_WORKFLOW_STEPS);
      form.reset({
        name: '',
        team_title: '',
        project_color: BOARD_COLORS[0].value,
        workflow_steps: DEFAULT_WORKFLOW_STEPS,
      });
    }
  }, [board, open, form]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const steps = form.getValues('workflow_steps');
      const oldIndex = steps.findIndex((_, i) => i.toString() === active.id);
      const newIndex = steps.findIndex((_, i) => i.toString() === over.id);

      const reordered = arrayMove(steps, oldIndex, newIndex).map((step, index) => ({
        ...step,
        position: index,
      }));

      form.setValue('workflow_steps', reordered);
      setWorkflowSteps(reordered);
    }
  };

  const handleStepNameChange = (index: number, name: string) => {
    const steps = form.getValues('workflow_steps');
    steps[index] = {
      ...steps[index],
      name,
      slug: generateSlug(name),
    };
    form.setValue('workflow_steps', steps);
    setWorkflowSteps(steps);
  };

  const handleAddStep = () => {
    const steps = form.getValues('workflow_steps');
    const newStep = {
      name: '',
      slug: '',
      color_dot: 'status-dot-backlog',
      color_progress: 'progress-bar-backlog',
      position: steps.length,
    };
    const updated = [...steps, newStep];
    form.setValue('workflow_steps', updated);
    setWorkflowSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    const steps = form.getValues('workflow_steps');
    if (steps.length <= 1) {
      toast({
        title: 'Cannot remove step',
        description: 'At least one workflow step is required.',
        variant: 'destructive',
      });
      return;
    }
    const updated = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      position: i,
    }));
    form.setValue('workflow_steps', updated);
    setWorkflowSteps(updated);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (board) {
        // Update existing board
        await updateBoard(board.id, {
          name: values.name,
          team_title: values.team_title,
          project_color: values.project_color,
        });

        // Update workflow steps
        await updateWorkflowSteps(board.id, values.workflow_steps);

        toast({
          title: 'Board updated',
          description: `${values.name} has been updated successfully.`,
        });
      } else {
        // Create new board
        const newBoard = await createBoard({
          name: values.name,
          team_title: values.team_title,
          project_color: values.project_color,
          workflow_steps: values.workflow_steps,
        });

        toast({
          title: 'Board created',
          description: `${values.name} has been created successfully.`,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving board:', error);
      toast({
        title: 'Failed to save board',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{board ? 'Edit Board' : 'Create New Board'}</SheetTitle>
          <SheetDescription>
            {board
              ? 'Update your board settings and customize your workflow.'
              : 'Create a new board with a custom workflow for your projects.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Board Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Board Details</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marketing Projects" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marketing Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board Color</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-6 gap-2">
                        {BOARD_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={cn(
                              "h-10 rounded-md border-2 transition-all",
                              field.value === color.value
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: `hsl(${color.value})` }}
                            onClick={() => field.onChange(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Workflow Steps</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStep}
                  disabled={workflowSteps.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={workflowSteps.map((_, i) => i.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {workflowSteps.map((step, index) => (
                      <SortableWorkflowStep
                        key={index}
                        id={index.toString()}
                        index={index}
                        name={step.name}
                        onChange={handleStepNameChange}
                        onRemove={handleRemoveStep}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <FormMessage>
                {form.formState.errors.workflow_steps?.message}
              </FormMessage>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : board ? 'Update Board' : 'Create Board'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

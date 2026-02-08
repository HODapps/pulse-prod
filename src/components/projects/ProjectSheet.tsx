import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Trash2 } from 'lucide-react';
import { Project, Priority, DependencyStatus, PRIORITY_CONFIG, DEPENDENCY_CONFIG, TeamMember } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { useBoardStore } from '@/store/boardStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.string().min(1, 'Status is required'),
  priority: z.enum(['low', 'medium', 'high']),
  dependency: z.enum(['none', 'wip', 'paused', 'blocked']),
  assigneeId: z.string().min(1, 'Assignee is required'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  subTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  })),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  defaultStatus?: string;
}

export function ProjectSheet({ open, onOpenChange, project, defaultStatus }: ProjectSheetProps) {
  const { currentUserId, addProject, updateProject, deleteProject } = useProjectStore();
  const { workflowSteps } = useBoardStore();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [newSubTask, setNewSubTask] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = teamMembers.find((m) => m.id === currentUserId);
  const isEditing = !!project;

  // Fetch team members from database
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role, avatar_color')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data) {
          setTeamMembers(data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'designer',
            avatarColor: user.avatar_color,
          })));
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'backlog',
      priority: 'medium',
      dependency: 'none',
      assigneeId: currentUserId,
      startDate: '',
      dueDate: '',
      subTasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subTasks',
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        dependency: project.dependency || 'none',
        assigneeId: project.assigneeId,
        startDate: project.startDate,
        dueDate: project.dueDate,
        subTasks: project.subTasks,
      });
      setStartDate(project.startDate ? new Date(project.startDate) : undefined);
      setDueDate(project.dueDate ? new Date(project.dueDate) : undefined);
    } else {
      // Only set assigneeId if currentUserId exists and teamMembers are loaded
      const validAssigneeId = currentUserId && teamMembers.some(m => m.id === currentUserId)
        ? currentUserId
        : (teamMembers.length > 0 ? teamMembers[0].id : '');

      reset({
        title: '',
        description: '',
        status: defaultStatus || (workflowSteps.length > 0 ? workflowSteps[0].slug : ''),
        priority: 'medium',
        dependency: 'none',
        assigneeId: validAssigneeId,
        startDate: '',
        dueDate: '',
        subTasks: [],
      });
      setStartDate(undefined);
      setDueDate(undefined);
    }
  }, [project, reset, currentUserId, defaultStatus, teamMembers]);

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Form submitted with data:', data);

    const projectData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dependency: data.dependency,
      assigneeId: data.assigneeId,
      subTasks: data.subTasks.map(st => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
      })),
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
    };

    console.log('Prepared project data:', projectData);

    try {
      if (isEditing && project) {
        console.log('Updating project:', project.id);
        await updateProject(project.id, projectData);
      } else {
        console.log('Creating new project');
        await addProject({
          ...projectData,
          createdById: currentUserId,
        });
      }
      console.log('Project saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving project:', error);
      // You could add a toast notification here
    }
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      append({
        id: Date.now().toString(),
        title: newSubTask.trim(),
        completed: false,
      });
      setNewSubTask('');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      console.log('Deleting project:', project.id);
      await deleteProject(project.id);
      console.log('Project deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Project' : 'New Project'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the project details below.' : 'Fill in the details to create a new project.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('Form validation failed:', errors);
        })} className="space-y-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter project title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the project..."
              rows={3}
            />
          </div>

          {/* Status & Priority & Dependency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {workflowSteps.map((step) => (
                    <SelectItem key={step.slug} value={step.slug}>
                      {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(['low', 'medium', 'high'] as Priority[]).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_CONFIG[priority].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dependency Status */}
          <div className="space-y-2">
            <Label>Dependency Status</Label>
            <Select
              value={watch('dependency')}
              onValueChange={(value) => setValue('dependency', value as DependencyStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dependency status" />
              </SelectTrigger>
              <SelectContent>
                {(['none', 'wip', 'paused', 'blocked'] as DependencyStatus[]).map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {DEPENDENCY_CONFIG[dep].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee *</Label>
            <Select
              value={watch('assigneeId')}
              onValueChange={(value) => setValue('assigneeId', value)}
            >
              <SelectTrigger className={errors.assigneeId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeId && (
              <p className="text-sm text-destructive">{errors.assigneeId.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Sub-tasks */}
          <div className="space-y-3">
            <Label>Sub-tasks</Label>
            
            <div className="flex gap-2">
              <Input
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                placeholder="Add a sub-task"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTask();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddSubTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                {fields.map((field, index) => {
                  const subTasks = watch('subTasks');
                  const isCompleted = subTasks[index]?.completed || false;
                  
                  return (
                    <div key={field.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={(checked) => {
                          setValue(`subTasks.${index}.completed`, checked === true);
                        }}
                        className="shrink-0"
                      />
                      <span className={`flex-1 text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {field.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <span className="font-semibold"> "{project?.title}"</span> and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

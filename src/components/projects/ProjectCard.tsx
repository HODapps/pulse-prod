import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  compact?: boolean;
}

export function ProjectCard({ project, onEdit, compact = false }: ProjectCardProps) {
  const { teamMembers, expandedCards, toggleCardExpand, toggleSubTask, currentUserId } = useProjectStore();
  const isExpanded = expandedCards.includes(project.id);

  const assignee = teamMembers.find((m) => m.id === project.assigneeId);
  const currentUser = teamMembers.find((m) => m.id === currentUserId);
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor' || project.createdById === currentUserId;

  // Debug logging (remove after testing)
  if (project.assigneeId && !assignee) {
    console.log('Assignee not found:', {
      projectTitle: project.title,
      assigneeId: project.assigneeId,
      teamMembersCount: teamMembers.length,
      teamMemberIds: teamMembers.map(m => m.id)
    });
  }

  const completedTasks = project.subTasks.filter((t) => t.completed).length;
  const totalTasks = project.subTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const progressClass = STATUS_CONFIG[project.status].progressClass;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format date range
  const formatDateRange = () => {
    if (!project.startDate && !project.dueDate) return null;
    const start = project.startDate ? format(new Date(project.startDate), 'MMM d') : '';
    const end = project.dueDate ? format(new Date(project.dueDate), 'MMM d') : '';
    return `${start} - ${end}`;
  };

  const hasExpandableContent = project.description || totalTasks > 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <div className="p-4">
        {/* Title Row with Expand Toggle */}
        <div className="flex items-start gap-2 mb-2">
          {/* Expand/Collapse Toggle */}
          {hasExpandableContent ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCardExpand(project.id);
              }}
              className="mt-0.5 p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )} />
            </button>
          ) : (
            <div className="w-5" /> 
          )}
          
          {/* Title and Priority */}
          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
            <h3 
              className="font-medium text-foreground text-sm leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                canEdit && onEdit(project);
              }}
            >
              {project.title}
            </h3>
            <span className={cn(
              "shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full",
              PRIORITY_CONFIG[project.priority].className
            )}>
              {PRIORITY_CONFIG[project.priority].label}
            </span>
          </div>
        </div>

        {/* Expandable Content - Description and Task Progress */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Description */}
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}

              {/* Task Progress */}
              {totalTasks > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {completedTasks} of {totalTasks} tasks
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", progressClass)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date and Assignee - Always visible */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {formatDateRange() ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange()}
            </span>
          ) : (
            <div />
          )}

          {assignee && (
            <Avatar className={cn("h-7 w-7 shrink-0", assignee.avatarColor)}>
              <AvatarFallback className={cn("text-xs font-medium text-white", assignee.avatarColor)}>
                {assignee.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Expanded Sub-tasks */}
      <AnimatePresence>
        {isExpanded && totalTasks > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground">Sub-tasks</h4>
                {project.subTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      canEdit && toggleSubTask(project.id, task.id).catch(console.error);
                    }}
                    disabled={!canEdit}
                    className={cn(
                      "flex items-center gap-2 w-full text-left text-sm",
                      task.completed ? "text-muted-foreground line-through" : "text-foreground",
                      canEdit && "hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md"
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
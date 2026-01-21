import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, Plus } from 'lucide-react';
import { Project, ProjectStatus, ALL_STATUSES, STATUS_CONFIG } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '../onboarding/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Droppable area component for empty columns
function DroppableArea({ status }: { status: ProjectStatus }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center h-24 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-border/50"
      )}
    >
      Drop projects here
    </div>
  );
}

interface KanbanBoardProps {
  onEditProject: (project: Project) => void;
  onNewProject: (status?: ProjectStatus) => void;
}

export function KanbanBoard({ onEditProject, onNewProject }: KanbanBoardProps) {
  const { projects, searchQuery, collapsedColumns, toggleColumnCollapse, moveProject } = useProjectStore();
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      delivered: [],
      audit: [],
      complete: [],
      archived: [],
    };
    filteredProjects.forEach((p) => {
      grouped[p.status].push(p);
    });
    return grouped;
  }, [filteredProjects]);

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (ALL_STATUSES.includes(overId as ProjectStatus)) {
      moveProject(projectId, overId as ProjectStatus);
      return;
    }

    // Check if dropped on another card
    const overProject = projects.find((p) => p.id === overId);
    if (overProject && overProject.id !== projectId) {
      moveProject(projectId, overProject.status);
    }
  };

  // Show empty state when there are no projects
  if (projects.length === 0) {
    return (
      <EmptyState
        onCreateProject={() => onNewProject()}
        onInviteTeam={() => {
          // This will be handled by Index component opening settings
          const event = new CustomEvent('openSettings');
          window.dispatchEvent(event);
        }}
        isAdmin={user?.role === 'admin'}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 md:p-6 overflow-x-auto custom-scrollbar min-h-[calc(100vh-10rem)] bg-board">
        {ALL_STATUSES.map((status) => {
          const isCollapsed = collapsedColumns.includes(status);
          const columnProjects = projectsByStatus[status];
          const config = STATUS_CONFIG[status];

          return (
            <motion.div
              key={status}
              layout
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "shrink-0 flex flex-col rounded-xl bg-column border border-border/30",
                isCollapsed ? "w-12" : "w-72 md:w-80"
              )}
            >
              {/* Column Header */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  {!isCollapsed && (
                    <div className="flex items-center gap-2">
                      {/* Status Dot */}
                      <div className={cn("w-2.5 h-2.5 rounded-full", config.dotClass)} />
                      <h2 className="font-medium text-foreground text-sm">
                        {config.label}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {columnProjects.length}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleColumnCollapse(status)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={isCollapsed ? `Expand ${config.label}` : `Collapse ${config.label}`}
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isCollapsed && "-rotate-90"
                    )} />
                  </Button>
                </div>

                {isCollapsed && (
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", config.dotClass)} />
                    <span
                      className="text-xs font-medium text-muted-foreground"
                      style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                    >
                      {config.label} ({columnProjects.length})
                    </span>
                  </div>
                )}
              </div>

              {/* Cards */}
              <AnimatePresence mode="popLayout">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 custom-scrollbar"
                  >
                    <SortableContext
                      items={columnProjects.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onEdit={onEditProject}
                        />
                      ))}
                    </SortableContext>

                    {columnProjects.length === 0 && (
                      <DroppableArea status={status} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <DragOverlay>
        {activeProject && (
          <div className="w-72 md:w-80">
            <ProjectCard project={activeProject} onEdit={onEditProject} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
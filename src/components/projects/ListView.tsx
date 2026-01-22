import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Project, PRIORITY_CONFIG, STATUS_CONFIG, TeamMember } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ListViewProps {
  onEditProject: (project: Project) => void;
}

export function ListView({ onEditProject }: ListViewProps) {
  const { projects, searchQuery, teamMembers, expandedCards, toggleCardExpand, deleteProject, currentUserId } = useProjectStore();

  const currentUser = teamMembers.find((m) => m.id === currentUserId);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Group by assignee
  const projectsByAssignee = useMemo(() => {
    const grouped: Record<string, { member: TeamMember; projects: Project[] }> = {};
    
    filteredProjects.forEach((project) => {
      const assignee = teamMembers.find((m) => m.id === project.assigneeId);
      if (assignee) {
        if (!grouped[assignee.id]) {
          grouped[assignee.id] = { member: assignee, projects: [] };
        }
        grouped[assignee.id].projects.push(project);
      }
    });

    // Sort by number of projects (descending)
    return Object.values(grouped).sort((a, b) => b.projects.length - a.projects.length);
  }, [filteredProjects, teamMembers]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {projectsByAssignee.map(({ member, projects: memberProjects }) => (
        <Collapsible key={member.id} defaultOpen>
          <div className="rounded-xl bg-card border border-border shadow-elevation-1 overflow-hidden">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                  <AvatarFallback className="bg-primary-container text-accent-foreground">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h2 className="font-medium text-foreground">{member.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {memberProjects.length} project{memberProjects.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-border">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Project</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Progress</div>
                </div>

                {/* Projects */}
                <AnimatePresence>
                  {memberProjects.map((project, index) => {
                    const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor' || project.createdById === currentUserId;
                    const isExpanded = expandedCards.includes(project.id);
                    const completedTasks = project.subTasks.filter((t) => t.completed).length;
                    const totalTasks = project.subTasks.length;
                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors",
                          isExpanded && "bg-muted/10"
                        )}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 items-center">
                          {/* Project Title */}
                          <div className="md:col-span-4 flex items-start gap-3">
                            <button
                              onClick={() => toggleCardExpand(project.id)}
                              className="mt-1 text-muted-foreground hover:text-foreground"
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <div>
                              <h3 className="font-medium text-foreground">{project.title}</h3>
                              {!isExpanded && project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="md:col-span-2 flex items-center gap-2 md:justify-start">
                            <span className="text-xs text-muted-foreground md:hidden">Status:</span>
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[project.status].dotClass)} />
                              <span className="text-xs text-foreground">
                                {STATUS_CONFIG[project.status].label}
                              </span>
                            </div>
                          </div>

                          {/* Priority */}
                          <div className="md:col-span-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground md:hidden">Priority:</span>
                            <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", PRIORITY_CONFIG[project.priority].className)}>
                              {PRIORITY_CONFIG[project.priority].label}
                            </span>
                          </div>

                          {/* Due Date */}
                          <div className="md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 hidden md:block" />
                            <span className="text-xs text-muted-foreground md:hidden">Due:</span>
                            {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : '—'}
                          </div>

                          {/* Progress */}
                          <div className="md:col-span-2 flex items-center gap-3">
                            {totalTasks > 0 ? (
                              <>
                                <Progress value={progress} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {completedTasks}/{totalTasks}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            
                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEdit && (
                                  <>
                                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => deleteProject(project.id).catch(console.error)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {!canEdit && (
                                  <DropdownMenuItem disabled>
                                    View only
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 ml-7 md:ml-11">
                                <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                                  {project.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {project.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Start: </span>
                                      <span className="text-foreground">
                                        {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '—'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Due: </span>
                                      <span className="text-foreground">
                                        {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : '—'}
                                      </span>
                                    </div>
                                  </div>

                                  {project.subTasks.length > 0 && (
                                    <div className="pt-2">
                                      <h4 className="text-xs font-medium text-foreground mb-2">Sub-tasks</h4>
                                      <div className="space-y-1">
                                        {project.subTasks.map((task) => (
                                          <div
                                            key={task.id}
                                            className={cn(
                                              "flex items-center gap-2 text-sm",
                                              task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                            )}
                                          >
                                            <div className={cn(
                                              "h-1.5 w-1.5 rounded-full",
                                              task.completed ? "bg-primary" : "bg-muted-foreground"
                                            )} />
                                            {task.title}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}

      {projectsByAssignee.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}
    </div>
  );
}

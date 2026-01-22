import { Search, LayoutGrid, List, Plus, Settings, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onNewProject: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export function Header({ onNewProject, onOpenSettings, onOpenProfile }: HeaderProps) {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    teamMembers,
    teamTitle,
  } = useProjectStore();
  const { user, logout } = useAuthStore();

  // Show first 5 team members in the avatar stack
  const visibleMembers = teamMembers.slice(0, 5);
  const remainingCount = teamMembers.length - 5;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border/40">
      <div className="px-4 md:px-6 py-4">
        {/* Top row: Logo and Team */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg">
              U
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {teamTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                Design Team Management
              </p>
            </div>
          </div>

          {/* Team Avatars and New Project */}
          <div className="flex items-center gap-4">
            {/* Team Label and Avatars */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Team</span>
              <div className="flex -space-x-2">
                {visibleMembers.map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-surface"
                  >
                    {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                    <AvatarFallback className={cn("text-xs font-medium text-white", member.avatarColor)}>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-muted text-xs font-medium text-muted-foreground">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>

            {/* New Project Button */}
            <Button
              onClick={onNewProject}
              className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>

            {/* Settings Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="h-10 w-10 rounded-lg border-border"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-lg border-border"
                    aria-label="User menu"
                  >
                    <Avatar className="h-7 w-7">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className={cn("text-xs font-medium text-white", user.avatarColor)}>
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onOpenProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Bottom row: Search and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 bg-surface border-border rounded-lg focus:border-primary"
            />
          </div>

          {/* View Toggle - Pill Style */}
          <div className="flex items-center rounded-full bg-muted p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={cn(
                "h-8 px-4 rounded-full gap-2 transition-all",
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
              )}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "h-8 px-4 rounded-full gap-2 transition-all",
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
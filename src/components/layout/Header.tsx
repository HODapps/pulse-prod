import { Search, LayoutGrid, List, Plus, Settings, LogOut, User, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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

  // BackButton Component - Only show when not on /boards page
  const BackButton = () => {
    if (location.pathname === '/boards') return null;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/boards')}
        className="h-9 w-9"
        aria-label="Back to boards"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  };

  // SearchBar Component
  const SearchBar = () => (
    <div className="relative w-48 sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-9"
      />
    </div>
  );

  // ViewToggle Component
  const ViewToggle = () => (
    <div className="flex items-center rounded-full bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('kanban')}
        className={cn(
          "h-7 px-3 rounded-full gap-2 transition-all",
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
          "h-7 px-3 rounded-full gap-2 transition-all",
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
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Back Navigation */}
        <div className="flex items-center">
          <BackButton />
        </div>

        {/* Center: Search + View Toggle (grouped) */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <SearchBar />
          <ViewToggle />
        </div>

        {/* Right: Team + Actions */}
        <div className="flex items-center gap-2">
          {/* Team Label and Avatars */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Team</span>
            <div className="flex -space-x-2">
              {visibleMembers.map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-surface"
                >
                  {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                  <AvatarFallback
                    className="text-xs font-medium text-white"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  >
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
            className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            className="h-9 w-9 rounded-lg border-border"
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
                  className="h-9 w-9 rounded-lg border-border"
                  aria-label="User menu"
                >
                  <Avatar className="h-6 w-6">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback
                      className="text-xs font-medium text-white"
                      style={{ backgroundColor: 'hsl(var(--primary))' }}
                    >
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
    </header>
  );
}
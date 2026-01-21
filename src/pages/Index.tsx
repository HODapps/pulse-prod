import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { ListView } from '@/components/projects/ListView';
import { ProjectSheet } from '@/components/projects/ProjectSheet';
import { SettingsSheet } from '@/components/projects/SettingsSheet';
import { ProfileSheet } from '@/components/auth/ProfileSheet';
import { BoardSetupWizard } from '@/components/onboarding/BoardSetupWizard';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus } from '@/types/project';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { viewMode, setViewMode, setCurrentUser, projects, loadTeamMembers, loadProjects, subscribeToChanges } = useProjectStore();
  const { user } = useAuthStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ProjectStatus | undefined>(undefined);
  const [hasBoardSettings, setHasBoardSettings] = useState(true);
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);

  // Track user activity
  useActivityTracker();

  // Sync current user from auth store to project store and load data
  useEffect(() => {
    if (user) {
      setCurrentUser(user.id);
      loadTeamMembers();
      loadProjects();
    }
  }, [user, setCurrentUser, loadTeamMembers, loadProjects]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToChanges();
      return () => {
        unsubscribe();
      };
    }
  }, [user, subscribeToChanges]);

  // Check if admin user needs to complete board setup
  useEffect(() => {
    const checkBoardSettings = async () => {
      if (!user || user.role !== 'admin') {
        setIsCheckingSettings(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('board_settings')
          .select('id')
          .limit(1)
          .single();

        if (error || !data) {
          // No board settings found, show setup wizard
          setHasBoardSettings(false);
          setSetupWizardOpen(true);
        } else {
          setHasBoardSettings(true);
        }
      } catch (error) {
        console.error('Error checking board settings:', error);
      } finally {
        setIsCheckingSettings(false);
      }
    };

    checkBoardSettings();
  }, [user]);

  // Listen for openSettings event from empty state
  useEffect(() => {
    const handleOpenSettings = () => setSettingsOpen(true);
    window.addEventListener('openSettings', handleOpenSettings);
    return () => window.removeEventListener('openSettings', handleOpenSettings);
  }, []);

  const handleSetupComplete = () => {
    setHasBoardSettings(true);
    setSetupWizardOpen(false);
  };

  const handleNewProject = (status?: ProjectStatus) => {
    setEditingProject(null);
    setDefaultStatus(status);
    setSheetOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setDefaultStatus(undefined);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-board">
      <Header
        onNewProject={() => handleNewProject()}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />
      
      {/* Mobile View Toggle */}
      <div className="sm:hidden flex items-center justify-center gap-2 py-3 bg-surface border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('kanban')}
          className={`h-8 px-3 ${
            viewMode === 'kanban'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Kanban
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('list')}
          className={`h-8 px-3 ${
            viewMode === 'list'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
      </div>

      {/* Main Content */}
      <main>
        {viewMode === 'kanban' ? (
          <KanbanBoard onEditProject={handleEditProject} onNewProject={handleNewProject} />
        ) : (
          <ListView onEditProject={handleEditProject} />
        )}
      </main>

      {/* Project Sheet */}
      <ProjectSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editingProject}
        defaultStatus={defaultStatus}
      />

      {/* Settings Sheet */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      {/* Board Setup Wizard */}
      <BoardSetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onComplete={handleSetupComplete}
      />
    </div>
  );
};

export default Index;

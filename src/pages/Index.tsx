import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { ListView } from '@/components/projects/ListView';
import { ProjectSheet } from '@/components/projects/ProjectSheet';
import { SettingsSheet } from '@/components/projects/SettingsSheet';
import { ProfileSheet } from '@/components/auth/ProfileSheet';
import { useProjectStore } from '@/store/projectStore';
import { useBoardStore } from '@/store/boardStore';
import { useAuthStore } from '@/store/authStore';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { Project } from '@/types/project';

const Index = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { viewMode, setViewMode, setCurrentUser, projects, loadTeamMembers, loadProjects, subscribeToChanges } = useProjectStore();
  const { activeBoard, loadActiveBoard, subscribeToBoards } = useBoardStore();
  const { user } = useAuthStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string | undefined>(undefined);

  // Track user activity
  useActivityTracker();

  // Load active board based on URL parameter
  useEffect(() => {
    if (boardId && user) {
      console.log('Loading board:', boardId);
      loadActiveBoard(boardId);
    } else if (!boardId) {
      // Redirect to boards page if no boardId
      navigate('/boards');
    }
  }, [boardId, user, loadActiveBoard, navigate]);

  // Sync current user and load data after board is loaded
  useEffect(() => {
    if (user && activeBoard) {
      setCurrentUser(user.id);
      loadTeamMembers();
      loadProjects();
    }
  }, [user, activeBoard, setCurrentUser, loadTeamMembers, loadProjects]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (user && activeBoard) {
      const unsubscribeProjects = subscribeToChanges();
      const unsubscribeBoards = subscribeToBoards();
      return () => {
        unsubscribeProjects();
        unsubscribeBoards();
      };
    }
  }, [user, activeBoard, subscribeToChanges, subscribeToBoards]);

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
    console.log('New Project button clicked, status:', status);
    setEditingProject(null);
    setDefaultStatus(status);
    setSheetOpen(true);
    console.log('Sheet should be open now');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setDefaultStatus(undefined);
    setSheetOpen(true);
  };

  // Show loading while board is loading
  if (!activeBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-board">
      <Header
        onNewProject={() => handleNewProject()}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

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
    </div>
  );
};

export default Index;

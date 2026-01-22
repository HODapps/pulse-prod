import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Copy, Check, Mail, Crown, Eye, Edit, Shield, Trash2, Circle, Link as LinkIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { generateInviteLink } from '@/lib/api/invitations';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/project';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_color: string;
  status: 'pending' | 'active' | 'inactive';
  last_active_at: string | null;
}

interface BoardSettings {
  id: string;
  board_name: string;
  team_title: string;
  project_color: string;
}

const PROJECT_COLORS = [
  { name: 'Green', value: '160 84% 39%', css: 'hsl(160, 84%, 39%)' },
  { name: 'Blue', value: '217 91% 60%', css: 'hsl(217, 91%, 60%)' },
  { name: 'Purple', value: '262 83% 58%', css: 'hsl(262, 83%, 58%)' },
  { name: 'Orange', value: '25 95% 53%', css: 'hsl(25, 95%, 53%)' },
  { name: 'Pink', value: '330 81% 60%', css: 'hsl(330, 81%, 60%)' },
  { name: 'Teal', value: '173 80% 40%', css: 'hsl(173, 80%, 40%)' },
];

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { teamTitle, setTeamTitle } = useProjectStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [boardSettings, setBoardSettings] = useState<BoardSettings | null>(null);
  const [inviteRole, setInviteRole] = useState<UserRole>('editor');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';

  // Fetch board settings
  const fetchBoardSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('board_settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setBoardSettings(data);
        setSelectedColor(data.project_color);
        setTeamTitle(data.team_title);
        document.documentElement.style.setProperty('--primary', data.project_color);
      }
    } catch (error) {
      console.error('Error fetching board settings:', error);
    }
  }, [user, setTeamTitle]);

  // Fetch team members from database
  const fetchTeamMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar_color, status, last_active_at')
        .neq('status', 'inactive')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setTeamMembers(data as TeamMember[]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Failed to load team members',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMembers(false);
    }
  }, [toast]);

  // Load data when sheet opens
  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      fetchBoardSettings();
    }
  }, [open, fetchTeamMembers, fetchBoardSettings]);

  // Auto-save function with debounce
  const triggerAutoSave = useCallback((message: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Settings saved",
        description: message,
      });
    }, 500);
  }, [toast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    });
  };

  const handleGenerateInviteLink = async () => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "Only admins can generate invitation links",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingLink(true);

    try {
      console.log('Generating invite link with role:', inviteRole);
      const result = await generateInviteLink({
        role: inviteRole,
      });

      console.log('Invite link generated:', result);

      setInviteLink(result.inviteUrl);

      toast({
        title: "Invite link generated!",
        description: "Copy and share this link with your team member",
      });
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast({
        title: "Failed to generate invite link",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteLink) return;

    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: "Link copied",
      description: "Invite link copied to clipboard.",
    });
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    triggerAutoSave(`Theme changed to ${checked ? 'dark' : 'light'} mode`);
  };

  const handleColorChange = async (colorValue: string) => {
    setSelectedColor(colorValue);
    document.documentElement.style.setProperty('--primary', colorValue);

    // Update database if admin
    if (user?.role === 'admin' && boardSettings) {
      try {
        await supabase
          .from('board_settings')
          .update({ project_color: colorValue })
          .eq('id', boardSettings.id);

        triggerAutoSave('Project color updated');
      } catch (error) {
        console.error('Error updating color:', error);
      }
    }
  };

  const handleTeamTitleChange = async (value: string) => {
    setTeamTitle(value);

    // Update database if admin
    if (user?.role === 'admin' && boardSettings) {
      try {
        await supabase
          .from('board_settings')
          .update({ team_title: value })
          .eq('id', boardSettings.id);

        triggerAutoSave('Team title updated');
      } catch (error) {
        console.error('Error updating team title:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTeamTitleChange(e.target.value);
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "Only admins can change roles",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      // Update local state
      setTeamMembers(prev =>
        prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
      );

      // Also reload team members to ensure projectStore is synced
      const { loadTeamMembers } = useProjectStore.getState();
      await loadTeamMembers();

      toast({
        title: "Role updated",
        description: `Member role changed to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Failed to update role",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "Only admins can remove members",
        variant: "destructive",
      });
      return;
    }

    if (memberId === user.id) {
      toast({
        title: "Cannot remove yourself",
        description: "You cannot remove your own account",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mark user as inactive and remove from public.users
      // Note: We can't delete from auth.users from client side (requires service role)
      // Instead, we mark as inactive which effectively removes them from the team
      const { error } = await supabase
        .from('users')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      // Remove from local state
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));

      // Also reload team members to ensure projectStore is synced
      const { loadTeamMembers } = useProjectStore.getState();
      await loadTeamMembers();

      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team.`,
      });
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const getStatusIndicator = (member: TeamMember) => {
    if (member.status === 'active') {
      return <Circle className="h-3 w-3 fill-green-500 text-green-500" />;
    } else if (member.status === 'pending') {
      return <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />;
    } else {
      return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />;
    }
  };

  const getStatusText = (member: TeamMember) => {
    if (member.status === 'active') {
      return 'Active';
    } else if (member.status === 'pending') {
      return 'Pending';
    } else {
      return 'Inactive';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Customize your project hub and manage team access.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Team Title (Admin only) */}
          {user?.role === 'admin' && (
            <>
              <div className="space-y-3">
                <Label htmlFor="team-title" className="text-sm font-medium">Team Title</Label>
                <Input
                  id="team-title"
                  value={teamTitle}
                  onChange={handleInputChange}
                  placeholder="Enter team title"
                  className="h-10"
                />
              </div>

              <Separator />
            </>
          )}

          {/* Project Colors (Admin only) */}
          {user?.role === 'admin' && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Project Color</Label>
                <div className="flex flex-wrap gap-3">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorChange(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background",
                        selectedColor === color.value && "ring-2 ring-foreground"
                      )}
                      style={{ backgroundColor: color.css }}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={handleThemeToggle}
            />
          </div>

          <Separator />

          {/* Invite Collaborators (Admin only) */}
          {user?.role === 'admin' && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Invite Collaborators</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={inviteRole} onValueChange={(value: UserRole) => setInviteRole(value)} disabled={isGeneratingLink}>
                      <SelectTrigger className="h-10 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-1.5">
                            <Edit className="h-3.5 w-3.5" />
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateInviteLink} size="sm" className="h-10 px-4" disabled={isGeneratingLink}>
                      {isGeneratingLink ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Generate Link
                        </>
                      )}
                    </Button>
                  </div>

                  {inviteLink && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <Input
                          value={inviteLink}
                          readOnly
                          className="h-9 flex-1 text-xs bg-background"
                        />
                        <Button onClick={handleCopyInviteLink} variant="outline" size="sm" className="h-9 px-3">
                          {linkCopied ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this magic link with your team member. Link expires in 7 days.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Share Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="h-10 flex-1 text-xs bg-muted"
              />
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="h-10 px-4">
                {linkCopied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Team Members & Access */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Team Members</Label>
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No team members yet. Invite collaborators to get started.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={cn("h-8 w-8", member.avatar_color)}>
                        <AvatarFallback className={cn("text-xs font-medium text-white", member.avatar_color)}>
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {member.name}
                          {member.role === 'admin' && (
                            <span className="text-xs text-primary font-normal">(Admin)</span>
                          )}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {getStatusIndicator(member)}
                          <p className="text-xs text-muted-foreground">
                            {getStatusText(member)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role === 'admin' && member.id !== user.id ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value: UserRole) => handleRoleChange(member.id, value)}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-1.5">
                                  <Eye className="h-3.5 w-3.5" />
                                  Viewer
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-1.5">
                                  <Edit className="h-3.5 w-3.5" />
                                  Editor
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            aria-label={`Remove ${member.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : member.role === 'admin' ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary">
                          <Crown className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      ) : member.role === 'editor' ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Edit className="h-4 w-4" />
                          <span>Editor</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>Viewer</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

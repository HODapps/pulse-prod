import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Copy, Check, Mail, Crown, Eye, Edit, Shield, Trash2 } from 'lucide-react';
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
import { sendInvitation } from '@/lib/api/invitations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const { teamMembers, removeTeamMember, teamTitle, setTeamTitle } = useProjectStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'designer'>('designer');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [memberAccess, setMemberAccess] = useState<Record<string, string>>({});

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';

  // Initialize member access levels
  useEffect(() => {
    const initialAccess: Record<string, string> = {};
    teamMembers.forEach((member) => {
      initialAccess[member.id] = member.role === 'admin' ? 'admin' : 'editor';
    });
    setMemberAccess(initialAccess);
  }, [teamMembers]);

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

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission denied",
        description: "Only admins can send invitations",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    try {
      const { signupUrl } = await sendInvitation({
        email: inviteEmail,
        role: inviteRole,
      });

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${inviteEmail}`,
      });

      // Copy signup link to clipboard as backup
      await navigator.clipboard.writeText(signupUrl);

      toast({
        title: "Link copied",
        description: "Signup link copied to clipboard",
      });

      setInviteEmail('');
      setInviteRole('designer');
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    triggerAutoSave(`Theme changed to ${checked ? 'dark' : 'light'} mode`);
  };

  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue);
    // Apply the color to the primary CSS variable
    document.documentElement.style.setProperty('--primary', colorValue);
    triggerAutoSave('Project color updated');
  };

  const handleTeamTitleChange = (value: string) => {
    setTeamTitle(value);
    triggerAutoSave('Team title updated');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTeamTitleChange(e.target.value);
  };

  const handleAccessChange = (memberId: string, access: string) => {
    setMemberAccess((prev) => ({ ...prev, [memberId]: access }));
    triggerAutoSave('Member access updated');
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    removeTeamMember(memberId);
    toast({
      title: "Member removed",
      description: `${memberName} has been removed from the team.`,
      variant: "destructive",
    });
  };

  const getAccessIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-primary" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAccessLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Can Edit';
      default:
        return 'View Only';
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
          {/* Team Title */}
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

          {/* Project Colors */}
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

          {/* Invite Collaborators */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Invite Collaborators</Label>
            <div className="space-y-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="h-10"
                disabled={isInviting || (user?.role !== 'admin')}
              />
              <div className="flex gap-2">
                <Select value={inviteRole} onValueChange={(value: 'admin' | 'designer') => setInviteRole(value)} disabled={isInviting || (user?.role !== 'admin')}>
                  <SelectTrigger className="h-10 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} size="sm" className="h-10 px-4" disabled={isInviting || !inviteEmail || (user?.role !== 'admin')}>
                  {isInviting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
              {user?.role !== 'admin' && (
                <p className="text-xs text-muted-foreground">Only admins can send invitations</p>
              )}
            </div>
          </div>

          <Separator />

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
            <Label className="text-sm font-medium">Team Members & Access</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("h-8 w-8", member.avatarColor)}>
                      <AvatarFallback className={cn("text-xs font-medium text-white", member.avatarColor)}>
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        {member.name}
                        {member.role === 'admin' && (
                          <span className="text-xs text-primary font-normal">(Owner)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.name.toLowerCase().replace(' ', '.')}@team.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'admin' ? (
                      <div className="flex items-center gap-1.5 text-xs text-primary">
                        {getAccessIcon('admin')}
                        <span>{getAccessLabel('admin')}</span>
                      </div>
                    ) : (
                      <>
                        <Select 
                          value={memberAccess[member.id] || 'editor'}
                          onValueChange={(value) => handleAccessChange(member.id, value)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5" />
                                View Only
                              </div>
                            </SelectItem>
                            <SelectItem value="editor">
                              <div className="flex items-center gap-1.5">
                                <Edit className="h-3.5 w-3.5" />
                                Can Edit
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Camera, Lock, Check, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, resetProfile]);

  // Auto-save function with debounce
  const triggerAutoSave = useCallback((message: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Profile updated",
        description: message,
      });
    }, 500);
  }, [toast]);

  const onSubmitProfile = (data: ProfileFormData) => {
    if (user) {
      updateProfile({
        name: data.name,
        email: data.email,
      });
      triggerAutoSave('Your profile information has been updated.');
    }
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validate current password (in demo, check against "password123")
    if (data.currentPassword !== 'password123') {
      setPasswordError('Current password is incorrect');
      return;
    }

    // In production, send to backend API
    // For demo, just show success message
    setPasswordSuccess(true);
    resetPassword();

    toast({
      title: "Password changed",
      description: "Your password has been successfully updated.",
    });

    setTimeout(() => {
      setPasswordSuccess(false);
    }, 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setAvatarPreview(imageUrl);

      // Update user profile with new avatar
      if (user) {
        updateProfile({ avatar: imageUrl });
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been successfully updated.",
        });
      }

      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile
          </SheetTitle>
          <SheetDescription>
            Manage your personal information and account settings.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className={cn("h-20 w-20", user.avatarColor)}>
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={user.name} />
                  ) : (
                    <AvatarFallback className={cn("text-lg font-medium text-white", user.avatarColor)}>
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.role === 'admin' ? 'Administrator' : 'Designer'}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the camera icon to upload a new photo (max 5MB)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Information Form */}
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Profile Information</Label>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  {...registerProfile('name')}
                  placeholder="Enter your full name"
                  className={cn("h-10", profileErrors.name && 'border-destructive')}
                />
                {profileErrors.name && (
                  <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email')}
                  placeholder="Enter your email"
                  className={cn("h-10", profileErrors.email && 'border-destructive')}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                )}
              </div>
            </div>

            {isProfileDirty && (
              <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            )}
          </form>

          <Separator />

          {/* Change Password Form */}
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Label>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {passwordSuccess && (
                <Alert className="border-primary bg-primary/5">
                  <Check className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Password successfully updated!
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword')}
                  placeholder="Enter current password"
                  className={cn("h-10", passwordErrors.currentPassword && 'border-destructive')}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword')}
                  placeholder="Enter new password"
                  className={cn("h-10", passwordErrors.newPassword && 'border-destructive')}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  placeholder="Confirm new password"
                  className={cn("h-10", passwordErrors.confirmPassword && 'border-destructive')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" variant="outline" className="w-full h-10">
              Update Password
            </Button>
          </form>

          {/* Account Info */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Account Information</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium">Role:</span> {user.role === 'admin' ? 'Administrator' : 'Designer'}
              </p>
              <p>
                <span className="font-medium">User ID:</span> {user.id}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { verifyInviteToken, acceptInvitation } from '@/lib/api/invitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Verify invite token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!inviteToken) {
        setSignupError('Invalid invitation link');
        setIsVerifying(false);
        return;
      }

      try {
        const invitation = await verifyInviteToken(inviteToken);
        setInviteRole(invitation.role as 'admin' | 'editor' | 'viewer');
        setIsVerifying(false);
      } catch (error) {
        setSignupError(error instanceof Error ? error.message : 'Invalid or expired invitation');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [inviteToken]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setSignupError('');

    try {
      if (!inviteToken) {
        throw new Error('Invalid invitation token');
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Avatar colors from new palette
      const avatarColors = [
        '196 60% 79%',  // Sky Blue
        '152 55% 81%',  // Mint Green
        '267 44% 81%',  // Soft Lavender
        '10 100% 83%',  // Peachy Coral
        '44 100% 81%',  // Butter Yellow
        '340 100% 91%', // Blush Pink
        '122 33% 84%',  // Sage Green
        '226 65% 84%',  // Periwinkle
      ];

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: inviteRole,
            avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update invitation with email and mark as accepted
        await supabase
          .from('invitations')
          .update({
            email: data.email,
            status: 'accepted'
          })
          .eq('token', inviteToken);

        setSignupSuccess(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevation-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Verifying invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signupError && isVerifying) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevation-2">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{signupError}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/login')}
              className="w-full mt-4"
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-board flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevation-2">
          <CardContent className="pt-6">
            <Alert className="border-primary bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Account created successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-board flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl shadow-lg">
              U
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join Project Pulse</h1>
          <p className="text-muted-foreground">You've been invited as a {inviteRole}</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-elevation-2 border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Create Your Account</CardTitle>
            <CardDescription>Complete your profile to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Alert */}
              {signupError && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      'pl-10 h-11',
                      errors.email && 'border-destructive focus-visible:ring-destructive'
                    )}
                    {...register('email')}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className={cn(
                      'pl-10 h-11',
                      errors.name && 'border-destructive focus-visible:ring-destructive'
                    )}
                    {...register('name')}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    className={cn(
                      'pl-10 h-11',
                      errors.password && 'border-destructive focus-visible:ring-destructive'
                    )}
                    {...register('password')}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className={cn(
                      'pl-10 h-11',
                      errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                    )}
                    {...register('confirmPassword')}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Project Pulse - Design Team Management
        </p>
      </div>
    </div>
  );
};

export default Signup;

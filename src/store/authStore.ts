import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { supabase } from '@/lib/supabase';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // Fetch user profile from database
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error fetching profile:', error);
              set({ user: null, isAuthenticated: false, isLoading: false });
              return;
            }

            if (profile) {
              set({
                user: profile as User,
                isAuthenticated: true,
                isLoading: false,
              });
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Fetch user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              set({ isLoading: false });
              return { success: false, error: 'Failed to fetch user profile' };
            }

            if (profile) {
              // Update user status to active on login
              await supabase
                .from('users')
                .update({
                  status: 'active',
                  last_active_at: new Date().toISOString()
                })
                .eq('id', data.user.id);

              set({
                user: { ...profile, status: 'active' } as User,
                isAuthenticated: true,
                isLoading: false,
              });
              return { success: true };
            }
          }

          set({ isLoading: false });
          return { success: false, error: 'Failed to fetch user profile' };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed. Please try again.',
          };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            console.error('Profile update error:', error);
            throw error;
          }

          if (data) {
            set({ user: data as User });
          }
        } catch (error) {
          console.error('Profile update error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state check when the store is created
useAuthStore.getState().checkAuth();

// Listen for auth state changes from Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    useAuthStore.getState().checkAuth();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  } else if (event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().checkAuth();
  }
});

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, AuthState } from '@/types/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Sample team members for authentication (must match projectStore)
const TEAM_MEMBERS: User[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@design.co', role: 'admin', avatarColor: 'bg-emerald-500' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@design.co', role: 'designer', avatarColor: 'bg-pink-400' },
  { id: '3', name: 'James Wilson', email: 'james@design.co', role: 'designer', avatarColor: 'bg-blue-400' },
  { id: '4', name: 'Emma Davis', email: 'emma@design.co', role: 'designer', avatarColor: 'bg-amber-400' },
  { id: '5', name: 'Michael Brown', email: 'michael@design.co', role: 'designer', avatarColor: 'bg-violet-400' },
  { id: '6', name: 'Lisa Johnson', email: 'lisa@design.co', role: 'designer', avatarColor: 'bg-cyan-400' },
  { id: '7', name: 'David Lee', email: 'david@design.co', role: 'designer', avatarColor: 'bg-rose-400' },
  { id: '8', name: 'Anna Martinez', email: 'anna@design.co', role: 'designer', avatarColor: 'bg-teal-400' },
  { id: '9', name: 'Chris Taylor', email: 'chris@design.co', role: 'designer', avatarColor: 'bg-orange-400' },
  { id: '10', name: 'Sophie Anderson', email: 'sophie@design.co', role: 'designer', avatarColor: 'bg-indigo-400' },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });

        try {
          // Simulate API call - in production, this would be a real API endpoint
          const { email, password } = credentials;

          // For demo purposes: validate against hardcoded team members
          const user = TEAM_MEMBERS.find((member) => member.email.toLowerCase() === email.toLowerCase());

          if (!user) {
            set({ isLoading: false });
            return { success: false, error: 'Invalid email or password' };
          }

          // In production, verify password hash against backend
          // For demo: accept "password123" for all users
          if (password !== 'password123') {
            set({ isLoading: false });
            return { success: false, error: 'Invalid email or password' };
          }

          // Successful login
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Login failed. Please try again.' };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: () => {
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
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

import { TeamMember } from './project';

export interface User extends TeamMember {
  // Extends TeamMember to include all team member properties
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

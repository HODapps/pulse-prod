// Generated Supabase types
// Run: npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
// This file will be generated after Supabase schema is created

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'designer'
          avatar: string | null
          avatar_color: string
          status: 'pending' | 'active' | 'inactive'
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'designer'
          avatar?: string | null
          avatar_color?: string
          status?: 'pending' | 'active' | 'inactive'
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'designer'
          avatar?: string | null
          avatar_color?: string
          status?: 'pending' | 'active' | 'inactive'
          last_active_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      board_settings: {
        Row: {
          id: string
          owner_id: string
          board_name: string
          team_title: string
          project_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          board_name: string
          team_title: string
          project_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          board_name?: string
          team_title?: string
          project_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: 'low' | 'medium' | 'high'
          assignee_id: string | null
          created_by_id: string | null
          start_date: string | null
          due_date: string | null
          sub_tasks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status: string
          priority: 'low' | 'medium' | 'high'
          assignee_id?: string | null
          created_by_id?: string | null
          start_date?: string | null
          due_date?: string | null
          sub_tasks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: 'low' | 'medium' | 'high'
          assignee_id?: string | null
          created_by_id?: string | null
          start_date?: string | null
          due_date?: string | null
          sub_tasks?: Json
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'designer'
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'designer'
          invited_by: string
          token: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'designer'
          invited_by?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

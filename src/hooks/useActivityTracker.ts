import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook to track user activity and update last_active_at timestamp
 * Updates the database every 2 minutes if user is active
 */
export function useActivityTracker() {
  const { user } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    const updateActivity = async () => {
      try {
        await supabase
          .from('users')
          .update({
            last_active_at: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', user.id);

        lastUpdateRef.current = Date.now();
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    };

    // Update immediately on mount
    updateActivity();

    // Set up interval to update every 2 minutes
    intervalRef.current = setInterval(() => {
      updateActivity();
    }, 2 * 60 * 1000); // 2 minutes

    // Track various user interactions
    const handleActivity = () => {
      const now = Date.now();
      // Only update if more than 1 minute has passed since last update
      if (now - lastUpdateRef.current > 60 * 1000) {
        updateActivity();
      }
    };

    // Listen to user interactions
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user]);
}

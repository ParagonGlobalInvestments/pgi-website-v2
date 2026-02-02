import { useState, useEffect } from 'react';
import type { User } from '@/types';

interface UseSupabaseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch the current user's portal profile via /api/users/me.
 * Returns a flat User object matching the new simplified schema.
 */
export function useSupabaseUser(): UseSupabaseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user || null);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}

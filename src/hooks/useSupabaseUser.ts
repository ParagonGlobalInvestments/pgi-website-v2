import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';

interface SupabaseUserData {
  id: string;
  personal_name: string;
  personal_email: string;
  org_permission_level: 'admin' | 'lead' | 'member';
  org_track?: 'quant' | 'value';
  org_chapter_name?: string;
  org_chapter_id?: string;
  org_track_roles: string[];
  org_exec_roles: string[];
  personal_grad_year?: number;
  personal_major?: string;
  personal_bio?: string;
  profile_skills: string[];
  personal_is_alumni: boolean;
}

interface UseSupabaseUserReturn {
  user: SupabaseUserData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch user data directly from Supabase database
 * This is a simpler alternative to useMongoUser that queries Supabase directly
 */
export function useSupabaseUser(): UseSupabaseUserReturn {
  const [user, setUser] = useState<SupabaseUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get authenticated user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setIsLoading(false);
          setUser(null);
          return;
        }

        // Query Supabase database for user data with chapter JOIN
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select(
            `
            id,
            personal_name,
            personal_email,
            org_permission_level,
            org_track,
            org_chapter_id,
            org_track_roles,
            org_exec_roles,
            personal_grad_year,
            personal_major,
            personal_bio,
            profile_skills,
            personal_is_alumni,
            chapters:org_chapter_id (
              name
            )
          `
          )
          .eq('system_supabase_id', authUser.id)
          .maybeSingle();

        if (dbError || !userData) {
          console.error('Error fetching user from database:', dbError);
          setError('Failed to load user data');
          setUser(null);
        } else {
          // Add chapter name from the JOIN
          const formattedUserData = {
            ...userData,
            org_chapter_name: userData.chapters?.name || null,
          };
          setUser(formattedUserData);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error in useSupabaseUser:', err);
        setError(err.message || 'An error occurred');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, isLoading, error };
}

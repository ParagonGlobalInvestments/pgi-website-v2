'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserTrack } from '@/lib/auth';
import { createClient } from '@/lib/supabase/browser';

interface ProtectedPageProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredTrack?: UserTrack | UserTrack[];
  redirectTo?: string;
}

export default function ProtectedPage({
  children,
  requiredRole,
  requiredTrack,
  redirectTo = '/portal/dashboard',
}: ProtectedPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          // Middleware will handle redirect to sign-in
          setIsLoading(false);
          return;
        }

        // Query Supabase database for user's role and track
        const { data: pgiUser, error: dbError } = await supabase
          .from('users')
          .select('org_permission_level, org_track')
          .eq('system_supabase_id', user.id)
          .single();

        if (dbError || !pgiUser) {
          console.error('User not found in PGI database:', dbError);
          setIsLoading(false);
          return;
        }

        const userRole = pgiUser.org_permission_level || 'member';
        const userTrack = pgiUser.org_track || 'value';

        // Check role requirement
        let hasRequiredRole = true;
        if (requiredRole) {
          const roles = Array.isArray(requiredRole)
            ? requiredRole
            : [requiredRole];
          hasRequiredRole = roles.includes(userRole) || userRole === 'admin';
        }

        // Check track requirement
        let hasRequiredTrack = true;
        if (requiredTrack) {
          const tracks = Array.isArray(requiredTrack)
            ? requiredTrack
            : [requiredTrack];
          hasRequiredTrack =
            tracks.includes(userTrack) ||
            userRole === 'admin' ||
            userRole === 'lead';
        }

        // Redirect if not authorized
        if (!hasRequiredRole || !hasRequiredTrack) {
          router.push(redirectTo);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authorization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [supabase, requiredRole, requiredTrack, redirectTo, router]);

  // Show loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Don't render until authorized
  if (!isAuthorized) return null;

  return <>{children}</>;
}

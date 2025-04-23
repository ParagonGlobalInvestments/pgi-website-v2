"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole, UserTrack } from "@/lib/auth";

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
  redirectTo = "/portal/dashboard",
}: ProtectedPageProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // If the user isn't signed in, redirect to sign-in
    if (!user) {
      router.push("/portal/signin");
      return;
    }

    // Get user's role and track from metadata
    const userRole = (user.publicMetadata?.role as UserRole) || "member";
    const userTrack = (user.publicMetadata?.track as UserTrack) || "value";

    // Check role-based access
    let hasRequiredRole = true;
    if (requiredRole) {
      if (Array.isArray(requiredRole)) {
        hasRequiredRole = requiredRole.includes(userRole);
      } else {
        hasRequiredRole = userRole === requiredRole;
      }

      // Admin role has access to everything
      if (userRole === "admin") {
        hasRequiredRole = true;
      }
    }

    // Check track-based access
    let hasRequiredTrack = true;
    if (requiredTrack) {
      if (Array.isArray(requiredTrack)) {
        hasRequiredTrack = requiredTrack.includes(userTrack);
      } else {
        hasRequiredTrack =
          userTrack === requiredTrack || requiredTrack === "both";
      }

      // Admin and lead roles can see all tracks
      if (userRole === "admin" || userRole === "lead") {
        hasRequiredTrack = true;
      }
    }

    // Redirect if the user doesn't have the required role or track
    if (!hasRequiredRole || !hasRequiredTrack) {
      router.push(redirectTo);
      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [isLoaded, user, requiredRole, requiredTrack, redirectTo, router]);

  // Show loading state if not loaded or while checking authorization
  if (!isLoaded || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
}

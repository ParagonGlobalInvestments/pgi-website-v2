import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

interface MongoUserChapter {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

interface MongoUser {
  id: string;
  personal: {
    name: string;
    email: string;
    bio?: string;
    major?: string;
    gradYear: number;
    isAlumni: boolean;
    phone?: string;
  };
  org: {
    chapter?: MongoUserChapter;
    permissionLevel: 'admin' | 'lead' | 'member';
    track?: 'quant' | 'value';
    trackRoles: string[];
    execRoles: string[];
    joinDate?: string;
    status: 'active' | 'inactive' | 'pending';
  };
  profile: {
    skills: string[];
    projects?: Array<{
      title: string;
      description?: string;
      link?: string;
      githubLink?: string;
      type: 'value' | 'quant' | 'other';
      startDate?: string;
      endDate?: string;
      inProgress?: boolean;
      collaborators?: string[];
      tags?: string[];
      imageUrl?: string;
    }>;
    experiences?: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    linkedin?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    github?: string;
    interests?: string[];
    achievements?: string[];
  };
  activity: {
    lastLogin?: string;
    internshipsPosted: number;
  };
  system: {
    firstLogin: boolean;
    notifications?: {
      email: boolean;
      platform: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Updated interface for user data update requests
interface UpdateUserData {
  personal?: {
    bio?: string;
    major?: string;
    gradYear?: number;
    phone?: string;
  };
  profile?: {
    skills?: string[];
    linkedin?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    github?: string;
    interests?: string[];
    achievements?: string[];
    experiences?: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    projects?: Array<{
      title: string;
      description?: string;
      link?: string;
      githubLink?: string;
      type: 'value' | 'quant' | 'other';
      startDate?: string;
      endDate?: string;
      inProgress?: boolean;
      collaborators?: string[];
      tags?: string[];
      imageUrl?: string;
    }>;
  };
  system?: {
    firstLogin?: boolean;
    notifications?: {
      email?: boolean;
      platform?: boolean;
    };
  };
}

/**
 * Hook return value interface
 */
interface UseMongoUserReturn {
  /** MongoDB user data */
  user: MongoUser | null;
  /** Whether the MongoDB user data is being loaded */
  isLoading: boolean;
  /** Error that occurred during the fetch, if any */
  error: string | null;
  /** Function to update user data */
  updateUser: (updateData: UpdateUserData) => Promise<boolean>;
  /** Function to sync user data */
  syncUser: (userData?: UpdateUserData) => Promise<boolean>;
}

/**
 * Custom hook to fetch and interact with the MongoDB user data
 *
 * This hook manages the connection between Clerk authentication
 * and our MongoDB user records. It fetches the MongoDB user data
 * corresponding to the currently authenticated Clerk user.
 *
 * @returns {UseMongoUserReturn} The MongoDB user data, loading state, error state, and sync function
 */
export function useMongoUser(): UseMongoUserReturn {
  const { isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState<MongoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track sync attempts to prevent infinite loops
  const syncAttempted = useRef(false);

  // Initial fetch of user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !isSignedIn) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user data from MongoDB through our API
        const response = await fetch('/api/users/me');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          // Reset sync attempted flag when we successfully get a user
          syncAttempted.current = false;
        } else {
          throw new Error('No user data returned');
        }
      } catch (err: any) {
        console.error('Error fetching MongoDB user:', err);
        setError(err.message || 'Failed to load user data');

        // Only try to sync once to prevent infinite loops
        if (!syncAttempted.current) {
          syncAttempted.current = true;
          try {
            console.log('Attempting to sync user...');
            const syncResponse = await fetch('/api/users/sync');
            if (syncResponse.ok) {
              // Try fetching user data again
              const retryResponse = await fetch('/api/users/me');
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (retryData.success && retryData.user) {
                  setUser(retryData.user);
                  setError(null);
                }
              }
            }
          } catch (syncErr) {
            console.error('Error syncing user data:', syncErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, isSignedIn]);

  // Function to update user data
  const updateUser = async (updateData: UpdateUserData) => {
    if (!isSignedIn || !user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user data');
      }

      // Fetch updated user data
      const updatedResponse = await fetch('/api/users/me');
      const updatedData = await updatedResponse.json();

      if (updatedData.success && updatedData.user) {
        setUser(updatedData.user);
      }

      return true;
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sync user data
  const syncUser = async (userData?: UpdateUserData) => {
    if (!isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      syncAttempted.current = true;

      let response;
      if (userData) {
        // API expects flattened structure, so map the nested fields appropriately
        const syncData: Record<string, any> = {};

        // Map personal data
        if (userData.personal) {
          if (userData.personal.bio !== undefined)
            syncData.bio = userData.personal.bio;
          if (userData.personal.major !== undefined)
            syncData.major = userData.personal.major;
          if (userData.personal.gradYear !== undefined)
            syncData.gradYear = userData.personal.gradYear;
          if (userData.personal.phone !== undefined)
            syncData.phone = userData.personal.phone;
        }

        // Map profile data
        if (userData.profile) {
          if (userData.profile.skills !== undefined)
            syncData.skills = userData.profile.skills;
          if (userData.profile.linkedin !== undefined)
            syncData.linkedin = userData.profile.linkedin;
          if (userData.profile.resumeUrl !== undefined)
            syncData.resumeUrl = userData.profile.resumeUrl;
          if (userData.profile.avatarUrl !== undefined)
            syncData.avatarUrl = userData.profile.avatarUrl;
          if (userData.profile.github !== undefined)
            syncData.github = userData.profile.github;
          if (userData.profile.interests !== undefined)
            syncData.interests = userData.profile.interests;
          if (userData.profile.achievements !== undefined)
            syncData.achievements = userData.profile.achievements;
          if (userData.profile.experiences)
            syncData.experiences = userData.profile.experiences;
          if (userData.profile.projects)
            syncData.projects = userData.profile.projects;
        }

        // Map system data
        if (userData.system) {
          if (userData.system.firstLogin !== undefined)
            syncData.firstLogin = userData.system.firstLogin;
        }

        response = await fetch('/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncData),
        });
      } else {
        response = await fetch('/api/users/sync');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync user data');
      }

      // Fetch updated user data
      const updatedResponse = await fetch('/api/users/me');
      const updatedData = await updatedResponse.json();

      if (updatedData.success && updatedData.user) {
        setUser(updatedData.user);
      }

      return true;
    } catch (err: any) {
      console.error('Error syncing user:', err);
      setError(err.message || 'Failed to sync user data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    updateUser,
    syncUser,
  };
}

// Helper function for duplicate email handling - simplified
export async function handleDuplicateEmail() {
  console.log('Duplicate email handling with new user model structure');
  return true;
}

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

interface MongoUserChapter {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

interface MongoUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "lead" | "member";
  track: "quant" | "value" | "both";
  chapter: MongoUserChapter | null;
  isManager: boolean;
  isAlumni: boolean;
  gradYear: number;
  skills: string[];
  bio: string;
  linkedin: string;
  resumeUrl: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateUserData {
  bio?: string;
  skills?: string[];
  gradYear?: number;
  linkedin?: string;
  resumeUrl?: string;
  avatarUrl?: string;
}

export function useMongoUser() {
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
        const response = await fetch("/api/users/me");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          // Reset sync attempted flag when we successfully get a user
          syncAttempted.current = false;
        } else {
          throw new Error("No user data returned");
        }
      } catch (err: any) {
        console.error("Error fetching MongoDB user:", err);
        setError(err.message || "Failed to load user data");

        // Only try to sync once to prevent infinite loops
        if (!syncAttempted.current) {
          syncAttempted.current = true;
          try {
            console.log("Attempting to sync user...");
            const syncResponse = await fetch("/api/users/sync");
            if (syncResponse.ok) {
              // Try fetching user data again
              const retryResponse = await fetch("/api/users/me");
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (retryData.success && retryData.user) {
                  setUser(retryData.user);
                  setError(null);
                }
              }
            }
          } catch (syncErr) {
            console.error("Error syncing user data:", syncErr);
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
      throw new Error("User not authenticated");
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user data");
      }

      // Fetch updated user data
      const updatedResponse = await fetch("/api/users/me");
      const updatedData = await updatedResponse.json();

      if (updatedData.success && updatedData.user) {
        setUser(updatedData.user);
      }

      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user data");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sync user data
  const syncUser = async (userData?: UpdateUserData) => {
    if (!isSignedIn) {
      throw new Error("User not authenticated");
    }

    try {
      setIsLoading(true);
      syncAttempted.current = true;

      let response;
      if (userData) {
        response = await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } else {
        response = await fetch("/api/users/sync");
      }

      if (!response.ok) {
        const errorData = await response.json();

        // Check if error is a duplicate key error for email
        if (
          errorData.error &&
          errorData.error.includes("duplicate key error") &&
          errorData.error.includes("email")
        ) {
          console.warn(
            "Found duplicate email in database. Attempting to resolve..."
          );

          // Try to resolve the conflict
          await handleDuplicateEmail();

          // Retry the sync
          const retryResponse = await fetch("/api/users/sync");
          if (!retryResponse.ok) {
            throw new Error(
              "Failed to sync user data after resolving duplicate email"
            );
          }
        } else {
          throw new Error(errorData.error || "Failed to sync user data");
        }
      }

      // Fetch updated user data
      const updatedResponse = await fetch("/api/users/me");
      const updatedData = await updatedResponse.json();

      if (updatedData.success && updatedData.user) {
        setUser(updatedData.user);
      }

      return true;
    } catch (err: any) {
      console.error("Error syncing user:", err);
      setError(err.message || "Failed to sync user data");
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

// Standalone function to handle duplicate email issues
export async function handleDuplicateEmail() {
  try {
    const resolveResponse = await fetch("/api/auth/resolve-duplicate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!resolveResponse.ok) {
      console.error(
        "Failed to resolve duplicate email:",
        await resolveResponse.json()
      );
      throw new Error("Failed to resolve duplicate email conflict");
    }

    return await resolveResponse.json();
  } catch (err: any) {
    console.error("Error handling duplicate email:", err);
    throw err;
  }
}

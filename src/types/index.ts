/**
 * Common types used throughout the application
 */

/**
 * User role type
 */
export type UserRole = 'admin' | 'lead' | 'member' | 'alumni';

/**
 * User track type
 */
export type UserTrack = 'value' | 'quant' | 'both' | undefined;

/**
 * Chapter summary interface (used within User object)
 */
export interface ChapterSummary {
  _id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  memberCount?: number; // Kept from original Chapter interface
}

/**
 * User personal information
 */
export interface UserPersonal {
  name: string;
  email: string;
  bio?: string;
  major?: string;
  gradYear?: number;
  isAlumni?: boolean;
  phone?: string;
}

/**
 * User organizational information
 */
export interface UserOrg {
  chapterId?: ChapterSummary | string; // Can be the full object or just the ID string
  permissionLevel: UserRole;
  track?: UserTrack;
  trackRoles?: string[];
  execRoles?: string[];
  status?: 'active' | 'inactive' | 'pending';
  joinDate?: string; // ISO Date string
}

/**
 * User professional experience
 */
export interface UserExperience {
  company: string;
  title: string;
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  current?: boolean;
  description?: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  skills?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Define project structure type
  projects?: any[]; // Define project structure if known, using 'any' for now
  experiences?: UserExperience[];
  linkedin?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  github?: string;
  interests?: string[];
  achievements?: string[];
}

/**
 * User activity information
 */
export interface UserActivity {
  lastLogin: string; // ISO Date string
  internshipsPosted?: number;
}

/**
 * User system notification settings
 */
export interface UserSystemNotifications {
  email: boolean;
  platform: boolean;
}

/**
 * User system information
 */
export interface UserSystem {
  clerkId?: string; // Legacy field, not used in Supabase-only architecture
  supabaseId?: string;
  firstLogin: boolean;
  notifications?: UserSystemNotifications;
}

/**
 * User interface representing the structure of user data
 * as returned by APIs like /api/users/me
 */
export interface User {
  _id: string; // MongoDB ObjectId as string
  personal: UserPersonal;
  org: UserOrg;
  profile: UserProfile;
  activity?: UserActivity; // Marked as optional based on current usage in /api/users/me
  system: UserSystem;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

/**
 * Full Chapter interface (can be used for chapter-specific pages/APIs)
 */
export interface Chapter {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  memberCount?: number;
  // Add other chapter-specific fields if any
}

/**
 * Internship interface
 */
export interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  description: string;
  applicationLink: string;
  requirements: string[];
  tags: string[];
  createdAt: string;
  createdBy: string | User;
}

/**
 * News article interface
 */
export interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
  };
}

/**
 * Pagination params interface
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

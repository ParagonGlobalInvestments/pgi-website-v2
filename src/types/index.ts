/**
 * PGI Portal — Core types
 */

export type UserRole = 'admin' | 'committee' | 'pm' | 'analyst';
export type UserProgram = 'value' | 'quant';
export type UserStatus = 'active' | 'alumni';

export interface UserPreferences {
  openToCoffeeChats?: boolean;
  recruiterSharing?: boolean;
  emailUpdates?: boolean;
  betaTester?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string | null; // null for alumni with no contact on file
  role: UserRole;
  program: UserProgram | null;
  school: string | null; // slug: 'columbia', 'nyu', etc. Null when unknown.
  graduationYear: number | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  status: UserStatus;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  userId: string | null;
  personId: string | null;
  company: string;
  role: string | null;
  startYear: number;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  employmentType: string | null; // 'internship' | 'full-time' | 'part-time' | 'contract'
  location: string | null;
  source: string; // 'manual' | 'linkedin'
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

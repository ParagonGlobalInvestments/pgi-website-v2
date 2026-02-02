/**
 * PGI Portal — Core types
 */

export type UserRole = 'admin' | 'committee' | 'pm' | 'analyst';
export type UserProgram = 'value' | 'quant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  program: UserProgram | null;
  school: string; // slug: 'columbia', 'nyu', etc.
  graduationYear: number | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

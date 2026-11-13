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

/** Alumni directory entry: a user plus their current company, if known */
export interface AlumniUser extends User {
  company: string | null;
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

// ---------------------------------------------------------------------------
// Org chart
// ---------------------------------------------------------------------------

export type OrgSeatSlug =
  | 'ceo'
  | 'cio'
  | 'vp-education'
  | 'cto'
  | 'coo-value'
  | 'coo-quant';

export type PodSeat = 'committee' | 'pm' | 'analyst';

export interface OrgPerson {
  id: string;
  name: string;
  school: string | null; // short chapter label, e.g. 'Columbia'
}

/** A leadership slot on the chart; `people` is empty when vacant. */
export interface OrgSeat {
  slug: OrgSeatSlug;
  title: string;
  people: OrgPerson[];
}

/** A CMS officer whose title doesn't map to a chart slot. */
export interface OrgOfficer extends OrgPerson {
  title: string | null;
}

export interface PodMember {
  id: string;
  seat: PodSeat;
  isNew: boolean;
  person: OrgPerson;
}

export interface Pod {
  id: string;
  program: UserProgram;
  number: number;
  focus: string | null;
  members: PodMember[];
}

export interface OrgChart {
  seats: OrgSeat[];
  otherOfficers: OrgOfficer[];
  pods: Pod[];
}

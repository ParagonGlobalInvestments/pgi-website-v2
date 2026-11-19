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

/**
 * One placement on the roster (a `pod_members` row). A person can hold
 * several, e.g. an ICOMM member who sits on more than one pod.
 */
export interface PodMember {
  id: string;
  /** Null when on the roster but not in a pod. */
  podId: string | null;
  /** Null for people without a user record (stored by sheet name). */
  userId: string | null;
  seat: PodSeat;
  person: OrgPerson;
}

export interface Pod {
  id: string;
  program: UserProgram;
  number: number;
  focus: string | null;
  members: PodMember[];
}

/** The editable part of the org chart. */
export interface PodRoster {
  pods: Pod[];
  /** On the roster but not in a pod yet. */
  unassigned: PodMember[];
}

export interface OrgChart extends PodRoster {
  seats: OrgSeat[];
  otherOfficers: OrgOfficer[];
}

/** Who is viewing the org chart and what they may edit. */
export interface OrgChartViewer {
  /** The viewer's `users.id`; null for allowlist admins without a record. */
  userId: string | null;
  isAdmin: boolean;
}

/** A row of the admin-visible org chart change log. */
export interface PodChange {
  id: string;
  actorName: string;
  action: string;
  summary: string;
  createdAt: string;
}

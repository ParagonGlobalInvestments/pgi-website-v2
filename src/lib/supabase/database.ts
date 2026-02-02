import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/types';

// ---------------------------------------------------------------------------
// DB row → API format
// ---------------------------------------------------------------------------

interface UserRow {
  id: string;
  name: string;
  email: string;
  alternate_emails: string[];
  role: string;
  program: string | null;
  school: string;
  graduation_year: number | null;
  linkedin_url: string | null;
  github_url: string | null;
  supabase_id: string | null;
  created_at: string;
  updated_at: string;
}

function formatUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User['role'],
    program: row.program as User['program'],
    school: row.school,
    graduationYear: row.graduation_year,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

export class SupabaseDatabase {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || requireSupabaseServerClient();
  }

  /** Get all users for the directory, with optional filters */
  async getUsers(filters?: {
    school?: string;
    program?: string;
    role?: string;
    search?: string;
  }): Promise<User[]> {
    let query = this.supabase
      .from('users')
      .select('*')
      .order('school')
      .order('name');

    if (filters?.school) query = query.eq('school', filters.school);
    if (filters?.program) query = query.eq('program', filters.program);
    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(formatUser);
  }

  /** Lookup by Supabase auth ID */
  async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('supabase_id', supabaseId)
      .maybeSingle();

    if (error) throw error;
    return data ? formatUser(data) : null;
  }

  /** Lookup by primary email */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) throw error;
    return data ? formatUser(data) : null;
  }

  /** Lookup by email OR alternate_emails (for dev dual-email login) */
  async getUserByAnyEmail(email: string): Promise<(User & { dbId: string }) | null> {
    const normalized = email.toLowerCase();

    // Check primary email first
    const { data: primary, error: err1 } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();

    if (err1) throw err1;
    if (primary) return { ...formatUser(primary), dbId: primary.id };

    // Check alternate_emails array
    const { data: alt, error: err2 } = await this.supabase
      .from('users')
      .select('*')
      .contains('alternate_emails', [normalized])
      .maybeSingle();

    if (err2) throw err2;
    if (alt) return { ...formatUser(alt), dbId: alt.id };

    return null;
  }

  /** Update editable profile fields (name, linkedin_url, github_url) */
  async updateUserProfile(
    userId: string,
    updates: { name?: string; linkedin_url?: string; github_url?: string }
  ): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return formatUser(data);
  }

  /** Link a Supabase auth ID to an existing user row */
  async linkSupabaseId(userId: string, supabaseId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ supabase_id: supabaseId })
      .eq('id', userId);

    if (error) throw error;
  }
}

export function createDatabase(supabase?: SupabaseClient) {
  return new SupabaseDatabase(supabase);
}

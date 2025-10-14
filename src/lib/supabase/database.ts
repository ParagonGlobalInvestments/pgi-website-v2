import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Types matching our Supabase schema
export interface Chapter {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  leaders: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  personal_name: string;
  personal_email: string;
  personal_bio?: string;
  personal_major?: string;
  personal_grad_year: number;
  personal_is_alumni: boolean;
  personal_phone?: string;
  org_chapter_id?: string;
  org_permission_level: 'admin' | 'lead' | 'member';
  org_track?: 'quant' | 'value';
  org_track_roles: string[];
  org_exec_roles: string[];
  org_join_date?: string;
  org_status: 'active' | 'inactive' | 'pending';
  profile_skills: string[];
  profile_projects: any[];
  profile_experiences: any[];
  profile_linkedin?: string;
  profile_resume_url?: string;
  profile_avatar_url?: string;
  profile_github?: string;
  profile_interests: string[];
  profile_achievements: string[];
  activity_last_login?: string;
  activity_internships_posted: number;
  system_clerk_id?: string;
  system_supabase_id?: string;
  system_first_login: boolean;
  system_notifications_email: boolean;
  system_notifications_platform: boolean;
  created_at: string;
  updated_at: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  application_link: string;
  application_url?: string;
  deadline?: string;
  track: 'quant' | 'value' | 'both';
  chapter: string;
  school_targets: string[];
  created_by: string;
  is_paid: boolean;
  is_remote: boolean;
  is_closed: boolean;
  poster_url?: string;
  company_logo_url?: string;
  thread_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Pitch {
  id: string;
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
  exchange?: 'NASDAQ' | 'NYSE';
  excel_model_path?: string;
  pdf_report_path?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

// Formatted user type for API responses (matches the MongoDB format)
export interface FormattedUser {
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
    chapter?: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string;
    };
    permissionLevel: 'admin' | 'lead' | 'member';
    track?: 'quant' | 'value';
    trackRoles: string[];
    execRoles: string[];
    joinDate?: string;
    status: 'active' | 'inactive' | 'pending';
  };
  profile: {
    skills: string[];
    projects: any[];
    experiences: any[];
    linkedin?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    github?: string;
    interests: string[];
    achievements: string[];
  };
  activity: {
    lastLogin?: string;
    internshipsPosted: number;
  };
  system: {
    firstLogin: boolean;
    notifications: {
      email: boolean;
      platform: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Database operations using Supabase
 */
export class SupabaseDatabase {
  private supabase: SupabaseClient;

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient();
  }

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  /**
   * Get user by Supabase ID
   */
  async getUserBySupabaseId(supabaseId: string): Promise<FormattedUser | null> {
    try {
      // Direct query to bypass RLS issues temporarily
      const { data, error } = await this.supabase
        .from('users')
        .select(
          `
          id,
          personal_name,
          personal_email,
          personal_bio,
          personal_major,
          personal_grad_year,
          personal_is_alumni,
          personal_phone,
          org_chapter_id,
          org_permission_level,
          org_track,
          org_track_roles,
          org_exec_roles,
          org_join_date,
          org_status,
          profile_skills,
          profile_projects,
          profile_experiences,
          profile_linkedin,
          profile_resume_url,
          profile_avatar_url,
          profile_github,
          profile_interests,
          profile_achievements,
          activity_last_login,
          activity_internships_posted,
          system_first_login,
          system_notifications_email,
          system_notifications_platform,
          created_at,
          updated_at,
          chapters!org_chapter_id(
            id,
            name,
            slug,
            logo_url
          )
        `
        )
        .eq('system_supabase_id', supabaseId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      if (!data) return null;

      // Format the data to match our FormattedUser interface
      return this.formatUser(data);
    } catch (error) {
      console.error('Error fetching user by Supabase ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<FormattedUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select(
          `
          *,
          chapters:org_chapter_id (
            id,
            name,
            slug,
            logo_url
          )
        `
        )
        .eq('personal_email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return this.formatUser(data);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<FormattedUser> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select(
          `
          *,
          chapters:org_chapter_id (
            id,
            name,
            slug,
            logo_url
          )
        `
        )
        .single();

      if (error) throw error;

      return this.formatUser(data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<FormattedUser> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select(
          `
          *,
          chapters:org_chapter_id (
            id,
            name,
            slug,
            logo_url
          )
        `
        )
        .single();

      if (error) throw error;

      return this.formatUser(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats() {
    try {
      const { data, error } = await this.supabase
        .from('user_stats')
        .select('*')
        .single();

      if (error) throw error;

      return {
        totalMembers: data.total_members,
        totalChapters: data.total_chapters,
        currentStudents: data.current_students,
        alumni: data.alumni,
        admins: data.admins,
        leads: data.leads,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Get all users with optional filtering
   */
  async getUsers(filters?: {
    chapterId?: string;
    permissionLevel?: string;
    track?: string;
    isAlumni?: boolean;
  }): Promise<FormattedUser[]> {
    try {
      let query = this.supabase.from('users').select(`
          *,
          chapters:org_chapter_id (
            id,
            name,
            slug,
            logo_url
          )
        `);

      if (filters?.chapterId) {
        query = query.eq('org_chapter_id', filters.chapterId);
      }
      if (filters?.permissionLevel) {
        query = query.eq('org_permission_level', filters.permissionLevel);
      }
      if (filters?.track) {
        query = query.eq('org_track', filters.track);
      }
      if (filters?.isAlumni !== undefined) {
        query = query.eq('personal_is_alumni', filters.isAlumni);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(user => this.formatUser(user));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // =====================================================
  // CHAPTER OPERATIONS
  // =====================================================

  /**
   * Get all chapters
   */
  async getChapters(): Promise<Chapter[]> {
    try {
      const { data, error } = await this.supabase
        .from('chapters')
        .select('*')
        .order('name');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  /**
   * Get chapter by name
   */
  async getChapterByName(name: string): Promise<Chapter | null> {
    try {
      const { data, error } = await this.supabase
        .from('chapters')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching chapter by name:', error);
      throw error;
    }
  }

  // =====================================================
  // INTERNSHIP OPERATIONS
  // =====================================================

  /**
   * Get all internships
   */
  async getInternships(filters?: {
    track?: string;
    chapter?: string;
    isClosed?: boolean;
  }): Promise<Internship[]> {
    try {
      let query = this.supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.track) {
        query = query.eq('track', filters.track);
      }
      if (filters?.chapter) {
        query = query.eq('chapter', filters.chapter);
      }
      if (filters?.isClosed !== undefined) {
        query = query.eq('is_closed', filters.isClosed);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  }

  /**
   * Create internship
   */
  async createInternship(
    internshipData: Partial<Internship>
  ): Promise<Internship> {
    try {
      const { data, error } = await this.supabase
        .from('internships')
        .insert(internshipData)
        .select('*')
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  }

  /**
   * Get internship stats
   */
  async getInternshipStats() {
    try {
      const { data, error } = await this.supabase
        .from('internship_stats')
        .select('*')
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching internship stats:', error);
      throw error;
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Format user data from Supabase to match MongoDB format
   */
  private formatUser(user: any): FormattedUser {
    return {
      id: user.id,
      personal: {
        name: user.personal_name,
        email: user.personal_email,
        bio: user.personal_bio || '',
        major: user.personal_major || '',
        gradYear: user.personal_grad_year,
        isAlumni: user.personal_is_alumni,
        phone: user.personal_phone || '',
      },
      org: {
        chapter: user.chapters
          ? {
              id: user.chapters.id,
              name: user.chapters.name,
              slug: user.chapters.slug,
              logoUrl: user.chapters.logo_url,
            }
          : undefined,
        permissionLevel: user.org_permission_level,
        track: user.org_track,
        trackRoles: user.org_track_roles || [],
        execRoles: user.org_exec_roles || [],
        joinDate: user.org_join_date,
        status: user.org_status,
      },
      profile: {
        skills: user.profile_skills || [],
        projects: user.profile_projects || [],
        experiences: user.profile_experiences || [],
        linkedin: user.profile_linkedin || '',
        resumeUrl: user.profile_resume_url || '',
        avatarUrl: user.profile_avatar_url || '',
        github: user.profile_github || '',
        interests: user.profile_interests || [],
        achievements: user.profile_achievements || [],
      },
      activity: {
        lastLogin: user.activity_last_login,
        internshipsPosted: user.activity_internships_posted || 0,
      },
      system: {
        firstLogin: user.system_first_login,
        notifications: {
          email: user.system_notifications_email,
          platform: user.system_notifications_platform,
        },
      },
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

// Export a function that creates a new instance with the current request context
export function createDatabase() {
  return new SupabaseDatabase();
}

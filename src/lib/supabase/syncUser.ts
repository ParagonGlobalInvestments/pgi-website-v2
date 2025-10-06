import { createClient } from '@/lib/supabase/server';
import { createDatabase, FormattedUser } from './database';

// Valid chapter names from our database
const VALID_CHAPTERS = [
  'Princeton University',
  'Brown University',
  'Columbia University',
  'Yale University',
  'University of Pennsylvania',
  'New York University',
  'University of Chicago',
  'Cornell University',
];

// Map common incorrect chapter names to valid chapters
const CHAPTER_NAME_MAP: Record<string, string> = {
  'New York': 'New York University',
  NYU: 'New York University',
  Penn: 'University of Pennsylvania',
  UPenn: 'University of Pennsylvania',
  Princeton: 'Princeton University',
  Brown: 'Brown University',
  Columbia: 'Columbia University',
  Yale: 'Yale University',
  Chicago: 'University of Chicago',
  Cornell: 'Cornell University',
};

// Track which chapters we've already remapped to avoid redundant console logs
const remappedChapterLogs = new Set<string>();

interface SyncUserOptions {
  bio?: string;
  skills?: string[];
  gradYear?: number;
  linkedin?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  github?: string;
  major?: string;
  trackRoles?: string[];
  track?: string;
  chapterName?: string;
  isAlumni?: boolean;
  phone?: string;
  experiences?: Array<{
    company: string;
    title: string;
    startDate: Date;
    endDate?: Date;
    current?: boolean;
    description?: string;
  }>;
  interests?: string[];
  achievements?: string[];
  firstLogin?: boolean;
}

/**
 * Syncs a Supabase user with our users table
 * Creates a new user if one doesn't exist
 */
export async function syncUserWithSupabase(
  options: SyncUserOptions = {}
): Promise<FormattedUser> {
  try {
    // Get the current user from Supabase
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('User not authenticated');
    }

    const email = user.email;
    if (!email) {
      throw new Error('User email not found');
    }

    // Get values from user metadata or options
    let track = user.user_metadata?.track || options.track;
    const trackRoles = options.trackRoles || [];
    const execRoles = user.user_metadata?.execRoles || [];

    // Validate and remap track if necessary
    if (track === 'both' || (track && !['quant', 'value'].includes(track))) {
      console.warn(
        `Invalid track value "${track}" found in user metadata or options. Defaulting to "quant".`
      );
      track = 'quant'; // Or any other default valid track
    }

    // Get chapter name from metadata (don't set a default)
    let chapterName = user.user_metadata?.chapter || options.chapterName;
    let chapter = null;

    // Only process chapter if one is specified
    if (chapterName) {
      const originalChapterName = chapterName;

      // Check if chapter name needs to be remapped
      if (
        !VALID_CHAPTERS.includes(chapterName) &&
        CHAPTER_NAME_MAP[chapterName]
      ) {
        chapterName = CHAPTER_NAME_MAP[chapterName];

        // Only log the remapping once per chapter to avoid spam
        const logKey = `${originalChapterName}-${chapterName}`;
        if (!remappedChapterLogs.has(logKey)) {
          console.log(
            `Remapped chapter name from "${originalChapterName}" to "${chapterName}"`
          );
          remappedChapterLogs.add(logKey);
        }
      }

      // Find the chapter for the user's chapter
      const db = createDatabase();
      chapter = await db.getChapterByName(chapterName);
    }

    // Default graduation year if none is provided
    const defaultGradYear = new Date().getFullYear() + 1;
    const gradYear = options.gradYear || defaultGradYear;

    // Default values for isAlumni based on graduation year
    const isAlumni =
      options.isAlumni !== undefined
        ? options.isAlumni
        : user.user_metadata?.isAlumni || new Date().getFullYear() > gradYear;

    // Check if user already exists by supabaseId or email
    const db = createDatabase();
    let existingUser = await db.getUserBySupabaseId(user.id);
    if (!existingUser) {
      existingUser = await db.getUserByEmail(email);
    }

    // Log chapter, track and trackRoles for debugging
    console.log(
      `Chapter info - Name: ${chapterName}, Found: ${
        chapter ? 'Yes' : 'No'
      }, ID: ${chapter?.id}`
    );
    console.log(`Track: ${track}, TrackRoles: ${JSON.stringify(trackRoles)}`);

    if (existingUser) {
      // Update existing user
      const updates: any = {
        activity_last_login: new Date().toISOString(),
      };

      // Update personal information
      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Unknown User';

      if (existingUser.personal.name !== fullName) {
        updates.personal_name = fullName;
      }

      if (existingUser.personal.email !== email) {
        updates.personal_email = email;
      }

      if (
        options.gradYear &&
        existingUser.personal.gradYear !== options.gradYear
      ) {
        updates.personal_grad_year = options.gradYear;
      }

      if (
        options.bio !== undefined &&
        existingUser.personal.bio !== options.bio
      ) {
        updates.personal_bio = options.bio;
      }

      if (
        options.major !== undefined &&
        existingUser.personal.major !== options.major
      ) {
        updates.personal_major = options.major;
      }

      if (
        options.phone !== undefined &&
        existingUser.personal.phone !== options.phone
      ) {
        updates.personal_phone = options.phone;
      }

      if (
        isAlumni !== undefined &&
        existingUser.personal.isAlumni !== isAlumni
      ) {
        updates.personal_is_alumni = isAlumni;
      }

      // Update organization information
      if (chapter && existingUser.org.chapter?.id !== chapter.id) {
        console.log(
          `Updating chapter from ${existingUser.org.chapter?.id} to ${chapter.id}`
        );
        updates.org_chapter_id = chapter.id;
      } else if (chapterName && !chapter) {
        console.log(
          `Warning: Chapter name ${chapterName} specified but not found in database`
        );
      }

      if (track && existingUser.org.track !== track) {
        console.log(
          `Updating track from ${existingUser.org.track} to ${track}`
        );
        updates.org_track = track;
      }

      if (
        trackRoles &&
        trackRoles.length > 0 &&
        JSON.stringify(existingUser.org.trackRoles) !==
          JSON.stringify(trackRoles)
      ) {
        console.log(
          `Updating trackRoles from ${JSON.stringify(existingUser.org.trackRoles)} to ${JSON.stringify(trackRoles)}`
        );
        updates.org_track_roles = trackRoles;
      }

      if (
        execRoles &&
        execRoles.length > 0 &&
        JSON.stringify(existingUser.org.execRoles) !== JSON.stringify(execRoles)
      ) {
        updates.org_exec_roles = execRoles;
      }

      // Update profile information
      if (options.skills && options.skills.length > 0) {
        updates.profile_skills = options.skills;
      }

      if (
        options.linkedin !== undefined &&
        existingUser.profile.linkedin !== options.linkedin
      ) {
        updates.profile_linkedin = options.linkedin;
      }

      if (
        options.resumeUrl !== undefined &&
        existingUser.profile.resumeUrl !== options.resumeUrl
      ) {
        updates.profile_resume_url = options.resumeUrl;
      }

      if (options.avatarUrl !== undefined) {
        updates.profile_avatar_url =
          options.avatarUrl || user.user_metadata?.avatar_url;
      }

      if (
        options.github !== undefined &&
        existingUser.profile.github !== options.github
      ) {
        updates.profile_github = options.github;
      }

      if (options.interests && options.interests.length > 0) {
        updates.profile_interests = options.interests;
      }

      if (options.achievements && options.achievements.length > 0) {
        updates.profile_achievements = options.achievements;
      }

      if (options.experiences && options.experiences.length > 0) {
        updates.profile_experiences = options.experiences;
      }

      // Update system information
      if (options.firstLogin !== undefined) {
        updates.system_first_login = options.firstLogin;
        console.log(`Updated firstLogin to ${options.firstLogin}`);
      }

      // Only update if we have changes
      if (Object.keys(updates).length > 1) {
        // More than just last_login
        const updatedUser = await db.updateUser(existingUser.id, updates);
        console.log(`User ${updatedUser.id} updated successfully`);
        return updatedUser;
      }

      return existingUser;
    } else {
      // Create new user with required fields
      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Unknown User';

      const userData = {
        personal_name: fullName,
        personal_email: email,
        personal_grad_year: gradYear,
        personal_is_alumni: isAlumni || false,
        personal_bio: options.bio || '',
        personal_major: options.major || '',
        personal_phone: options.phone || '',

        org_chapter_id: chapter ? chapter.id : undefined,
        org_permission_level: 'member' as const, // Will be set by trigger
        org_track: track as 'quant' | 'value' | undefined,
        org_track_roles: trackRoles || [],
        org_exec_roles: execRoles || [],
        org_status: 'active' as const,
        org_join_date: new Date().toISOString(),

        profile_skills: options.skills || [],
        profile_projects: [],
        profile_experiences: options.experiences || [],
        profile_linkedin: options.linkedin || '',
        profile_resume_url: options.resumeUrl || '',
        profile_avatar_url:
          options.avatarUrl || user.user_metadata?.avatar_url || '',
        profile_github: options.github || '',
        profile_interests: options.interests || [],
        profile_achievements: options.achievements || [],

        activity_last_login: new Date().toISOString(),
        activity_internships_posted: 0,

        system_supabase_id: user.id,
        system_first_login:
          options.firstLogin !== undefined ? options.firstLogin : true,
        system_notifications_email: true,
        system_notifications_platform: true,
      };

      const newUser = await db.createUser(userData);
      console.log(`New user ${newUser.id} created successfully`);
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    throw error;
  }
}

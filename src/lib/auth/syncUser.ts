import { createClient } from '@/lib/supabase/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Chapter from '@/lib/database/models/Chapter';

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
 * Syncs a Clerk user with MongoDB user collection
 * Creates a new user if one doesn't exist
 */
export async function syncUserWithMongoDB(options: SyncUserOptions = {}) {
  try {
    await connectToDatabase();

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

      // Find the chapter ID for the user's chapter
      chapter = await Chapter.findOne({ name: chapterName });
    }

    // Default graduation year if none is provided
    const defaultGradYear = new Date().getFullYear() + 1;
    const gradYear = options.gradYear || defaultGradYear;

    // Default values for isAlumni based on graduation year
    const isAlumni =
      options.isAlumni !== undefined
        ? options.isAlumni
        : user.user_metadata?.isAlumni || new Date().getFullYear() > gradYear;

    // Check if user already exists in MongoDB by supabaseId or email
    let mongoUser = await User.findOne({
      $or: [{ 'system.supabaseId': user.id }, { 'personal.email': email }],
    });

    // Log chapter, track and trackRoles for debugging
    console.log(
      `Chapter info - Name: ${chapterName}, Found: ${
        chapter ? 'Yes' : 'No'
      }, ID: ${chapter?._id}`
    );
    console.log(`Track: ${track}, TrackRoles: ${JSON.stringify(trackRoles)}`);

    if (mongoUser) {
      // If user exists but has a different supabaseId, update it
      if (mongoUser.system.supabaseId !== user.id) {
        console.log(
          `Updating supabaseId from ${mongoUser.system.supabaseId} to ${user.id}`
        );
        mongoUser.system.supabaseId = user.id;
      }

      // Update existing user
      // Only update fields if they've changed to reduce DB operations
      let hasChanges = false;

      // Update personal information
      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Unknown User';
      if (mongoUser.personal.name !== fullName) {
        mongoUser.personal.name = fullName;
        hasChanges = true;
      }

      if (mongoUser.personal.email !== email) {
        mongoUser.personal.email = email;
        hasChanges = true;
      }

      if (
        options.gradYear &&
        mongoUser.personal.gradYear !== options.gradYear
      ) {
        mongoUser.personal.gradYear = options.gradYear;
        hasChanges = true;
      }

      if (options.bio !== undefined && mongoUser.personal.bio !== options.bio) {
        mongoUser.personal.bio = options.bio;
        hasChanges = true;
      }

      if (
        options.major !== undefined &&
        mongoUser.personal.major !== options.major
      ) {
        mongoUser.personal.major = options.major;
        hasChanges = true;
      }

      if (
        options.phone !== undefined &&
        mongoUser.personal.phone !== options.phone
      ) {
        mongoUser.personal.phone = options.phone;
        hasChanges = true;
      }

      if (isAlumni !== undefined && mongoUser.personal.isAlumni !== isAlumni) {
        mongoUser.personal.isAlumni = isAlumni;
        hasChanges = true;
      }

      // Update organization information
      if (
        chapter &&
        (!mongoUser.org.chapterId ||
          !mongoUser.org.chapterId.equals(chapter._id))
      ) {
        console.log(
          `Updating chapter from ${mongoUser.org.chapterId} to ${chapter._id}`
        );
        mongoUser.org.chapterId = chapter._id;
        hasChanges = true;
      } else if (chapterName && !chapter) {
        console.log(
          `Warning: Chapter name ${chapterName} specified but not found in database`
        );
      }

      if (track && mongoUser.org.track !== track) {
        console.log(`Updating track from ${mongoUser.org.track} to ${track}`);
        mongoUser.org.track = track as 'quant' | 'value';
        hasChanges = true;
      }

      if (
        trackRoles &&
        trackRoles.length > 0 &&
        JSON.stringify(mongoUser.org.trackRoles) !== JSON.stringify(trackRoles)
      ) {
        console.log(
          `Updating trackRoles from ${JSON.stringify(
            mongoUser.org.trackRoles
          )} to ${JSON.stringify(trackRoles)}`
        );
        mongoUser.org.trackRoles = trackRoles;
        hasChanges = true;
      }

      if (
        execRoles &&
        execRoles.length > 0 &&
        JSON.stringify(mongoUser.org.execRoles) !== JSON.stringify(execRoles)
      ) {
        mongoUser.org.execRoles = execRoles;
        hasChanges = true;
      }

      // Update profile information
      if (options.skills && options.skills.length > 0) {
        mongoUser.profile.skills = options.skills;
        hasChanges = true;
      }

      if (
        options.linkedin !== undefined &&
        mongoUser.profile.linkedin !== options.linkedin
      ) {
        mongoUser.profile.linkedin = options.linkedin;
        hasChanges = true;
      }

      if (
        options.resumeUrl !== undefined &&
        mongoUser.profile.resumeUrl !== options.resumeUrl
      ) {
        mongoUser.profile.resumeUrl = options.resumeUrl;
        hasChanges = true;
      }

      if (options.avatarUrl !== undefined) {
        mongoUser.profile.avatarUrl =
          options.avatarUrl || user.user_metadata?.avatar_url;
        hasChanges = true;
      }

      if (
        options.github !== undefined &&
        mongoUser.profile.github !== options.github
      ) {
        mongoUser.profile.github = options.github;
        hasChanges = true;
      }

      if (options.interests && options.interests.length > 0) {
        mongoUser.profile.interests = options.interests;
        hasChanges = true;
      }

      if (options.achievements && options.achievements.length > 0) {
        mongoUser.profile.achievements = options.achievements;
        hasChanges = true;
      }

      if (options.experiences && options.experiences.length > 0) {
        mongoUser.profile.experiences = options.experiences;
        hasChanges = true;
      }

      // Update activity information
      mongoUser.activity.lastLogin = new Date();
      hasChanges = true;

      // Update system information
      if (options.firstLogin !== undefined) {
        mongoUser.system.firstLogin = options.firstLogin;
        hasChanges = true;
        console.log(`Updated firstLogin to ${options.firstLogin}`);
      }

      // Only save if changes were made
      if (hasChanges) {
        await mongoUser.save();
        console.log(`User ${mongoUser._id} updated successfully`);
      }

      return mongoUser;
    } else {
      // Create new user with required fields
      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Unknown User';
      const userData = {
        personal: {
          name: fullName,
          email,
          gradYear,
          isAlumni: isAlumni || false,
          bio: options.bio || '',
          major: options.major || '',
          phone: options.phone || '',
        },
        org: {
          permissionLevel: 'member', // Will be set by pre-save hook
          trackRoles: trackRoles || [],
          execRoles: execRoles || [],
          status: 'active' as 'active' | 'inactive' | 'pending',
          joinDate: new Date(),
          track: track as 'quant' | 'value' | undefined,
          chapterId: chapter ? chapter._id : undefined,
        },
        profile: {
          skills: options.skills || [],
          linkedin: options.linkedin || '',
          resumeUrl: options.resumeUrl || '',
          avatarUrl: options.avatarUrl || user.user_metadata?.avatar_url,
          github: options.github || '',
          interests: options.interests || [],
          achievements: options.achievements || [],
          experiences: options.experiences || [],
        },
        activity: {
          lastLogin: new Date(),
          internshipsPosted: 0,
        },
        system: {
          supabaseId: user.id,
          firstLogin:
            options.firstLogin !== undefined ? options.firstLogin : true,
          notifications: {
            email: true,
            platform: true,
          },
        },
      };

      const newUser = await User.create(userData);
      console.log(`New user ${newUser._id} created successfully`);
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user with MongoDB:', error);
    throw error;
  }
}

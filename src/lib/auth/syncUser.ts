import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/database/mongodb";
import User from "@/lib/database/models/User";
import Chapter from "@/lib/database/models/Chapter";

// Valid chapter names from our database
const VALID_CHAPTERS = [
  "Princeton University",
  "Brown University",
  "Columbia University",
  "Yale University",
  "University of Pennsylvania",
  "New York University",
  "University of Chicago",
  "Cornell University",
];

// Map common incorrect chapter names to valid chapters
const CHAPTER_NAME_MAP: Record<string, string> = {
  "New York": "New York University",
  NYU: "New York University",
  Penn: "University of Pennsylvania",
  UPenn: "University of Pennsylvania",
  Princeton: "Princeton University",
  Brown: "Brown University",
  Columbia: "Columbia University",
  Yale: "Yale University",
  Chicago: "University of Chicago",
  Cornell: "Cornell University",
};

// Track which chapters we've already remapped to avoid redundant console logs
const remappedChapterLogs = new Set<string>();

interface SyncUserOptions {
  gradYear?: number;
  skills?: string[];
  bio?: string;
  linkedin?: string;
  resumeUrl?: string;
  avatarUrl?: string;
}

/**
 * Syncs a Clerk user with MongoDB user collection
 * Creates a new user if one doesn't exist
 */
export async function syncUserWithMongoDB(options: SyncUserOptions = {}) {
  try {
    await connectDB();

    // Get the current user from Clerk
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Find the user's primary email
    const email = user.emailAddresses.find(
      (email: any) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      throw new Error("User email not found");
    }

    // Get or set default values from metadata
    const role = (user.publicMetadata.role as string) || "member";
    let track = (user.publicMetadata.track as string) || "value";

    // Validate track - ensure it's one of the allowed values
    if (!["quant", "value", "both"].includes(track)) {
      console.warn(`Invalid track value: ${track}, defaulting to "value"`);
      track = "value";
    }

    // Get chapter name from metadata and normalize
    let chapterName =
      (user.publicMetadata.chapter as string) || "Yale University";

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

    const isManager = (user.publicMetadata.isManager as boolean) || false;
    const isAlumni = (user.publicMetadata.isAlumni as boolean) || false;

    // Find the chapter ID for the user's chapter
    let chapter = await Chapter.findOne({ name: chapterName });

    // If chapter not found, fallback to a default chapter
    if (!chapter) {
      // Only log once per session
      if (!remappedChapterLogs.has(`fallback-${originalChapterName}`)) {
        console.warn(
          `Chapter not found: ${chapterName}, falling back to default chapter`
        );
        remappedChapterLogs.add(`fallback-${originalChapterName}`);
      }

      // Try to find Yale University as fallback
      chapter = await Chapter.findOne({ name: "Yale University" });

      // If Yale not found, try any chapter
      if (!chapter) {
        chapter = await Chapter.findOne({});

        if (!chapter) {
          throw new Error("No chapters found in the database");
        }
      }

      // Only log once per session
      if (!remappedChapterLogs.has(`using-${chapter.name}`)) {
        console.log(`Using fallback chapter: ${chapter.name}`);
        remappedChapterLogs.add(`using-${chapter.name}`);
      }

      chapterName = chapter.name;
    }

    // Default values for new users
    const defaultGradYear = new Date().getFullYear() + 1;
    const defaultSkills = ["Finance"];

    // Check if user already exists in MongoDB
    let mongoUser = await User.findOne({ clerkId: user.id });

    if (mongoUser) {
      // Update existing user
      // Only update fields if they've changed to reduce DB operations
      let hasChanges = false;

      if (mongoUser.name !== `${user.firstName} ${user.lastName}`) {
        mongoUser.name = `${user.firstName} ${user.lastName}`;
        hasChanges = true;
      }

      if (mongoUser.email !== email) {
        mongoUser.email = email;
        hasChanges = true;
      }

      if (!mongoUser.chapterId.equals(chapter._id)) {
        mongoUser.chapterId = chapter._id;
        hasChanges = true;
      }

      if (mongoUser.role !== role) {
        mongoUser.role = role as "admin" | "lead" | "member";
        hasChanges = true;
      }

      if (mongoUser.track !== track) {
        mongoUser.track = track as "quant" | "value" | "both";
        hasChanges = true;
      }

      if (mongoUser.isManager !== isManager) {
        mongoUser.isManager = isManager;
        hasChanges = true;
      }

      if (mongoUser.isAlumni !== isAlumni) {
        mongoUser.isAlumni = isAlumni;
        hasChanges = true;
      }

      // Update optional fields if provided
      if (options.gradYear && mongoUser.gradYear !== options.gradYear) {
        mongoUser.gradYear = options.gradYear;
        hasChanges = true;
      }

      if (options.skills) {
        mongoUser.skills = options.skills;
        hasChanges = true;
      }

      if (options.bio && mongoUser.bio !== options.bio) {
        mongoUser.bio = options.bio;
        hasChanges = true;
      }

      if (options.linkedin && mongoUser.linkedin !== options.linkedin) {
        mongoUser.linkedin = options.linkedin;
        hasChanges = true;
      }

      if (options.resumeUrl && mongoUser.resumeUrl !== options.resumeUrl) {
        mongoUser.resumeUrl = options.resumeUrl;
        hasChanges = true;
      }

      if (options.avatarUrl && mongoUser.avatarUrl !== options.avatarUrl) {
        mongoUser.avatarUrl = options.avatarUrl || user.imageUrl;
        hasChanges = true;
      }

      // Only save if changes were made
      if (hasChanges) {
        await mongoUser.save();
      }

      return mongoUser;
    } else {
      // Create new user
      const newUser = await User.create({
        name: `${user.firstName} ${user.lastName}`,
        email,
        chapterId: chapter._id,
        role: role as "admin" | "lead" | "member",
        track: track as "quant" | "value" | "both",
        isManager,
        isAlumni,
        gradYear: options.gradYear || defaultGradYear,
        skills: options.skills || defaultSkills,
        bio: options.bio || "",
        linkedin: options.linkedin || "",
        resumeUrl: options.resumeUrl || "",
        avatarUrl: options.avatarUrl || user.imageUrl,
        clerkId: user.id,
      });

      return newUser;
    }
  } catch (error) {
    console.error("Error syncing user with MongoDB:", error);
    throw error;
  }
}

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// Get MongoDB connection string from env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not defined");
  process.exit(1);
}

// Define User schema for the script
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  track: String,
  clerkId: String,
  chapterId: mongoose.Schema.Types.ObjectId,
  isManager: Boolean,
  isAlumni: Boolean,
  gradYear: Number,
  skills: [String],
  bio: String,
});

async function fixDuplicateUser() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // Find users with the specific email
    const userEmail = "ap7564@nyu.edu";
    const users = await User.find({ email: userEmail });

    if (users.length === 0) {
      console.log(`No users found with email: ${userEmail}`);
      return;
    }

    console.log(`Found ${users.length} user(s) with email: ${userEmail}`);

    if (users.length > 1) {
      console.log(
        "Duplicate users found. Will keep the one with a real Clerk ID and remove placeholders."
      );

      // Find if any of the users has a non-placeholder Clerk ID
      const realUser = users.find(
        (user) => !user.clerkId.startsWith("placeholder_")
      );

      if (realUser) {
        console.log("Found a user with a real Clerk ID:", realUser.clerkId);
        console.log("Will keep this user and remove all others");

        // Delete all other users with the same email except the real one
        const deleteResult = await User.deleteMany({
          email: userEmail,
          _id: { $ne: realUser._id },
        });

        console.log(`Deleted ${deleteResult.deletedCount} duplicate users`);
      } else {
        // If all are placeholders, keep the first one
        console.log(
          "All users have placeholder Clerk IDs. Will keep only the first one."
        );
        const firstUser = users[0];

        const deleteResult = await User.deleteMany({
          email: userEmail,
          _id: { $ne: firstUser._id },
        });

        console.log(`Deleted ${deleteResult.deletedCount} duplicate users`);
      }
    } else {
      console.log(
        "Only one user found with this email. No duplicates to remove."
      );
      console.log("User details:", users[0]);
    }
  } catch (error) {
    console.error("Error fixing duplicate user:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixDuplicateUser();

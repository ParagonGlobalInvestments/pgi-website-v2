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
  role: {
    type: String,
    enum: ["admin", "lead", "member"],
    default: "member",
  },
  track: {
    type: String,
    enum: ["quant", "value", "both"],
  },
  clerkId: String,
});

async function updateAdminRole() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // Get the clerkId from command line arguments
    const clerkId = process.argv[2];

    if (!clerkId) {
      console.error("Please provide a Clerk ID as an argument");
      console.log("Usage: node scripts/set-admin-mongodb.js your_clerk_id");
      process.exit(1);
    }

    // Find user by clerkId
    const user = await User.findOne({ clerkId: clerkId });

    if (!user) {
      console.error(`No user found with Clerk ID: ${clerkId}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log("Current role:", user.role);
    console.log("Current track:", user.track);

    // Update the user role and track
    const updateResult = await User.updateOne(
      { clerkId: clerkId },
      {
        $set: {
          role: "admin",
          track: "both",
        },
      }
    );

    if (updateResult.modifiedCount === 1) {
      console.log("✅ Successfully updated user to admin with both tracks");
    } else if (updateResult.matchedCount === 1) {
      console.log("User found but no changes were needed (already admin/both)");
    } else {
      console.log("⚠️ No user was updated");
    }

    // Verify the update
    const updatedUser = await User.findOne({ clerkId: clerkId });
    console.log("Updated role:", updatedUser.role);
    console.log("Updated track:", updatedUser.track);
  } catch (error) {
    console.error("Error updating user role in MongoDB:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

updateAdminRole();

require("dotenv").config({ path: ".env.local" });
const { createClerkClient } = require("@clerk/clerk-sdk-node");

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function updateUserRole() {
  try {
    // Current user email - REPLACE WITH YOUR EMAIL
    const userEmail = process.argv[2]; // Pass email as command line argument

    if (!userEmail) {
      console.error("Please provide an email address as an argument");
      console.log(
        "Usage: node scripts/update-admin-role.js your-email@example.com"
      );
      process.exit(1);
    }

    // Get user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [userEmail],
    });

    if (!users || users.length === 0) {
      console.error(`No user found with email: ${userEmail}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(
      `Found user: ${user.firstName} ${user.lastName} (${userEmail})`
    );
    console.log("Current metadata:", user.publicMetadata);

    // Update user's publicMetadata to set role to admin and track to both
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        role: "admin",
        track: "both",
      },
    });

    console.log("✅ Successfully updated user role to admin and track to both");
    console.log("Please sign out and sign back in to see changes");
  } catch (error) {
    console.error("Error updating user role:", error);
    process.exit(1);
  }
}

updateUserRole();

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
});

async function listAllUsers() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // Find all users
    const users = await User.find({});

    if (users.length === 0) {
      console.log("No users found in the database");
      return;
    }

    console.log(`Found ${users.length} users:`);
    console.log("-----------------------------");

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || "No name"}`);
      console.log(`   Email: ${user.email || "No email"}`);
      console.log(`   Role: ${user.role || "No role"}`);
      console.log(`   Track: ${user.track || "No track"}`);
      console.log(`   ClerkID: ${user.clerkId || "No clerk ID"}`);
      console.log("-----------------------------");
    });
  } catch (error) {
    console.error("Error listing users from MongoDB:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

listAllUsers();

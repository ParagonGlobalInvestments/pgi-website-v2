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
  isManager: Boolean,
});

async function updatePortfolioManagers() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // List of portfolio manager names
    const portfolioManagerNames = [
      "Philip Weaver",
      "Aryaman Rakhecha",
      "Matthew Geiling",
      "Benson Wang",
      "Joshua Donovan",
      "Jack Stemerman",
      "Aetant Prakash",
    ];

    // First, set isManager to false for all users
    const resetResult = await User.updateMany(
      {},
      { $set: { isManager: false } }
    );
    console.log(
      `Reset isManager to false for ${resetResult.modifiedCount} users`
    );

    // Then, set isManager to true for portfolio managers
    const updateResult = await User.updateMany(
      { name: { $in: portfolioManagerNames } },
      { $set: { isManager: true } }
    );

    console.log(
      `Set isManager to true for ${updateResult.modifiedCount} portfolio managers`
    );

    // Verify the updates
    const verifyManagers = await User.find({ isManager: true });
    console.log("\nUsers with isManager = true:");
    verifyManagers.forEach((user) => {
      console.log(`- ${user.name}`);
    });

    // Check for any portfolio managers that weren't found
    const foundManagerNames = verifyManagers.map((user) => user.name);
    const missingManagers = portfolioManagerNames.filter(
      (name) => !foundManagerNames.includes(name)
    );

    if (missingManagers.length > 0) {
      console.warn(
        "\nWarning: Some portfolio managers were not found in the database:"
      );
      missingManagers.forEach((name) => console.warn(`- ${name}`));
    }
  } catch (error) {
    console.error("Error updating portfolio managers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

updatePortfolioManagers();

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

async function updateQuantLeads() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // List of Object IDs to update
    const idsToUpdate = [
      "6809edbf02f5bd505b1ddeae", // Soupy De
      "6809edbf02f5bd505b1ddeaf", // William Vietor
      "6809edbf02f5bd505b1ddeb0", // Samuel Henriques
      "6809edbf02f5bd505b1ddeb1", // Ronak Datta
      "6809edbf02f5bd505b1ddeb2", // Anirudh Pottammal
      "6809edbf02f5bd505b1ddeb3", // Sahishnu Hanumolu
      "6809edbf02f5bd505b1ddeb4", // Dominic Olaguera-Delogu
      "6809edbf02f5bd505b1ddeb5", // Matthew Neissen
      "6809edbf02f5bd505b1ddeb6", // Daniel Siegel
      "6809edbf02f5bd505b1ddeb7", // Ethan Chang
    ];

    // Convert string IDs to ObjectIDs
    const objectIds = idsToUpdate.map((id) => new mongoose.Types.ObjectId(id));

    // Find users to update (verify they exist before updating)
    const usersToUpdate = await User.find({
      _id: { $in: objectIds },
      role: "lead",
      track: "quant",
      isManager: true,
    });

    if (usersToUpdate.length === 0) {
      console.log(
        "No quant lead users found with isManager=true that need updating."
      );
      return;
    }

    console.log(`Found ${usersToUpdate.length} quant lead users to update:`);
    usersToUpdate.forEach((user) => {
      console.log(`- ${user.name} (${user.email})`);
    });

    // Update the users (set isManager to false)
    const updateResult = await User.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isManager: false } }
    );

    console.log(`Updated ${updateResult.modifiedCount} users.`);

    // Verify the update
    const verifiedUsers = await User.find({ _id: { $in: objectIds } });
    const stillManagers = verifiedUsers.filter(
      (user) => user.isManager === true
    );

    if (stillManagers.length > 0) {
      console.warn("Warning: Some users still have isManager=true:");
      stillManagers.forEach((user) => {
        console.warn(`- ${user.name} (${user.email})`);
      });
    } else {
      console.log(
        "All quant lead users now have isManager=false. Update successful!"
      );
    }
  } catch (error) {
    console.error("Error updating quant lead users:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

updateQuantLeads();

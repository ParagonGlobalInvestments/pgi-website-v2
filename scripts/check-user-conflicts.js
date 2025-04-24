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
  createdAt: Date,
  updatedAt: Date,
});

async function checkUserConflicts() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get User model
    const User = mongoose.model("User", UserSchema);

    // Your actual user
    const myEmail = "ap7564@nyu.edu";
    const myUser = await User.findOne({ email: myEmail });

    if (!myUser) {
      console.log(`Warning: Your user with email ${myEmail} was not found.`);
      return;
    }

    console.log("Found your user:", {
      name: myUser.name,
      email: myUser.email,
      role: myUser.role,
      track: myUser.track,
      clerkId: myUser.clerkId,
    });

    // Check for users with similar names
    const similarNameUsers = await User.find({
      name: { $regex: myUser.name.split(" ")[0], $options: "i" }, // Search for first name
      email: { $ne: myEmail }, // Exclude your own email
    });

    if (similarNameUsers.length > 0) {
      console.log(
        `Found ${similarNameUsers.length} users with similar names to yours:`
      );
      similarNameUsers.forEach((user) => {
        console.log({
          name: user.name,
          email: user.email,
          clerkId: user.clerkId,
        });
      });
    } else {
      console.log("No users with similar names found.");
    }

    // Check for users with similar email patterns
    const myEmailUsername = myEmail.split("@")[0];
    const similarEmailUsers = await User.find({
      email: {
        $regex: myEmailUsername,
        $ne: myEmail, // Exclude your own email
      },
    });

    if (similarEmailUsers.length > 0) {
      console.log(
        `Found ${similarEmailUsers.length} users with similar email patterns:`
      );
      similarEmailUsers.forEach((user) => {
        console.log({
          name: user.name,
          email: user.email,
          clerkId: user.clerkId,
        });
      });
    } else {
      console.log("No users with similar email patterns found.");
    }

    // Check for users created around the same time as your user
    if (myUser.createdAt) {
      const minuteBeforeCreation = new Date(myUser.createdAt.getTime() - 60000);
      const minuteAfterCreation = new Date(myUser.createdAt.getTime() + 60000);

      const usersCreatedAroundSameTime = await User.find({
        email: { $ne: myEmail },
        createdAt: {
          $gte: minuteBeforeCreation,
          $lte: minuteAfterCreation,
        },
      });

      if (usersCreatedAroundSameTime.length > 0) {
        console.log(
          `Found ${usersCreatedAroundSameTime.length} users created around the same time as your account:`
        );
        usersCreatedAroundSameTime.forEach((user) => {
          console.log({
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            clerkId: user.clerkId,
          });
        });
      } else {
        console.log("No users created around the same time as your account.");
      }
    }
  } catch (error) {
    console.error("Error checking user conflicts:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkUserConflicts();

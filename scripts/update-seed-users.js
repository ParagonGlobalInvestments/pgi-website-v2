#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Path to the seed-users.ts file
const seedUsersPath = path.join(__dirname, "../src/scripts/seed-users.ts");

// Read the seed-users.ts file
console.log(`Reading ${seedUsersPath}...`);
let seedUsersContent = fs.readFileSync(seedUsersPath, "utf8");

// Function to modify the createUsers function to skip creating users with a specific email
function modifySeedUsers() {
  // Find the position of the createUsers function in the file
  const createUsersFunctionStart = seedUsersContent.indexOf(
    "const createUsers = async"
  );
  if (createUsersFunctionStart === -1) {
    console.error("Could not find createUsers function in seed-users.ts");
    return false;
  }

  // Find where the user creation logic is in the function
  const userCreationStart = seedUsersContent.indexOf(
    "// Generate an email based on name",
    createUsersFunctionStart
  );
  if (userCreationStart === -1) {
    console.error("Could not find email generation in createUsers function");
    return false;
  }

  // Add a check after email generation to skip ap7564@nyu.edu
  const emailGenerationLine = seedUsersContent.indexOf(
    "const email = generateEmail(member.name, member.university);",
    userCreationStart
  );
  if (emailGenerationLine === -1) {
    console.error("Could not find email generation line");
    return false;
  }

  // Find the next line after email generation
  const nextLineAfterEmail =
    seedUsersContent.indexOf("\n", emailGenerationLine) + 1;

  // Insert code to skip creating users with ap7564@nyu.edu
  const skipEmailCheck = `
        // Skip creating user if email matches existing admin
        if (email === 'ap7564@nyu.edu') {
          console.log(\`Skipping creation of user with email \${email}\`);
          continue;
        }
`;

  // Update the content by inserting the check after email generation
  seedUsersContent =
    seedUsersContent.substring(0, nextLineAfterEmail) +
    skipEmailCheck +
    seedUsersContent.substring(nextLineAfterEmail);

  return true;
}

// Run the modification
if (modifySeedUsers()) {
  // Write the updated content back to the file
  fs.writeFileSync(seedUsersPath, seedUsersContent, "utf8");
  console.log(
    "Updated seed-users.ts to skip creating users with email ap7564@nyu.edu"
  );
} else {
  console.error("Failed to update seed-users.ts");
}

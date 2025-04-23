require("dotenv").config({ path: ".env.local" });
const { createClerkClient } = require("@clerk/clerk-sdk-node");
const readline = require("readline");

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Interactive command line interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const VALID_ROLES = ["admin", "lead", "member"];
const VALID_TRACKS = ["quant", "value", "both"];

async function listAllUsers() {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    console.log("\n--- Current Users ---");
    console.log("ID | Name | Email | Role | Track");
    console.log("--------------------------------");

    users.forEach((user, index) => {
      const role = user.publicMetadata?.role || "member";
      const track = user.publicMetadata?.track || "value";
      const email = user.emailAddresses[0]?.emailAddress || "No email";
      const name =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed";

      console.log(`${index + 1}. ${name} | ${email} | ${role} | ${track}`);
    });

    return users;
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
}

async function promptForUserSelection(users) {
  return new Promise((resolve) => {
    rl.question(
      "\nEnter user number to update (or 0 to search by email): ",
      (answer) => {
        const selection = parseInt(answer.trim(), 10);

        if (selection === 0) {
          rl.question("Enter email to search: ", async (email) => {
            const filtered = users.filter((user) =>
              user.emailAddresses.some(
                (addr) =>
                  addr.emailAddress.toLowerCase() === email.toLowerCase()
              )
            );

            if (filtered.length === 0) {
              console.log("No user found with that email.");
              resolve(null);
            } else {
              console.log(
                `Found user: ${filtered[0].firstName} ${filtered[0].lastName}`
              );
              resolve(filtered[0]);
            }
          });
        } else if (selection > 0 && selection <= users.length) {
          resolve(users[selection - 1]);
        } else {
          console.log("Invalid selection");
          resolve(null);
        }
      }
    );
  });
}

async function promptForRoleUpdate(user) {
  return new Promise((resolve) => {
    console.log(
      `\nCurrent role for ${user.firstName} ${user.lastName}: ${
        user.publicMetadata?.role || "member"
      }`
    );
    console.log("Available roles: admin, lead, member");

    rl.question("Set new role (or press enter to keep current): ", (answer) => {
      const role = answer.trim().toLowerCase();

      if (!role) {
        resolve(user.publicMetadata?.role || "member");
      } else if (VALID_ROLES.includes(role)) {
        resolve(role);
      } else {
        console.log("Invalid role. Using current role.");
        resolve(user.publicMetadata?.role || "member");
      }
    });
  });
}

async function promptForTrackUpdate(user) {
  return new Promise((resolve) => {
    console.log(
      `\nCurrent track for ${user.firstName} ${user.lastName}: ${
        user.publicMetadata?.track || "value"
      }`
    );
    console.log("Available tracks: quant, value, both");

    rl.question(
      "Set new track (or press enter to keep current): ",
      (answer) => {
        const track = answer.trim().toLowerCase();

        if (!track) {
          resolve(user.publicMetadata?.track || "value");
        } else if (VALID_TRACKS.includes(track)) {
          resolve(track);
        } else {
          console.log("Invalid track. Using current track.");
          resolve(user.publicMetadata?.track || "value");
        }
      }
    );
  });
}

async function updateUser(user, role, track) {
  try {
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role,
        track,
      },
    });

    console.log(`\n✅ Successfully updated ${user.firstName} ${user.lastName}`);
    console.log(`   New role: ${role}`);
    console.log(`   New track: ${track}`);

    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
}

async function promptForContinue() {
  return new Promise((resolve) => {
    rl.question("\nUpdate another user? (y/n): ", (answer) => {
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  console.log("PGI User Role Manager");
  console.log("====================");

  let continueRunning = true;

  while (continueRunning) {
    const users = await listAllUsers();
    const selectedUser = await promptForUserSelection(users);

    if (selectedUser) {
      const newRole = await promptForRoleUpdate(selectedUser);
      const newTrack = await promptForTrackUpdate(selectedUser);

      await updateUser(selectedUser, newRole, newTrack);
    }

    continueRunning = await promptForContinue();
  }

  console.log("\nThank you for using the PGI User Role Manager");
  rl.close();
  process.exit(0);
}

main();

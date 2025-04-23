require("dotenv").config({ path: ".env.local" });
const { createClerkClient } = require("@clerk/clerk-sdk-node");

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function refreshJWTTemplate() {
  try {
    console.log("Fetching JWT templates...");

    // Get all JWT templates
    const templates = await clerkClient.jwtTemplates.getJWTTemplateList();

    if (!templates || templates.length === 0) {
      console.log("No JWT templates found. Creating a new one...");

      // Create a new template with the required claims
      const newTemplate = await clerkClient.jwtTemplates.createJWTTemplate({
        name: "PGI Portal Template",
        claims: `{
  "role": "{{user.public_metadata.role}}",
  "track": "{{user.public_metadata.track}}",
  "chapter": "{{user.public_metadata.chapter}}",
  "isManager": "{{user.public_metadata.isManager}}",
  "isAlumni": "{{user.public_metadata.isAlumni}}"
}`,
      });

      console.log("Created new JWT template:", newTemplate.name);
    } else {
      // Update the first template
      const template = templates[0];
      console.log("Found JWT template:", template.name);

      const updatedTemplate = await clerkClient.jwtTemplates.updateJWTTemplate(
        template.id,
        {
          claims: `{
  "role": "{{user.public_metadata.role}}",
  "track": "{{user.public_metadata.track}}",
  "chapter": "{{user.public_metadata.chapter}}",
  "isManager": "{{user.public_metadata.isManager}}",
  "isAlumni": "{{user.public_metadata.isAlumni}}"
}`,
        }
      );

      console.log("Updated JWT template:", updatedTemplate.name);
    }

    console.log("✅ JWT template refresh complete!");
  } catch (error) {
    console.error("Error refreshing JWT template:", error);
    process.exit(1);
  }
}

refreshJWTTemplate();

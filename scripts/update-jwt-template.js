require("dotenv").config({ path: ".env.local" });
const axios = require("axios");

async function updateJWTTemplate() {
  try {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

    if (!CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY is not set in .env.local");
      process.exit(1);
    }

    // Extract the Clerk API Key and instance ID from the secret key
    const [key, instanceId] = CLERK_SECRET_KEY.split("_").slice(1);

    // Construct the base URL
    const baseURL = `https://api.clerk.com/v1`;

    // Create axios instance
    const api = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // First, list all JWT templates
    console.log("Fetching JWT templates...");
    const templatesResponse = await api.get("/jwt_templates");
    const templates = templatesResponse.data;

    if (!templates || templates.length === 0) {
      console.log("No JWT templates found. Creating a new one...");

      // Create a new template
      const newTemplateResponse = await api.post("/jwt_templates", {
        name: "PGI User Template",
        claims: {
          role: "{{user.public_metadata.role}}",
          track: "{{user.public_metadata.track}}",
          chapter: "{{user.public_metadata.chapter}}",
          isManager: "{{user.public_metadata.isManager}}",
          isAlumni: "{{user.public_metadata.isAlumni}}",
        },
      });

      console.log("Created new JWT template:", newTemplateResponse.data.name);
    } else {
      // Update the first template
      const template = templates[0];
      console.log("Found JWT template:", template.name);

      const updatedTemplateResponse = await api.patch(
        `/jwt_templates/${template.id}`,
        {
          name: template.name,
          claims: {
            role: "{{user.public_metadata.role}}",
            track: "{{user.public_metadata.track}}",
            chapter: "{{user.public_metadata.chapter}}",
            isManager: "{{user.public_metadata.isManager}}",
            isAlumni: "{{user.public_metadata.isAlumni}}",
          },
        }
      );

      console.log("Updated JWT template:", updatedTemplateResponse.data.name);
    }

    console.log("✅ JWT template updated successfully");
    console.log(
      "You must sign out and sign back in for changes to take effect"
    );
  } catch (error) {
    console.error(
      "Error updating JWT template:",
      error.response?.data || error.message
    );
    process.exit(1);
  }
}

updateJWTTemplate();

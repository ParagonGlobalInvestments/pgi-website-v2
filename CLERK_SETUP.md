# Clerk Setup for PGI Portal

This guide explains how to set up Clerk for the PGI Portal with the necessary JWT claims and user metadata.

## JWT Template Setup

1. Go to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to **JWT Templates** in the sidebar
3. Create a new template or modify the default template
4. Add the following claims to your JWT template:

```json
{
  "role": "{{user.public_metadata.role}}",
  "track": "{{user.public_metadata.track}}",
  "chapter": "{{user.public_metadata.chapter}}",
  "isManager": "{{user.public_metadata.isManager}}",
  "isAlumni": "{{user.public_metadata.isAlumni}}"
}
```

5. Save the template and set it as active

## User Metadata Setup

For each user, you'll need to set their metadata. You can do this in two ways:

### Method 1: Using the Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to **Users** in the sidebar
3. Select a user
4. In the **Metadata** tab, add the following fields to the public metadata:

```json
{
  "role": "member", // Options: "admin", "lead", "member"
  "track": "value", // Options: "quant", "value", "both"
  "chapter": "New York", // Options: "New York", "London", "Hong Kong", etc.
  "isManager": false,
  "isAlumni": false
}
```

### Method 2: Using the Clerk API

You can programmatically update user metadata using the Clerk API. Here's an example:

```typescript
import { clerkClient } from "@clerk/nextjs/server";

// Update user metadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: {
    role: "member",
    track: "value",
    chapter: "New York",
    isManager: false,
    isAlumni: false,
  },
});
```

## Default Roles and Permissions

| Role   | Permissions                              |
| ------ | ---------------------------------------- |
| admin  | Full access to all features              |
| lead   | Can add/edit internships, manage members |
| member | Basic access, restricted by track        |

## Environment Variables

Make sure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Or your production URL
```

## MongoDB Setup

1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Add your MongoDB connection string to your `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
```

3. Create appropriate indexes in MongoDB for performance:

```javascript
db.internships.createIndex({ track: 1, chapter: 1, deadline: 1 });
db.internships.createIndex({ createdAt: -1 });
```

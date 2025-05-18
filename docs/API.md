# PGI API Reference

This document provides details on the API endpoints available in the PGI platform. Most endpoints require authentication via Clerk.

## Authentication

API routes use `getAuth()` or `currentUser()` from `@clerk/nextjs/server` to verify authentication. The user object structure follows the nested format defined in `src/types/index.ts` with properties like `user.personal`, `user.org`, `user.profile`, and `user.system`.

## Users

### GET /api/users/me

Retrieves the current user's profile.

- **Response**: `{ success: true, user: {...} }`
- **Role**: Authenticated user

### PATCH /api/users/me

Updates the current user's profile.

- **Body**: `{ personal: {...}, profile: {...}, system: {...} }`
- **Response**: `{ success: true, message: "User updated successfully" }`
- **Role**: Authenticated user

### GET /api/users

Gets a list of users with optional filtering.

- **Query**: `org.permissionLevel`, `org.track`, `org.chapter.name`, `search`, `limit`, `page`
- **Response**: `{ success: true, users: [...] }`
- **Role**: Authenticated user

### POST /api/users

Creates a new user.

- **Body**: `{ personal: {...}, org: {...}, profile: {...} }`
- **Response**: `{ success: true, message: "User created successfully", user: {...} }`
- **Role**: Admin

### GET /api/users/stats

Gets user statistics.

- **Response**: `{ totalMembers: number, activeMembers: number, byRole: {...} }`
- **Role**: Admin/Lead

### PUT /api/users/[userId]

Updates a specific user.

- **Body**: User field updates
- **Response**: `{ success: true, data: {...} }`
- **Role**: Admin

### DELETE /api/users/[userId]

Deletes a user.

- **Response**: `{ success: true }`
- **Role**: Admin

### POST /api/users/sync

Syncs Clerk user data with MongoDB.

- **Body**: Optional profile fields
- **Response**: `{ success: true, user: {...} }`
- **Role**: Authenticated user

## Chapters

### GET /api/chapters

Gets all chapters.

- **Response**: Array of chapter objects
- **Role**: Authenticated user

### POST /api/chapters

Creates a new chapter.

- **Body**: `{ name: string, slug: string, logoUrl?: string }`
- **Response**: Created chapter object
- **Role**: Admin

## Internships

### GET /api/internships

Gets internship listings with optional filtering.

- **Query**: `track`, `chapter`, `isClosed`, `search`, `limit`, `page`
- **Response**: Array of internship objects
- **Role**: Authenticated user

### POST /api/internships

Creates a new internship listing.

- **Body**: Internship object fields
- **Response**: Created internship object
- **Role**: Admin/Lead

### GET /api/internships/stats

Gets internship statistics.

- **Response**: `{ total: number, byTrack: {...} }`
- **Role**: Authenticated user

## RSS Feeds

### GET /api/rss-items

Gets RSS feed items.

- **Query**: `source` (optional)
- **Response**: Array of RSS item objects
- **Role**: Authenticated user

### POST /api/rss-items/refresh

Manually refreshes an RSS feed.

- **Query**: `source` (optional)
- **Response**: `{ message: string, newItemsCount: number, items: [...] }`
- **Role**: Admin

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": number
}
```

Common status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

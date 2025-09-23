# PGI Resources Page Setup

This document explains how to set up and configure the PGI Resources page with Google OAuth authentication.

## Overview

The Resources page provides secure access to PGI's Drive folder containing educational materials, templates, and research resources. It uses NextAuth for Google OAuth authentication, isolated from the existing Clerk authentication system.

## Google OAuth Setup

### 1. Create Google Cloud OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Go to APIs & Services → Library
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth 2.0 Client ID:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Name: "PGI Resources Page"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/nextauth/callback/google` (development)
     - `https://paragoninvestments.org/api/nextauth/callback/google` (production)
5. Copy the Client ID and Client Secret

### 2. Environment Variables

Add these variables to your `.env.local` file:

```env
# NextAuth for Resources Page (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://paragoninvestments.org
NEXTAUTH_BASE_PATH=/api/nextauth

# PGI Resources Configuration
PGI_REQUIRE_EDU=true
```

#### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Vercel Deployment

For Vercel deployment, add the same environment variables to your project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for both Preview and Production environments

## Configuration Options

### .edu Email Requirement

The page enforces that users must sign in with a `.edu` email address. This can be controlled with:

- `PGI_REQUIRE_EDU=true` - Enforce .edu requirement (default)
- `PGI_REQUIRE_EDU=false` - Allow any Google account

To disable the requirement temporarily, set `PGI_REQUIRE_EDU=false` in your environment variables.

### Drive Folder

The page displays resources from this Google Drive folder:
- Folder ID: `1ArM8sjxfNGaxxTHeTrjd1I-EqJWHvB49`
- URL: https://drive.google.com/drive/folders/1ArM8sjxfNGaxxTHeTrjd1I-EqJWHvB49?usp=drive_link

The page attempts to embed the folder using an iframe. If embedding is blocked by browser security policies, it falls back to a button that opens the folder in a new tab.

## Architecture

### Isolation from Clerk

The Resources page uses NextAuth completely isolated from the existing Clerk authentication:

- NextAuth API routes: `/api/nextauth/*`
- Clerk API routes: `/api/auth/*` (no collision)
- NextAuth only used for this specific page
- No global session providers or conflicts

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── nextauth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   └── resources/
│       ├── layout.tsx                # SessionProvider wrapper
│       └── page.tsx                  # Main resources page
├── middleware.ts                     # Updated to allow /resources and /api/nextauth
└── components/layout/Header.tsx      # Updated About dropdown
```

## Analytics

The page includes PostHog tracking for:

- `resources_cta_clicked` - Sign-in button clicked
- `resources_access_granted` - Successful .edu validation
- `resources_access_denied` - Non-.edu email rejection
- `resources_embed_blocked` - Iframe fallback triggered

## Testing

### Local Development

1. Set up environment variables in `.env.local`
2. Run `npm run dev`
3. Navigate to `/resources`
4. Test with both .edu and non-.edu Google accounts

### Production Testing

1. Deploy with environment variables configured
2. Test sign-in flow with university Google account
3. Verify Drive folder access
4. Test non-.edu account rejection

## Troubleshooting

### Common Issues

1. **"Sign in with Google" not working**
   - Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Verify redirect URIs in Google Cloud Console

2. **"University Email Required" for .edu accounts**
   - Check email format (must end with `.edu`)
   - Verify `PGI_REQUIRE_EDU` setting

3. **Drive folder not loading**
   - Check if iframe is blocked by browser
   - Fallback button should appear automatically
   - Verify folder permissions (should be publicly accessible)

4. **NextAuth errors**
   - Check `NEXTAUTH_SECRET` is set
   - Verify `NEXTAUTH_URL` matches your domain
   - Ensure `/api/nextauth/*` routes are accessible

### Support

For technical issues, check:
- Browser console for JavaScript errors
- Network tab for failed requests
- Vercel function logs for server-side errors

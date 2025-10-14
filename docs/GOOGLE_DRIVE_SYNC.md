# Google Drive Sync Script

This document explains how to use the one-time sync script to download resources from Google Drive.

## Overview

The sync script (`scripts/sync-drive-resources.ts`) downloads files from PGI's Google Drive and organizes them into the `/public/resources/` directory structure for self-hosting on the website.

## Prerequisites

1. **Google Cloud Project with Drive API enabled**
2. **OAuth 2.0 credentials** (credentials.json file)

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Desktop app" as the application type
4. Name it "PGI Drive Sync" or similar
5. Click "Create"
6. Download the credentials JSON file
7. Save it as `credentials.json` in the project root directory

**Important:** Add `credentials.json` to `.gitignore` (it should already be ignored)

### 3. Run the Sync Script

```bash
npx tsx scripts/sync-drive-resources.ts
```

On first run:

- Your browser will open for OAuth authentication
- Sign in with a Google account that has access to the PGI Drive
- Grant the necessary permissions (read-only access to Drive)
- The token will be cached for future runs

### 4. What Gets Downloaded

The script downloads files from three main folders:

**1. Pitches** → `/public/resources/pitches/`

- VALUE team pitches with Excel models and PDF reports
- QUANT team pitches with GitHub repos and PDF reports

**2. Education** → `/public/resources/education/`

- VALUE team educational materials
- QUANT team educational materials

**3. Recruitment Guides** → `/public/resources/recruitment/`

- Investment Banking resources (networking, resumes, technicals, interview questions)
- Quant interview prep materials
- Financial modeling guides

### 5. File Filtering

The script only downloads files with these extensions:

- `.pdf` - PDF documents
- `.xlsx`, `.xls` - Excel spreadsheets
- `.docx`, `.doc` - Word documents

All other file types (PowerPoint, videos, images, etc.) are skipped.

## Output

After successful sync:

- All files are downloaded to `/public/resources/`
- A manifest file is created at `/public/resources/manifest.json` with metadata about each file
- The manifest includes:
  - Drive file ID
  - Local file path
  - File name
  - MIME type
  - Download timestamp

## Manifest Structure

```json
[
  {
    "driveId": "1abc123...",
    "localPath": "pitches/value/AAPL-report.pdf",
    "name": "AAPL-report.pdf",
    "mimeType": "application/pdf",
    "downloadedAt": "2025-10-13T12:00:00.000Z"
  }
]
```

## Re-running the Script

To sync again (e.g., when new files are added to Drive):

```bash
npx tsx scripts/sync-drive-resources.ts
```

The script will:

- Re-download all files (overwrites existing files)
- Update the manifest with new timestamps
- Add any newly added files from Drive

## Troubleshooting

### "credentials.json not found"

- Make sure you've created and downloaded the OAuth credentials
- Place the file in the project root (same level as `package.json`)

### "Authentication failed"

- Delete the cached token (usually in `~/.credentials/`)
- Run the script again to re-authenticate

### "Rate limit exceeded"

- The Drive API has rate limits
- Wait a few minutes and try again
- For large syncs, the script handles this with built-in delays

### "Permission denied"

- Make sure the Google account you're using has read access to the PGI Drive folders
- Contact the Drive owner to grant access if needed

## After Syncing

Once files are synced:

1. **Update pitch entries** in the Supabase `pitches` table with correct file paths
2. **Update resource arrays** in portal pages if hardcoded references need to change:
   - `/src/app/portal/dashboard/education/page.tsx`
   - `/src/app/portal/dashboard/recruitment/page.tsx`
3. **Commit files to git** (they're in `/public/` so they'll be deployed with the site)
4. **Deploy** to Vercel

## Security Notes

- The `credentials.json` file contains sensitive information and should never be committed to git
- The OAuth token gives read-only access to Drive
- Only the specific folders defined in the script are accessed
- The script runs locally on your machine, not in production

## Manual Alternative

If you prefer not to use the script, you can manually:

1. Download files from Google Drive
2. Organize them into `/public/resources/` following the structure
3. Update file paths in the pitch admin interface

The script just automates this process and maintains a manifest for tracking.

# Portal Resources Implementation Summary

This document summarizes the implementation of the three new portal pages (Pitches, Education, Recruitment) and the migration away from Google Drive API integration.

## ✅ What Was Implemented

### 1. Dependencies Installed

- `yahoo-finance2` - For fetching stock performance data
- `googleapis` - For one-time Google Drive sync
- `@google-cloud/local-auth` - For OAuth authentication with Google Drive

### 2. Backend API Routes

#### Stock Performance API

**File:** `/src/app/api/stock/performance/route.ts`

- Fetches historical and current stock prices using Yahoo Finance
- Calculates points change and percentage change from pitch date to current
- Implements in-memory caching (5 minutes) to avoid rate limits
- Returns structured performance data for display

#### Pitches CRUD API

**Files:**

- `/src/app/api/pitches/route.ts` - GET all pitches, POST new pitch
- `/src/app/api/pitches/[id]/route.ts` - GET, PUT, DELETE individual pitch

**Features:**

- Authentication required for all endpoints
- Admin-only access for POST, PUT, DELETE operations
- Filtering by team (value/quant)
- Proper error handling and validation

### 3. Database Schema

#### Supabase Pitches Table

**Type definition:** `/src/lib/supabase/database.ts`

```typescript
export interface Pitch {
  id: string;
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
  excel_model_path?: string;
  pdf_report_path?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}
```

**SQL Migration:** See `/docs/SUPABASE_PITCHES_MIGRATION.md`

### 4. Portal Pages

#### Pitches Page

**File:** `/src/app/portal/dashboard/pitches/page.tsx`

**Features:**

- VALUE/QUANT tabs for filtering
- Desktop: Table view with columns for Ticker, Date Pitched, Live Return
- Mobile: Card view with same information
- Ticker links to Yahoo Finance
- Live stock performance calculated on page load
- Click row/card to navigate to detail view
- Admin button to access management interface

#### Pitch Detail Page

**File:** `/src/app/portal/dashboard/pitches/[id]/page.tsx`

**Features:**

- Header showing ticker, pitch date, and live performance
- Two-column responsive layout
- Left column: Embedded PDF report viewer
- Right column: Embedded Excel model viewer (for VALUE team)
- GitHub repository link (for QUANT team)
- Back button to return to list

#### Pitches Admin Page

**File:** `/src/app/portal/dashboard/pitches/admin/page.tsx`

**Features:**

- Protected route (admin-only access)
- Form to create/edit pitches with validation
- Fields: Ticker, Team, Pitch Date, Excel Model Path, PDF Report Path, GitHub URL
- Table showing all pitches with edit/delete actions
- Delete confirmation dialog
- Real-time updates after CRUD operations

#### Education Page

**File:** `/src/app/portal/dashboard/education/page.tsx`

**Features:**

- VALUE/QUANT tabs
- Grid of educational resource cards
- Each card shows title, description, and action buttons
- View button opens PDF in fullscreen modal dialog
- Download button for offline access
- Currently uses existing lecture PDFs from `/public/lectures/education/`

#### Recruitment Page

**File:** `/src/app/portal/dashboard/recruitment/page.tsx`

**Features:**

- Three main tabs: Investment Banking, Quant, Financial Modeling
- Investment Banking has sub-tabs: Networking, Resumes, Technicals, Interview Q&A
- Resource cards with file type icons (PDF, Excel, Word)
- Download buttons for all files
- Structured to easily add more resources as files are synced

### 5. Navigation Updates

**File:** `/src/app/portal/dashboard/layout.tsx`

Added three new navigation items:

- **Pitches** (FaChartLine icon)
- **Education** (FaGraduationCap icon)
- **Recruitment** (FaUserTie icon)

Updated both desktop and mobile navigation menus with proper active states.

### 6. Google Drive Sync Script

**File:** `/scripts/sync-drive-resources.ts`

**Features:**

- One-time sync from Google Drive folder
- OAuth authentication with Google Drive API
- Downloads files from Pitches, Education, and Recruitment folders
- Organizes into `/public/resources/` structure
- Filters for allowed file types (PDF, Excel, Word only)
- Creates manifest.json with file metadata
- Recursive folder processing
- Proper error handling and logging

**Documentation:** `/docs/GOOGLE_DRIVE_SYNC.md`

### 7. Documentation Created

1. **SUPABASE_PITCHES_MIGRATION.md** - Complete SQL migration with RLS policies
2. **GOOGLE_DRIVE_SYNC.md** - Setup and usage guide for sync script
3. **PORTAL_RESOURCES_IMPLEMENTATION.md** - This file

## 🎯 Next Steps for You

### 1. Run Supabase Migration (REQUIRED)

Go to your Supabase Dashboard SQL Editor and run the migration from:
`/docs/SUPABASE_PITCHES_MIGRATION.md`

**Link:** https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

This creates the `pitches` table with proper RLS policies.

### 2. Sync Google Drive Resources (OPTIONAL)

If you want to use the sync script:

1. **Set up Google Cloud credentials:**

   - Go to https://console.cloud.google.com/
   - Enable Google Drive API
   - Create OAuth 2.0 credentials (Desktop app)
   - Download credentials as `credentials.json` in project root

2. **Run sync script:**

   ```bash
   npx tsx scripts/sync-drive-resources.ts
   ```

3. **Authenticate** when browser opens

4. **Files will be downloaded** to `/public/resources/`

**Alternative:** Manually download files from Google Drive and place them in `/public/resources/` following the structure.

### 3. Add Pitch Data

Once the Supabase table is created:

1. Go to `/portal/dashboard/pitches/admin` (must be logged in as admin)
2. Click "Add Pitch"
3. Fill in the form:
   - Ticker symbol (e.g., "AAPL")
   - Team (VALUE or QUANT)
   - Pitch date
   - File paths (relative to /public, e.g., `/resources/pitches/value/AAPL-report.pdf`)
   - GitHub URL (for quant pitches)
4. Save

### 4. Upload Pitch Files

Place your pitch files in:

- `/public/resources/pitches/value/` - For VALUE team pitches
- `/public/resources/pitches/quant/` - For QUANT team pitches

File naming convention:

- PDFs: `TICKER-report.pdf` (e.g., `AAPL-report.pdf`)
- Excel: `TICKER-model.xlsx` (e.g., `AAPL-model.xlsx`)

### 5. Update Resource Arrays (OPTIONAL)

If you synced files and want to display them:

**Education resources:** Edit `/src/app/portal/dashboard/education/page.tsx`

- Update `educationResources` object with actual file paths and metadata

**Recruitment resources:** Edit `/src/app/portal/dashboard/recruitment/page.tsx`

- Update `recruitmentResources` object with actual file paths and metadata

### 6. Deploy

Commit all changes and deploy to Vercel:

```bash
git add .
git commit -m "Add portal resources pages and remove Google Drive dependency"
git push
```

## 📁 File Structure

```
/public/resources/
├── pitches/
│   ├── value/
│   │   ├── AAPL-report.pdf
│   │   ├── AAPL-model.xlsx
│   │   └── ...
│   └── quant/
│       ├── TSLA-report.pdf
│       └── ...
├── education/
│   ├── value/
│   │   └── ...
│   └── quant/
│       └── ...
├── recruitment/
│   ├── investment-banking/
│   │   ├── networking/
│   │   ├── resumes/
│   │   ├── technicals/
│   │   └── interview-questions/
│   ├── quant/
│   └── financial-modeling/
└── manifest.json
```

## 🔑 Key Features

### Pitches Page

- ✅ Live stock performance tracking
- ✅ VALUE/QUANT team separation
- ✅ Mobile-responsive design
- ✅ Yahoo Finance integration
- ✅ Embedded PDF and Excel viewers
- ✅ Admin management interface

### Education & Recruitment

- ✅ Tabbed navigation
- ✅ PDF preview modals
- ✅ Download functionality
- ✅ File type indicators
- ✅ Organized by team/category

### Security

- ✅ Authentication required for all portal pages
- ✅ Admin-only CRUD operations
- ✅ Supabase Row Level Security policies
- ✅ No Google Drive API scopes needed by users

## 🚫 What's Not Included

- Automatic file uploads through the admin interface (files must be placed in `/public/` manually or via sync script)
- Real-time stock data refresh (uses 5-minute cache)
- Automatic Google Drive syncing (one-time manual sync only)

## 💡 Tips

1. **For best performance:** Upload optimized PDFs (not too large)
2. **Excel models:** Consider converting to PDF for better web viewing
3. **Stock data:** Yahoo Finance is free but has rate limits - the cache helps
4. **Admin access:** Only users with `org_permission_level = 'admin'` in Supabase can manage pitches

## 🐛 Troubleshooting

### "Pitch not found" error

- Make sure you ran the Supabase migration
- Check that pitches exist in the database

### Stock performance shows "N/A"

- Ticker might be invalid or delisted
- Yahoo Finance API might be temporarily unavailable
- Check browser console for errors

### PDF/Excel not displaying

- Verify file path is correct (starts with `/resources/...`)
- Check that file exists in `/public/resources/...`
- Some browsers block iframes - try different browser

### Can't access admin interface

- Check that you're logged in
- Verify your user has `org_permission_level = 'admin'` in Supabase
- Check browser console for errors

## 📞 Support

For issues or questions:

1. Check the documentation files in `/docs/`
2. Review the implementation files
3. Check Supabase logs for database errors
4. Check browser console for frontend errors

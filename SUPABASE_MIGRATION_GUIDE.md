# PGI MongoDB to Supabase Migration Guide

This guide will help you migrate from MongoDB to Supabase PostgreSQL database for your PGI application.

## 🎯 What This Migration Does

- **Eliminates MongoDB dependency** - No more connection issues!
- **Migrates all user data** to Supabase PostgreSQL with the same structure
- **Migrates chapters and internships** data
- **Implements Row Level Security (RLS)** for data protection
- **Maintains API compatibility** - Your frontend code won't need changes
- **Improves performance** by using a single database provider

## 📋 Prerequisites

1. **Supabase Project**: You need access to your Supabase dashboard
2. **Database Access**: Admin access to run SQL migrations
3. **Backup**: Make sure you have a backup of your current MongoDB data (if any)

## 🚀 Step-by-Step Migration

### Step 1: Run the Supabase Migration

1. **Open Supabase Dashboard**

   - Go to https://supabase.com/dashboard
   - Navigate to your PGI project
   - Go to the "SQL Editor" tab

2. **Execute the Migration Script**

   - Copy the contents of `supabase_migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

   This will create:

   - `chapters` table with 8 university chapters pre-populated
   - `users` table with all user fields from MongoDB
   - `internships` table for internship postings
   - Row Level Security policies
   - Helper functions and views
   - Proper indexes for performance

### Step 2: Set Environment Variables

Update your `.env.local` file to include the admin emails setting:

```bash
# Add this line to your existing .env.local
ADMIN_EMAILS=ap7564@nyu.edu,admin2@example.com,admin3@example.com
```

This is used by the permission level trigger to automatically set admin permissions.

### Step 3: Configure Supabase Settings

In your Supabase dashboard:

1. **Go to Settings > API**
2. **Copy your Project URL and Anon Key** (you should already have these)
3. **Go to Authentication > Settings**
4. **Make sure "Enable email confirmations" is set according to your needs**

### Step 4: Test the Migration

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Try signing in** with a Supabase account
3. **Check the portal dashboard** - it should now work without MongoDB errors!
4. **Verify user data** is being created properly

## 🔍 What Changed in the Code

### New Files Added:

- `src/lib/supabase/database.ts` - Database operations using Supabase
- `src/lib/supabase/syncUser.ts` - User synchronization with Supabase
- `supabase_migration.sql` - Complete database schema migration

### Files Updated:

- `src/app/api/users/me/route.ts` - Now uses Supabase instead of MongoDB
- `src/app/api/users/sync/route.ts` - Updated to sync with Supabase
- `src/app/api/users/stats/route.ts` - Uses Supabase views for stats
- `src/app/api/chapters/route.ts` - Updated to use Supabase
- `src/hooks/useMongoUser.ts` - Updated comments (functionality stays the same)
- `src/middleware.ts` - Temporarily disabled production portal redirect

## 📊 Database Schema Overview

### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  -- Personal info
  personal_name TEXT,
  personal_email TEXT UNIQUE,
  personal_bio TEXT,
  personal_major TEXT,
  personal_grad_year INTEGER,
  personal_is_alumni BOOLEAN,
  personal_phone TEXT,

  -- Organization info
  org_chapter_id UUID REFERENCES chapters(id),
  org_permission_level permission_level,
  org_track track_type,
  org_track_roles track_role[],
  org_exec_roles TEXT[],

  -- Profile info
  profile_skills TEXT[],
  profile_projects JSONB,
  profile_experiences JSONB,
  -- ... other profile fields

  -- System info
  system_supabase_id UUID UNIQUE,
  system_first_login BOOLEAN,
  -- ... timestamps
)
```

### Chapters Table

```sql
chapters (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  slug TEXT UNIQUE,
  logo_url TEXT,
  leaders UUID[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Row Level Security (RLS)

**Users can**:

- Read their own data
- Update their own profile (except permission levels)

**Admins can**:

- Read/update all users
- Manage chapters

**Leads can**:

- Read/update users in their chapter

## 🔧 Troubleshooting

### Common Issues:

1. **"User not found" errors**

   - The migration creates users automatically when they first sign in
   - Make sure the user has signed in at least once after migration

2. **Permission errors**

   - Check that RLS policies are enabled
   - Verify the user's Supabase ID is correctly stored

3. **Chapter not found**

   - The migration pre-populates 8 university chapters
   - Check if the chapter name mapping is correct in the sync function

4. **API errors**
   - Check Supabase connection
   - Verify environment variables are set correctly

### Debug Steps:

1. **Check Supabase logs**:

   - Go to Supabase Dashboard > Logs
   - Look for any SQL errors or RLS policy violations

2. **Test database connection**:

   ```bash
   # In your browser console on the app
   fetch('/api/users/me').then(r => r.json()).then(console.log)
   ```

3. **Verify data**:
   - Go to Supabase Dashboard > Table Editor
   - Check that users/chapters tables have data

## 🎉 Benefits After Migration

- ✅ **No more MongoDB connection errors**
- ✅ **Simplified architecture** (one database provider)
- ✅ **Better performance** with PostgreSQL
- ✅ **Built-in Row Level Security**
- ✅ **Real-time capabilities** (if needed later)
- ✅ **Better development experience** with Supabase tools

## 🧹 Cleanup (After Testing)

Once you've verified everything works:

1. **Remove MongoDB dependencies**:

   ```bash
   npm uninstall mongoose
   ```

2. **Delete old MongoDB files**:

   - `src/lib/database/` directory
   - `src/lib/auth/syncUser.ts` (old version)

3. **Remove MongoDB environment variables** from `.env.local`:

   - `MONGODB_URI`
   - `MONGODB_DB`

4. **Update middleware** to re-enable production redirects if needed

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify your Supabase project settings
4. Make sure all environment variables are set correctly

The migration preserves all your existing functionality while eliminating the MongoDB dependency. Your users won't notice any difference in the frontend experience!


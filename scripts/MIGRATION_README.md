# PGI User Email Migration Guide

## Overview

This script migrates PGI member data from the directory sheet into your Supabase `users` table, ensuring accurate email addresses for all members.

## What It Does

1. **Parses** the directory sheet (`emails_copied_directly_from_directory_sheet.txt`)
2. **Matches** directory members with existing Supabase users (fuzzy name matching)
3. **Updates** placeholder emails with real ones
4. **Creates** new user records for members not in the database
5. **Reports** any discrepancies for manual review

## Prerequisites

You need the **Supabase Service Role Key** which has admin permissions:

1. Go to your Supabase project: https://supabase.com/dashboard/project/[your-project]/settings/api
2. Copy the `service_role` key (under "Project API keys")
3. **NEVER** commit this key to git!

## Running the Migration

### Step 1: Set Environment Variables

Create a `.env.local` file if you don't have one, and add:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Make sure your `.env.local` already has:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

### Step 2: Run the Migration

```bash
npm run migrate:emails
```

### Step 3: Review the Output

The script will show:

- ✅ How many users were matched
- 🔄 How many emails were updated
- ➕ How many new users were created
- ⚠️ Users in Supabase not found in directory (needs review)

### Step 4: Check the Report

A detailed JSON report is saved to `scripts/migration-report-[timestamp].json`

## After Migration

1. **Review unmatched users**: Check the report for users in Supabase that weren't in the directory
2. **Verify data**: Go to Supabase dashboard and spot-check some users
3. **Test authentication**: Try signing in with a few different member emails

## Safety Features

- **Fuzzy matching**: Handles name variations (middle names, nicknames, etc.)
- **Dry-run mode**: You can modify the script to preview changes before applying
- **Detailed logging**: Every action is logged for transparency
- **Report generation**: Full audit trail of all changes

## Troubleshooting

### "Missing Supabase credentials"

- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### "Error fetching users"

- Check your service role key is correct
- Verify your Supabase project is active

### "Failed to update [name]"

- Check the error message
- User might have RLS policies blocking updates
- Email might violate unique constraint (duplicate)

## Manual Review Needed

After running the script, review these users:

1. **Unmatched Supabase users**: Users in your database not in the directory

   - Could be test accounts
   - Could be alumni who left
   - Could be name spelling differences

2. **Failed creates/updates**: Check the error messages in the output

## Next Steps

After migration is complete:

1. Update the auth flow to check `/api/users/me` for membership
2. Implement non-member sign-in prevention
3. Test the full authentication flow

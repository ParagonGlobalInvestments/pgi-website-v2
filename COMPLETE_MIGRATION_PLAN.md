# Complete PGI Data Migration & Auth Flow Fix

## 🎯 Overview

This document outlines the **complete solution** to fix your PGI member authentication and establish your Supabase users table as the single source of truth.

## 📊 Current Situation

- **Directory Members**: 127 active members in `emails_copied_directly_from_directory_sheet.txt`
- **Supabase Users**: Unknown count with placeholder emails
- **Problem**: Non-PGI members can sign in and see confusing UI

## 🚀 Solution (2-Phase Approach)

### **Phase 1: Data Migration** ⬅️ START HERE

#### Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/[your-project]/settings/api
2. Copy the `service_role` key (starts with `eyJ...`)
3. Add to `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

#### Step 2: Run the Migration Script

```bash
npm run migrate:emails
```

#### Step 3: Review the Output

The script will tell you:

- ✅ How many users were successfully matched
- 🔄 How many emails were updated from placeholders
- ➕ How many new users were created
- ⚠️ Which Supabase users weren't found in directory

#### Step 4: Manual Review

Check `scripts/migration-report-[timestamp].json` for:

- **Unmatched Supabase users**: May be test accounts or typos
- **Failed operations**: Check error messages

### **Phase 2: Fix Auth Flow** ⬅️ AFTER MIGRATION

Once your Supabase data is clean, we'll implement:

#### 1. Sign-In Flow Updates

- Non-PGI members attempt sign in
- After OAuth callback, check `/api/users/me`
- If not a PGI member → **immediately sign them out**
- Redirect to `/resources?notMember=true`
- Show smooth, professional banner message

#### 2. Banner Message Component

```
"You're not currently a PGI member. Submit your email below to stay
updated or apply for your chapter."
```

- Links to newsletter signup on the same page
- Links to `/apply#interest-form`
- Auto-dismisses after 8-10 seconds
- Smooth fade animations

#### 3. Header Logic Update

Only show "Dashboard" if:

- User is authenticated AND
- User exists in Supabase users table

## 📝 What the Migration Script Does

### Parsing Strategy

The script intelligently parses the directory file by:

- Detecting section headers (Value PM, Quant Analyst, etc.)
- Handling multi-line emails (like Dominic Olaguera-Delogu)
- Extracting: Name, Email, Grad Year, Role, School, Track
- Removing duplicates

### Matching Algorithm

**Fuzzy name matching** handles:

- Middle names/initials
- Name variations
- Typos
- Different formatting

### Data Operations

1. **Match**: Links directory members to Supabase users
2. **Update**: Replaces placeholder emails with real ones
3. **Create**: Adds new user records for missing members
4. **Chapter Assignment**: Automatically assigns based on school

### Safety Features

- Non-destructive (only updates placeholders)
- Full audit trail in JSON report
- Detailed console logging
- Error handling for each operation

## 🔍 Expected Results

### Before Migration

```
Supabase Users: ~100-150 (many with placeholder emails)
Directory Members: 127
Matched: Unknown
```

### After Migration

```
Supabase Users: ~127-150 (all with real emails)
Matched: ~120-127
New Users Created: ~0-30
Needs Review: ~0-10
```

## ⚠️ Important Notes

### Names That Need Attention

The script will flag users that couldn't be auto-matched. Common reasons:

- Significant name spelling differences
- Users in Supabase not in directory (test accounts, alumni)
- Users in directory not in Supabase (brand new members)

### Email Format

All emails will be:

- Lowercase
- Trimmed of whitespace
- Validated (must contain @)
- Unique (constraint enforced)

### Tracks and Roles

The script automatically determines:

- **Track**: From role (Value PM → value, Quant Analyst → quant)
- **Roles**: Added to `org_track_roles` array
- **Chapter**: Mapped from school name

## 🎯 After Migration Checklist

- [ ] Run migration script
- [ ] Review the console output
- [ ] Check the JSON report
- [ ] Manually review unmatched users
- [ ] Verify a few users in Supabase dashboard
- [ ] Test sign-in with a PGI member email
- [ ] Test sign-in with a non-PGI email
- [ ] Commit the report to git (optional)
- [ ] Update auth flow code (Phase 2)

## 🐛 Common Issues & Solutions

### Issue: "Some users couldn't be matched"

**Solution**: Review the names in the report. Might be:

- Different name format (nickname vs full name)
- Spelling variation
- Manual intervention needed

### Issue: "Duplicate email constraint"

**Solution**:

- Check if email already exists in Supabase
- The newer entry will fail (expected behavior)
- Review if it's the same person

### Issue: "No chapter found for school"

**Solution**:

- Check if the chapter exists in `chapters` table
- School name mapping might need updating
- User will be created without chapter_id (can fix later)

## 🔧 Customization

### If You Need to Re-run

The script is **idempotent** - safe to run multiple times:

- Won't duplicate users (email unique constraint)
- Will only update emails that are still placeholders
- Won't overwrite real emails with placeholders

### Dry Run Mode

To preview changes without applying them, comment out the update/insert operations:

```typescript
// const { error } = await supabase.from('users').update(...)
console.log('WOULD UPDATE:', supabase.personal_name, '→', directory.email);
```

## 📞 Need Help?

If you run into issues:

1. Check the console error messages
2. Review the JSON report
3. Check Supabase dashboard for RLS policies
4. Verify your service role key is correct
5. Make sure directory file is in correct location

## ✅ Success Criteria

You'll know migration was successful when:

- All 127 directory members are in Supabase
- No placeholder emails remain
- All PGI members can sign in successfully
- Non-PGI members are properly rejected
- Header shows "Dashboard" only for real members

## 🚀 Ready to Start?

1. Get your service role key
2. Add it to `.env.local`
3. Run: `npm run migrate:emails`
4. Review the output
5. Let me know the results!

After migration completes, we'll implement Phase 2 (auth flow fixes) together.

# Test Users Setup Guide

This guide helps you create test accounts for every role/track combination in your PGI portal.

## 📋 Test User Matrix

| Email                      | Role   | Track | Chapter   | Purpose                        |
| -------------------------- | ------ | ----- | --------- | ------------------------------ |
| `admin-quant@pgitest.com`  | Admin  | Quant | NYU       | Full admin access, quant track |
| `admin-value@pgitest.com`  | Admin  | Value | Princeton | Full admin access, value track |
| `lead-quant@pgitest.com`   | Lead   | Quant | UChicago  | Can post internships, quant    |
| `lead-value@pgitest.com`   | Lead   | Value | Yale      | Can post internships, value    |
| `member-quant@pgitest.com` | Member | Quant | Brown     | Basic member access, quant     |
| `member-value@pgitest.com` | Member | Value | Columbia  | Basic member access, value     |

## 🚀 Setup Instructions

### Method 1: Quick Setup (RECOMMENDED)

1. **Sign up each test user via your app**:

   - Go to your app's sign-up page
   - Create accounts using the emails above (use Google OAuth or manual signup)
   - Use a temporary/test Google account or email forwarding

2. **Run the SQL script**:

   ```bash
   # In Supabase SQL Editor, run:
   cat test-users-setup.sql
   ```

   - This will update the users with correct permissions
   - The SQL uses `ON CONFLICT` to safely update existing users

3. **Verify**:
   ```sql
   SELECT
     personal_name,
     personal_email,
     org_permission_level as role,
     org_track as track,
     c.name as chapter
   FROM users u
   LEFT JOIN chapters c ON u.org_chapter_id = c.id
   WHERE personal_email LIKE '%@pgitest.com';
   ```

### Method 2: Manual Auth User Creation (ADVANCED)

If you want to create users entirely in Supabase:

1. **Create auth users** in Supabase Dashboard:

   - Go to Authentication → Users → Add User
   - Create each user with the emails above
   - Set temporary passwords (you can change later)

2. **Get the auth user IDs**:

   ```sql
   SELECT id, email FROM auth.users WHERE email LIKE '%@pgitest.com';
   ```

3. **Update the SQL script**:

   - Replace `system_supabase_id = NULL` with the actual auth user IDs
   - Run the updated script

4. **Link the accounts**:
   ```sql
   UPDATE users
   SET system_supabase_id = (
     SELECT id FROM auth.users
     WHERE auth.users.email = users.personal_email
   )
   WHERE personal_email LIKE '%@pgitest.com';
   ```

## 🔐 What Each Role Can Do

### Admin (`admin`)

- ✅ View all portal features
- ✅ Post internships
- ✅ View/manage all members in directory
- ✅ Access admin directory page
- ✅ Trigger server-side news refresh
- ✅ View all chapters stats
- ✅ Full dashboard access

### Lead (`lead`)

- ✅ View all portal features
- ✅ Post internships
- ✅ View all members in directory
- ✅ View chapter stats
- ❌ Cannot access admin directory
- ❌ Cannot trigger server-side refresh

### Member (`member`)

- ✅ View portal features
- ✅ View directory (basic)
- ✅ View news feeds
- ❌ Cannot post internships
- ❌ Cannot access admin features
- ❌ Limited stats visibility

## 🎯 Track Differences

### Quant Track

- Sees quant-related internships highlighted
- Assigned to Quantitative Research Committee
- Different dashboard stats emphasis

### Value Track

- Sees value-related internships highlighted
- Assigned to Value Investing Committee
- Different dashboard stats emphasis

## 🧪 Testing Scenarios

### Test 1: Admin Capabilities

1. Sign in as `admin-quant@pgitest.com`
2. Verify you see:
   - "Add New Internship" button
   - Admin directory link
   - All 8 chapters in stats
   - "Refresh From Source" on news feeds

### Test 2: Lead Capabilities

1. Sign in as `lead-quant@pgitest.com`
2. Verify you see:
   - "Add New Internship" button
   - Full directory access
   - ❌ No admin directory link
   - ❌ No "Refresh From Source" button

### Test 3: Member Capabilities

1. Sign in as `member-quant@pgitest.com`
2. Verify you see:
   - ❌ No "Add New Internship" button
   - Basic directory access
   - News feeds
   - Limited stats

### Test 4: Track-Specific Features

1. Sign in as both quant and value users
2. Compare dashboard layouts
3. Check internship filtering
4. Verify track-specific highlights

## 🔄 Switching Between Users

### Using Incognito/Private Windows

- Open a different incognito window for each user
- Sign in with different test accounts
- Compare side-by-side

### Using Browser Profiles

- Create separate browser profiles
- Sign in with one test account per profile
- Easier to switch between users

### Quick Sign Out/In

- Use the portal's sign-out feature
- Sign back in with different test account

## 🧹 Cleanup

To remove all test users:

```sql
-- Delete test users
DELETE FROM users WHERE personal_email LIKE '%@pgitest.com';

-- Also delete from auth (if needed)
DELETE FROM auth.users WHERE email LIKE '%@pgitest.com';
```

## 📊 User Data Reference

Each test user has:

- **Profile Skills**: Relevant to their track
- **Track Roles**: Committee assignments
- **Exec Roles**: Only admins have these
- **Bio**: Describes their test purpose
- **Chapter**: Different university for variety

## 🎨 Visual Indicators

Look for these visual differences:

### Admin Badge

- Sidebar shows "admin" role with crown icon 👑

### Lead Badge

- Sidebar shows "lead" role with star icon ⭐

### Member Badge

- Sidebar shows "member" role with user icon 👤

### Track Colors

- **Quant**: Blue accent colors
- **Value**: Green accent colors

## ⚠️ Important Notes

1. **Don't use these in production**: These are test accounts only
2. **Password security**: Use strong passwords even for test accounts
3. **Email verification**: May need to verify emails depending on Supabase settings
4. **RLS policies**: Ensure your Row Level Security policies allow these users
5. **Initial refresh**: News feeds auto-refresh every 10 minutes

## 🐛 Troubleshooting

### "User not found"

- Make sure auth user was created first
- Check `system_supabase_id` is linked correctly

### "Not authenticated"

- Clear browser cache
- Sign out and back in
- Check Supabase Auth settings

### "Permission denied"

- Verify RLS policies in Supabase
- Check `org_permission_level` is set correctly
- Ensure `org_status = 'active'`

### "Chapter not showing"

- Verify `org_chapter_id` matches a real chapter UUID
- Check the JOIN query works properly

## 📞 Support

If you encounter issues:

1. Check the Supabase logs
2. Verify the SQL ran successfully
3. Check browser console for errors
4. Ensure all migrations are applied

# 🚀 Environment Variables Setup Instructions

## Quick Start - Required Actions

You need to add **3 new environment variables** to your production environment (Vercel, etc.):

### 1. Copy These Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
NEXT_PUBLIC_SHOW_STATS=false
NEXT_PUBLIC_ENABLE_INTERNSHIPS=false
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
```

### 2. Explanation

| Variable                            | Value   | Purpose                                                                           |
| ----------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOW_STATS`            | `false` | Hides dashboard stats (member count, chapter count) in production                 |
| `NEXT_PUBLIC_ENABLE_INTERNSHIPS`    | `false` | Completely hides internships feature (sidebar link, pages, buttons) in production |
| `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES` | `true`  | Keeps admin features enabled (default)                                            |

### 3. Why This Matters

✅ **Development**: All features work automatically (no env vars needed)
✅ **Production**: Only enabled features are visible to members  
✅ **Flexibility**: Enable features later without code changes  
✅ **Safety**: New features stay hidden until ready

---

## What This Controls

### Stats (Hidden in Production)

- ❌ "Available Internships" stat card
- ❌ "Total Members" stat card
- ❌ "Active Chapters" stat card

**Recommendation**: Keep hidden until you're ready to show analytics

### Internships (Hidden in Production)

- ❌ "Internships" sidebar link
- ❌ `/portal/dashboard/internships` page
- ❌ `/portal/dashboard/internships/new` page
- ❌ "Browse Internships" action card
- ❌ "Add New Internship" action card

**Recommendation**: Keep hidden until feature is fully tested

### Admin Features (Always Enabled)

- ✅ Admin directory access
- ✅ Admin controls

**Recommendation**: Keep enabled

---

## Deployment Steps

### For Vercel:

1. **Go to Project Settings**

   ```
   https://vercel.com/your-username/your-project/settings/environment-variables
   ```

2. **Add Each Variable**

   - Click "Add New"
   - Enter variable name (exactly as shown)
   - Enter value (`true` or `false` as string)
   - Select all environments (Production, Preview, Development)
   - Click "Save"

3. **Redeploy**
   - Go to Deployments tab
   - Trigger a new deployment (or push new commit)
   - Variables will take effect on next deploy

### For Other Platforms:

Same process - add the 3 variables to your environment configuration.

---

## Local Development

**No action needed!**

In development mode (`npm run dev`), all features are automatically enabled even without environment variables.

If you want to test production behavior locally:

1. Create `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   NEXT_PUBLIC_SHOW_STATS=false
   NEXT_PUBLIC_ENABLE_INTERNSHIPS=false
   NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
   ```

2. Run production build:
   ```bash
   npm run build
   npm run start
   ```

---

## Enabling Features Later

When you're ready to enable stats or internships in production:

1. **Go to Vercel Environment Variables**
2. **Edit the variable** (e.g., `NEXT_PUBLIC_SHOW_STATS`)
3. **Change value** to `true`
4. **Save** and **redeploy**

That's it! No code changes needed.

---

## Current Production Configuration (December 2025)

For your December launch, use these settings:

```bash
# Core Features (Always Available)
✅ Dashboard
✅ Directory (all members can view)
✅ News Feeds
✅ Profile Editing (members can edit their own)
✅ Settings

# Hidden Until Ready
❌ Stats (NEXT_PUBLIC_SHOW_STATS=false)
❌ Internships (NEXT_PUBLIC_ENABLE_INTERNSHIPS=false)

# Admin Features
✅ Admin Directory (NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true)
```

This gives you a **clean, stable launch** with the ability to enable more features in January 2026 when ready!

---

## Questions?

**Q: What if I forget to set these variables?**  
A: Features will be hidden by default (safe). Stats and internships won't show in production.

**Q: Can I enable just stats but not internships?**  
A: Yes! Set `NEXT_PUBLIC_SHOW_STATS=true` and keep `NEXT_PUBLIC_ENABLE_INTERNSHIPS=false`.

**Q: Will this affect my local development?**  
A: No. Development mode always shows all features.

**Q: Do I need to change any code?**  
A: No. Just set the environment variables and redeploy.

---

## Summary

### ✅ DO NOW:

1. Add 3 environment variables to Vercel
2. Set all to the values shown above
3. Redeploy

### ✅ DO LATER (Jan 2026):

1. Change `NEXT_PUBLIC_SHOW_STATS` to `true`
2. Change `NEXT_PUBLIC_ENABLE_INTERNSHIPS` to `true`
3. Redeploy

That's it! 🎉

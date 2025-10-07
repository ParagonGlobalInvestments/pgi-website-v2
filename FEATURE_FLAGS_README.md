# Feature Flags System

## Overview

This project uses a feature flag system to control what features are visible in different environments. This allows you to:

- **Hide incomplete features in production** without removing code
- **Test features in development** before releasing to members
- **Gradually roll out new features** when ready
- **Quickly disable features** if issues arise

## Environment Variables

Add these to your `.env.local` file:

### Required Variables

```bash
# Supabase Configuration (always required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Feature Flags

```bash
# Show dashboard stats (internships, members, chapters counts)
# Default: false (hidden in production)
# Set to 'true' to enable
NEXT_PUBLIC_SHOW_STATS=false

# Enable internships feature (pages, posting, viewing)
# Default: false (hidden in production)
# Set to 'true' to enable when ready
NEXT_PUBLIC_ENABLE_INTERNSHIPS=false

# Enable admin features (always enabled by default)
# Default: true
# Set to 'false' only for testing
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
```

## How It Works

### Development Mode

In development (`NODE_ENV=development`), features are automatically enabled even if flags are set to `false`. This allows you to test everything locally.

### Production Mode

In production, features are **only shown if explicitly enabled** via environment variables. This ensures nothing incomplete reaches your members.

## Current Feature Flags

### 1. `NEXT_PUBLIC_SHOW_STATS`

**Controls:** Dashboard statistics cards (internships count, members count, chapters count)

**Affects:**

- `/portal/dashboard` - Stats section at top of page

**Recommendation:** Keep `false` until you're ready to show member analytics

---

### 2. `NEXT_PUBLIC_ENABLE_INTERNSHIPS`

**Controls:** Entire internships feature

**Affects:**

- Sidebar navigation link to internships
- `/portal/dashboard/internships` page
- `/portal/dashboard/internships/new` page
- "Browse Internships" action card on dashboard
- "Add New Internship" action card (for admins/leads)
- Internships stat card (when stats are enabled)

**Recommendation:** Keep `false` until internships system is fully tested

---

### 3. `NEXT_PUBLIC_ENABLE_ADMIN_FEATURES`

**Controls:** Admin-only features

**Affects:**

- Admin directory controls
- Advanced admin features

**Recommendation:** Keep `true` (default)

---

## Configuration Examples

### For Local Development

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# These are optional in development - features will be enabled anyway
NEXT_PUBLIC_SHOW_STATS=false
NEXT_PUBLIC_ENABLE_INTERNSHIPS=false
```

### For Production (Current State)

```bash
# .env.local or Vercel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key

# Hide stats and internships until ready
NEXT_PUBLIC_SHOW_STATS=false
NEXT_PUBLIC_ENABLE_INTERNSHIPS=false
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
```

### For Production (After Testing Complete)

```bash
# .env.local or Vercel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key

# Enable features after thorough testing
NEXT_PUBLIC_SHOW_STATS=true
NEXT_PUBLIC_ENABLE_INTERNSHIPS=true
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES=true
```

---

## Deployment Guide

### Vercel Deployment

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_production_key
NEXT_PUBLIC_SHOW_STATS = false
NEXT_PUBLIC_ENABLE_INTERNSHIPS = false
NEXT_PUBLIC_ENABLE_ADMIN_FEATURES = true
```

4. Redeploy your application

### Local Testing

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Set feature flags as desired (or leave unset for development)
4. Run `npm run dev`

---

## Code Usage

### Checking a Feature Flag

```typescript
import { isDevOrEnabled } from '@/lib/featureFlags';

// In your component
{isDevOrEnabled('showStats') && (
  <div>Stats content here</div>
)}

// Or for more complex logic
if (isDevOrEnabled('enableInternships')) {
  // Show internships features
}
```

### Available Flags

```typescript
// From src/lib/featureFlags.ts
featureFlags.showStats; // Dashboard stats
featureFlags.enableInternships; // Internships feature
featureFlags.enableAdminFeatures; // Admin features
featureFlags.isDevelopment; // Auto-detected
```

---

## Troubleshooting

### Features Not Showing in Development

- Make sure `NODE_ENV=development` (automatically set by `npm run dev`)
- Features should work even without environment variables in development

### Features Not Showing in Production

- Check that environment variables are set in Vercel/deployment platform
- Verify variables start with `NEXT_PUBLIC_` (required for client-side access)
- Make sure they're set to `'true'` (string, not boolean)
- Redeploy after changing environment variables

### Features Still Showing After Disabling

- Clear browser cache
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check that you redeployed after changing env vars

---

## Timeline (December 2025 - January 2026)

Based on your production timeline, here's a recommended rollout:

**Phase 1: Launch (December 2025)**

- ✅ Core dashboard features
- ✅ Directory
- ✅ News feeds
- ✅ User profiles
- ❌ Stats (hidden)
- ❌ Internships (hidden)

**Phase 2: After User Feedback (January 2026)**

- Set `NEXT_PUBLIC_SHOW_STATS=true`
- Set `NEXT_PUBLIC_ENABLE_INTERNSHIPS=true` (if tested)

This gives you flexibility to enable features when ready without code changes!

---

## Need Help?

If you need to enable/disable a feature:

1. Update the environment variable in Vercel
2. Redeploy (or wait for auto-deploy)
3. Clear browser cache if needed

No code changes required! 🎉

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
import { checkMembership } from '@/lib/auth/checkMembership';
import { requirePortalEnabledOr404 } from '@/lib/runtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use consolidated membership check (handles supabase_id + email lookup + linking)
    const { user, isMember, isAdminAllowlist } = await checkMembership(
      authUser.email,
      authUser.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: 'User not found — not a PGI member' },
        { status: 404 }
      );
    }

    // Admin allowlist users get a synthetic user object (no database record)
    if (isAdminAllowlist && !user) {
      return NextResponse.json(
        {
          success: true,
          user: {
            id: 'admin-allowlist',
            email: authUser.email,
            name:
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] ||
              'Admin',
            role: 'admin',
            school: null,
          },
        },
        {
          headers: {
            'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, user },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/in\//;
const GITHUB_RE = /^https:\/\/github\.com\//;

export async function PATCH(req: NextRequest) {
  const portalCheck = requirePortalEnabledOr404();
  if (portalCheck) return portalCheck;

  try {
    const supabase = requireSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this is an admin allowlist user (synthetic, no database record)
    const { isAdminAllowlist, user: membershipUser } = await checkMembership(
      authUser.email,
      authUser.id
    );
    if (isAdminAllowlist && !membershipUser) {
      return NextResponse.json(
        { error: 'Admin allowlist accounts cannot update profile settings' },
        { status: 400 }
      );
    }

    const db = createDatabase(requireSupabaseAdminClient());
    const user = await db.getUserBySupabaseId(authUser.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    // Only allow name, linkedinUrl, githubUrl, bio, websiteUrl, preferences
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name;
    }

    if (body.linkedinUrl !== undefined) {
      const url = body.linkedinUrl ? String(body.linkedinUrl).trim() : '';
      if (url && !LINKEDIN_RE.test(url)) {
        return NextResponse.json(
          {
            error:
              'LinkedIn URL must start with https://linkedin.com/in/ or https://www.linkedin.com/in/',
          },
          { status: 400 }
        );
      }
      updates.linkedin_url = url;
    }

    if (body.githubUrl !== undefined) {
      const url = body.githubUrl ? String(body.githubUrl).trim() : '';
      if (url && !GITHUB_RE.test(url)) {
        return NextResponse.json(
          { error: 'GitHub URL must start with https://github.com/' },
          { status: 400 }
        );
      }
      updates.github_url = url;
    }

    if (body.bio !== undefined) {
      const bio = body.bio ? String(body.bio).trim() : null;
      if (bio && bio.length > 200) {
        return NextResponse.json(
          { error: 'Bio must be 200 characters or less' },
          { status: 400 }
        );
      }
      updates.bio = bio;
    }

    if (body.websiteUrl !== undefined) {
      const url = body.websiteUrl ? String(body.websiteUrl).trim() : null;
      if (url && !/^https?:\/\/.+/.test(url)) {
        return NextResponse.json(
          {
            error:
              'Website URL must be a valid URL starting with http:// or https://',
          },
          { status: 400 }
        );
      }
      updates.website_url = url;
    }

    if (
      body.preferences !== undefined &&
      typeof body.preferences === 'object'
    ) {
      updates.preferences = body.preferences;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await db.updateUserProfile(user.id, updates);

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

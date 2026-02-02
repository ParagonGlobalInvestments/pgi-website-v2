import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseServerClient } from '@/lib/supabase/server';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';
import { createDatabase } from '@/lib/supabase/database';
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

    const db = createDatabase();
    let user = await db.getUserBySupabaseId(authUser.id);

    // Fallback: lookup by email and link supabase_id (handles admin users
    // whose supabase_id wasn't linked during an earlier auth flow)
    if (!user && authUser.email) {
      const adminDb = createDatabase(requireSupabaseAdminClient());
      const byEmail = await adminDb.getUserByAnyEmail(authUser.email);
      if (byEmail) {
        const { dbId, ...userData } = byEmail;
        await adminDb.linkSupabaseId(dbId, authUser.id);
        user = userData;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found — not a PGI member' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
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

    const db = createDatabase();
    const user = await db.getUserBySupabaseId(authUser.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    // Only allow name, linkedinUrl, githubUrl
    const updates: Record<string, string> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.linkedinUrl !== undefined) {
      const url = body.linkedinUrl ? String(body.linkedinUrl).trim() : '';
      if (url && !LINKEDIN_RE.test(url)) {
        return NextResponse.json(
          { error: 'LinkedIn URL must start with https://linkedin.com/in/ or https://www.linkedin.com/in/' },
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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await db.updateUserProfile(user.id, updates);

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

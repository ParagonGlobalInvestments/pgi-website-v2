import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDatabase } from '@/lib/supabase/database';

// GET /api/chapters - Get all chapters
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all chapters from Supabase
    const db = createDatabase();
    const chapters = await db.getChapters();

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Create a new chapter (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role via Supabase database
    const db = createDatabase();
    const dbUser = await db.getUserBySupabaseId(user.id);

    if (!dbUser || dbUser.org.permissionLevel !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create chapters' },
        { status: 403 }
      );
    }

    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // For now, just return success - chapter creation can be handled directly in Supabase dashboard
    // This endpoint needs the createChapter method to be implemented in the database class
    return NextResponse.json(
      {
        error: 'Chapter creation not yet implemented - use Supabase dashboard',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating chapter:', error);

    // Check if it's a unique constraint violation
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'A chapter with this name or slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}

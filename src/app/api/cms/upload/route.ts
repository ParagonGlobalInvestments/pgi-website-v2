import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

/**
 * Upload an image to Supabase Storage (cms-assets bucket).
 *
 * POST /api/cms/upload
 * Body: FormData with 'file' field
 * Optional query param: ?folder=sponsors (subfolder in bucket)
 *
 * Returns: { url: string } - public URL of uploaded file
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);

    // Get optional folder from query params
    const folder = req.nextUrl.searchParams.get('folder') || '';
    const filePath = folder
      ? `${folder}/${timestamp}-${randomId}.${ext}`
      : `${timestamp}-${randomId}.${ext}`;

    // Upload to Supabase Storage
    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from('cms-assets')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cms-assets')
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to upload file';
    console.error('Upload error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { requireSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB for documents

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, CSV, TXT',
        },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filePath = `${timestamp}-${randomId}.${ext}`;

    const supabase = requireSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('resources')
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

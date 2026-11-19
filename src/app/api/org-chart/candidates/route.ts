import { NextRequest } from 'next/server';
import { searchCandidates } from '@/lib/org-chart-edit';
import { runRead } from '../_lib';

export const dynamic = 'force-dynamic';

/** Admins: active members not on the org chart whose name matches `?q=`. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  return runRead((db, editor) => searchCandidates(db, editor, q));
}

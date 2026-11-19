import { listChanges } from '@/lib/org-chart-edit';
import { runRead } from '../_lib';

export const dynamic = 'force-dynamic';

/** Admins: recent org chart edits, newest first. */
export async function GET() {
  return runRead((db, editor) => listChanges(db, editor));
}

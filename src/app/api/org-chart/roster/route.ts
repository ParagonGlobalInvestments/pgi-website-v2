import { getPodRoster } from '@/lib/org-chart';
import { runRead } from '../_lib';

export const dynamic = 'force-dynamic';

/** Members: the current pods and people not in a pod. */
export async function GET() {
  return runRead(db => getPodRoster(db));
}

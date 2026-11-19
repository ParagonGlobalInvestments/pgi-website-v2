import { NextRequest } from 'next/server';
import { moveMember } from '@/lib/org-chart-edit';
import type { PodSeat } from '@/types';
import { readBody, runEdit } from '../../_lib';

export const dynamic = 'force-dynamic';

/**
 * Move a roster placement to a pod and seat (`podId: null` = out of every
 * pod). Admins, or pod leaders for analysts in their own pods.
 */
export async function POST(req: NextRequest) {
  const body = await readBody(req);
  return runEdit((db, editor) =>
    moveMember(db, editor, {
      memberId: body.memberId as string,
      podId: (body.podId ?? null) as string | null,
      seat: body.seat as PodSeat,
      copy: body.copy === true,
      index: typeof body.index === 'number' ? body.index : undefined,
    })
  );
}

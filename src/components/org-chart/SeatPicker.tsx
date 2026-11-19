'use client';

import { useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  seatCandidates,
  seatLabel,
  type LeadSeat,
} from '@/lib/org-chart-rules';
import type { Pod, PodMember } from '@/types';
import { useBoard } from './board';

/** Admins: choose who fills a pod's Pod Leader or ICOMM/QCOMM seat. */
export function SeatPicker({
  pod,
  seat,
  holder,
}: {
  pod: Pod;
  seat: LeadSeat;
  holder: PodMember | undefined;
}) {
  const board = useBoard();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const label = seatLabel(seat, pod.program);

  const candidates = useMemo(
    () => (open ? seatCandidates(board.roster, pod, seat) : []),
    [open, board.roster, pod, seat]
  );
  const q = query.trim().toLowerCase();
  const shown = q
    ? candidates.filter(c => c.member.person.name.toLowerCase().includes(q))
    : candidates;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={o => (o ? setOpen(true) : close())}>
      <PopoverTrigger
        className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-navy-accent hover:bg-gray-100"
        aria-label={`${holder ? 'Change' : 'Assign'} ${label} for Pod ${pod.number}`}
      >
        {holder ? 'Change' : 'Assign'}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-white p-0">
        <div className="border-b border-gray-100 p-2">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`${label} for Pod ${pod.number}…`}
            aria-label="Search people"
            className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-navy-accent"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {holder && (
            <li>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  close();
                  // A PM stays in the pod as an analyst; committee members
                  // leave the pod.
                  void board.move(
                    holder,
                    seat === 'pm'
                      ? { podId: pod.id, seat: 'analyst' }
                      : { podId: null, seat: 'analyst' }
                  );
                }}
              >
                Clear seat ({holder.person.name})
              </button>
            </li>
          )}
          {shown.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">No one found</li>
          ) : (
            shown.map(c => (
              <li key={c.member.id}>
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-3 px-3 py-1.5 text-left hover:bg-gray-50"
                  onClick={() => {
                    close();
                    void board.move(
                      c.member,
                      { podId: pod.id, seat },
                      { copy: c.copy }
                    );
                  }}
                >
                  <span className="text-sm text-gray-900">
                    {c.member.person.name}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {c.where}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

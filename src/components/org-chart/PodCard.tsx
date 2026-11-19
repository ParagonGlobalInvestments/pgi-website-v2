'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  LEAD_SEATS,
  POD_FOCUS_MAX_LENGTH,
  isLeadSeat,
  seatLabel,
  type LeadSeat,
} from '@/lib/org-chart-rules';
import type { Pod } from '@/types';
import { DropZone, MemberChip, useBoard } from './board';
import { PersonName } from './PersonName';
import { SeatPicker } from './SeatPicker';

function FocusEditor({ pod }: { pod: Pod }) {
  const board = useBoard();
  const [value, setValue] = useState<string | null>(null);

  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => setValue(pod.focus ?? '')}
        className="group flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
        aria-label={`Edit Pod ${pod.number} focus`}
      >
        {pod.focus ?? <span className="italic text-gray-400">Add focus</span>}
        <Pencil className="h-3 w-3 opacity-50 group-hover:opacity-100" />
      </button>
    );
  }

  const save = async () => {
    const next = value.trim();
    setValue(null);
    if (next !== (pod.focus ?? '')) await board.updateFocus(pod, next);
  };

  return (
    <input
      autoFocus
      value={value}
      maxLength={POD_FOCUS_MAX_LENGTH}
      onChange={e => setValue(e.target.value)}
      onBlur={() => void save()}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') setValue(null);
      }}
      placeholder="Sector or strategy"
      aria-label={`Pod ${pod.number} focus`}
      className="mt-0.5 w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs outline-none focus:border-navy-accent"
    />
  );
}

export function PodCard({ pod }: { pod: Pod }) {
  const board = useBoard();
  const adminEditing = board.editing && board.viewer.isAdmin;

  const analysts = pod.members.filter(m => m.seat === 'analyst');
  // Every seat the program has, plus any odd lead seat already filled.
  const seats: LeadSeat[] = Array.from(
    new Set([
      ...LEAD_SEATS[pod.program],
      ...pod.members.map(m => m.seat).filter(isLeadSeat),
    ])
  );

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Pod {pod.number}</p>
          {adminEditing ? (
            <FocusEditor pod={pod} />
          ) : (
            pod.focus && <p className="text-xs text-gray-500">{pod.focus}</p>
          )}
        </div>
        {adminEditing && (
          <button
            type="button"
            onClick={() => void board.deletePod(pod)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete Pod ${pod.number}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <dl className="space-y-1 border-b border-gray-100 px-4 py-3">
        {seats.map(seat => {
          const holder = pod.members.find(m => m.seat === seat);
          return (
            <DropZone
              key={seat}
              id={`${pod.id}:${seat}`}
              target={{ podId: pod.id, seat }}
              className="-mx-1.5 px-1.5 py-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {seatLabel(seat, pod.program)}
                </dt>
                <dd className="flex min-w-0 items-center justify-end gap-1 text-right">
                  {holder ? (
                    <MemberChip member={holder}>
                      <PersonName person={holder.person} />
                    </MemberChip>
                  ) : (
                    <span className="text-sm italic text-gray-400">
                      Unassigned
                    </span>
                  )}
                  {adminEditing && (
                    <SeatPicker pod={pod} seat={seat} holder={holder} />
                  )}
                </dd>
              </div>
            </DropZone>
          );
        })}
      </dl>

      <DropZone
        id={`${pod.id}:analyst`}
        target={{ podId: pod.id, seat: 'analyst' }}
        className="m-1 px-3 py-2"
      >
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Analysts · {analysts.length}
        </p>
        {analysts.length === 0 ? (
          <p className="text-sm italic text-gray-400">
            {board.editing ? 'Drop people here' : 'None assigned'}
          </p>
        ) : (
          <ul className="space-y-1">
            {analysts.map(m => (
              <li key={m.id}>
                <MemberChip member={m}>
                  <PersonName person={m.person} />
                </MemberChip>
              </li>
            ))}
          </ul>
        )}
      </DropZone>
    </div>
  );
}

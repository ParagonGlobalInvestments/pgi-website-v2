'use client';

import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LOADING, failed, ready, type AsyncState } from '@/lib/async-state';
import type { PodChange } from '@/types';

const LOAD_ERROR = 'Could not load the change log';

const WHEN = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** Admins: recent org chart edits. */
export function ChangeLogDialog() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<AsyncState<PodChange[]>>(LOADING);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/org-chart/changes')
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        setLog(
          json.success ? ready(json.data) : failed(json.error ?? LOAD_ERROR)
        );
      })
      .catch(() => !cancelled && setLog(failed(LOAD_ERROR)));
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          // This button is the only way to open the dialog, so resetting here
          // means every open shows a fresh log.
          setLog(LOADING);
          setOpen(true);
        }}
      >
        <ScrollText className="mr-1.5 h-4 w-4" />
        Change log
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Org chart changes</DialogTitle>
            <DialogDescription>
              The latest 200 edits, newest first.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {log.status === 'error' ? (
              <p className="text-sm text-red-600">{log.message}</p>
            ) : log.status === 'loading' ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : log.data.length === 0 ? (
              <p className="text-sm text-gray-400">No changes yet</p>
            ) : (
              <ol className="divide-y divide-gray-100">
                {log.data.map(c => (
                  <li key={c.id} className="py-2">
                    <p className="text-sm text-gray-900">{c.summary}</p>
                    <p className="text-xs text-gray-500">
                      {c.actorName} ·{' '}
                      <time dateTime={c.createdAt}>
                        {WHEN.format(new Date(c.createdAt))}
                      </time>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

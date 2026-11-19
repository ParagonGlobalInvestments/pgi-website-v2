'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBoard } from './board';

interface Candidate {
  id: string;
  name: string;
  school: string | null;
}

/** Admins: add an active member who isn't on the org chart yet. */
export function AddPersonDialog() {
  const board = useBoard();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/org-chart/candidates?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setResults(json.success ? json.data : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const add = async (c: Candidate) => {
    setAdding(c.id);
    const ok = await board.addMember(c.id);
    setAdding(null);
    if (ok) setResults(r => r?.filter(x => x.id !== c.id) ?? null);
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Add person
      </Button>
      <Dialog
        open={open}
        onOpenChange={o => {
          setOpen(o);
          if (!o) {
            setQuery('');
            setResults(null);
          }
        }}
      >
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to the org chart</DialogTitle>
            <DialogDescription>
              Active members who aren&apos;t on the chart yet. They start in
              &ldquo;Not in a pod yet&rdquo;; drag them into a pod from there.
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search members"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-navy-accent"
          />
          <ul className="max-h-72 overflow-y-auto">
            {results === null || query.trim().length < 2 ? (
              <li className="py-2 text-sm text-gray-400">
                Type at least two letters
              </li>
            ) : results.length === 0 ? (
              <li className="py-2 text-sm text-gray-400">No one found</li>
            ) : (
              results.map(c => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 last:border-0"
                >
                  <span className="text-sm text-gray-900">
                    {c.name}
                    {c.school && (
                      <span className="ml-1.5 text-xs text-gray-500">
                        {c.school}
                      </span>
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="navy"
                    disabled={adding !== null}
                    onClick={() => void add(c)}
                  >
                    {adding === c.id ? 'Adding…' : 'Add'}
                  </Button>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

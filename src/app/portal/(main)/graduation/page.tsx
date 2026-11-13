'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { ROLE_LABELS, SCHOOL_LABELS } from '@/components/portal/constants';
import { usePortalUser } from '@/hooks/usePortalUser';
import {
  GRADUATION_API_PATH,
  GRADUATION_DAY,
  fetchGraduationOverview,
} from '@/lib/graduation';

function GraduationSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-52 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

export default function GraduationPage() {
  const { user: portalUser, isLoading: userLoading } = usePortalUser();
  const isAdmin = portalUser?.role === 'admin';

  const { data, error, isLoading, mutate } = useSWR(
    isAdmin ? GRADUATION_API_PATH : null,
    fetchGraduationOverview,
    { revalidateOnFocus: false }
  );

  // Track deselections so every candidate starts selected.
  const [deselected, setDeselected] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const candidates = useMemo(() => data?.candidates ?? [], [data]);
  const selectedIds = useMemo(
    () => candidates.filter(c => !deselected.has(c.id)).map(c => c.id),
    [candidates, deselected]
  );
  const allSelected =
    candidates.length > 0 && selectedIds.length === candidates.length;
  const hasOlderClasses = candidates.some(
    c => data && c.graduationYear < data.classYear
  );

  if (userLoading) return <GraduationSkeleton />;
  if (!isAdmin)
    return (
      <div className="p-8 text-red-600 font-medium">
        Not authorized. Admin access required.
      </div>
    );

  const toggle = (id: string) =>
    setDeselected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setDeselected(allSelected ? new Set(candidates.map(c => c.id)) : new Set());

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(GRADUATION_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedIds }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to graduate members');
      }
      const { graduated, skipped } = json.data as {
        graduated: number;
        skipped: number;
      };
      toast.success(`Graduated ${plural(graduated, 'member')} to alumni`, {
        description:
          skipped > 0
            ? `${plural(skipped, 'member')} skipped (already alumni or not eligible).`
            : undefined,
      });
      setConfirmOpen(false);
      setDeselected(new Set());
      await mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to graduate members'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const classYear = data?.classYear;

  return (
    <div className="space-y-6 min-w-0">
      <PortalPageHeader
        title="Graduation"
        description={`Move graduated members to alumni. A class counts as graduated after June ${GRADUATION_DAY} of its class year. Alumni drop off the public team pages.`}
      />

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : 'Failed to load graduation list'}
          </CardContent>
        </Card>
      ) : isLoading || !data ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <GraduationCap className="h-10 w-10 text-gray-300" />
            <div>
              <p className="font-medium text-gray-900">
                No one left to graduate
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Every active member is in a class after {classYear}.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Class of {classYear}
                {hasOlderClasses ? ' and earlier' : ''}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedIds.length} of {plural(candidates.length, 'member')}{' '}
                selected. Deselect anyone who should stay active.
              </p>
            </div>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={selectedIds.length === 0}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Graduate {plural(selectedIds.length, 'member')}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      className="h-4 w-4 accent-[#00172B] cursor-pointer"
                      checked={allSelected}
                      ref={el => {
                        if (el)
                          el.indeterminate =
                            selectedIds.length > 0 && !allSelected;
                      }}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="hidden sm:table-cell">School</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map(c => {
                  const checked = !deselected.has(c.id);
                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => toggle(c.id)}
                      className={`cursor-pointer ${checked ? '' : 'opacity-50'}`}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Graduate ${c.name}`}
                          className="h-4 w-4 accent-[#00172B] cursor-pointer"
                          checked={checked}
                          onClick={e => e.stopPropagation()}
                          onChange={() => toggle(c.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.graduationYear}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {c.school ? SCHOOL_LABELS[c.school] || c.school : '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {ROLE_LABELS[c.role] || c.role}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-500">
                        {c.email || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={open => !submitting && setConfirmOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Graduate {plural(selectedIds.length, 'member')}?
            </DialogTitle>
            <DialogDescription>
              Their status changes to alumni and they drop off the public team
              pages. They keep portal access. There is no bulk undo, so check
              the list first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting || selectedIds.length === 0}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

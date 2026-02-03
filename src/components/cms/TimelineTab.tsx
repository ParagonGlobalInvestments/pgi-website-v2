'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import TimelineEventForm from './TimelineEventForm';
import type { CmsTimelineEvent } from '@/lib/cms/types';

export default function TimelineTab() {
  const [events, setEvents] = useState<CmsTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CmsTimelineEvent | undefined>(undefined);
  const [reordering, setReordering] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/timeline');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // Sort by sort_order
      setEvents(data.sort((a: CmsTimelineEvent, b: CmsTimelineEvent) => a.sort_order - b.sort_order));
    } catch {
      toast.error('Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= events.length) return;

    const itemA = events[index];
    const itemB = events[swapIndex];
    const key = `${itemA.id}-${direction}`;
    setReordering(key);

    // Optimistic update
    const updated = [...events];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setEvents(updated);

    try {
      const res = await fetch('/api/cms/timeline/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: itemA.id, sort_order: itemB.sort_order },
            { id: itemB.id, sort_order: itemA.sort_order },
          ],
        }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
    } catch {
      toast.error('Failed to reorder');
      fetchEvents();
    } finally {
      setReordering(null);
    }
  };

  const handleDelete = async (event: CmsTimelineEvent) => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    try {
      const res = await fetch(`/api/cms/timeline/${event.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted');
      fetchEvents();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (event: CmsTimelineEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingEvent(undefined);
    setFormOpen(true);
  };

  const truncate = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">
          No timeline events yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, idx) => (
              <TableRow key={event.id}>
                <TableCell className="text-gray-500">{idx + 1}</TableCell>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(event.event_date)}
                </TableCell>
                <TableCell className="text-gray-600">
                  {truncate(event.description)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === 0 || reordering !== null}
                      onClick={() => handleReorder(idx, 'up')}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === events.length - 1 || reordering !== null}
                      onClick={() => handleReorder(idx, 'down')}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(event)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TimelineEventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        onSaved={() => {
          setFormOpen(false);
          fetchEvents();
        }}
      />
    </div>
  );
}

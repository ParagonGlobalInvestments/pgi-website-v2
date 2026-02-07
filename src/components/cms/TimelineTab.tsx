'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import TimelineEventForm from './TimelineEventForm';
import { SortableRow } from './SortableRow';
import type { CmsTimelineEvent } from '@/lib/cms/types';

export default function TimelineTab() {
  const [events, setEvents] = useState<CmsTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<
    CmsTimelineEvent | undefined
  >(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/timeline');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEvents(
        data.sort(
          (a: CmsTimelineEvent, b: CmsTimelineEvent) =>
            a.sort_order - b.sort_order
        )
      );
    } catch {
      toast.error('Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex(e => e.id === active.id);
    const newIndex = events.findIndex(e => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(events, oldIndex, newIndex);
    setEvents(reordered);

    const items = reordered.map((evt, idx) => ({
      id: evt.id,
      sort_order: idx,
    }));

    try {
      const res = await fetch('/api/cms/timeline/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
    } catch {
      toast.error('Failed to reorder');
      fetchEvents();
    }
  };

  const undoRef = useRef<{ id: string; undone: boolean } | null>(null);

  const handleDelete = (event: CmsTimelineEvent) => {
    const snapshot = [...events];
    setEvents(prev => prev.filter(e => e.id !== event.id));

    const undo = { id: event.id, undone: false };
    undoRef.current = undo;

    toast(`Deleted "${event.title}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          undo.undone = true;
          setEvents(snapshot);
        },
      },
      duration: 5000,
      onAutoClose: () => commitDelete(event.id, undo, snapshot),
      onDismiss: () => commitDelete(event.id, undo, snapshot),
    });
  };

  const commitDelete = async (
    id: string,
    undo: { undone: boolean },
    snapshot: CmsTimelineEvent[]
  ) => {
    if (undo.undone) return;
    try {
      const res = await fetch(`/api/cms/timeline/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      toast.error('Failed to delete — restoring');
      setEvents(snapshot);
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
    if (!dateStr) return '--';
    try {
      const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) return dateStr;
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
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-28 hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={events.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {events.map((event, idx) => (
                    <SortableRow key={event.id} id={event.id}>
                      <TableCell className="text-gray-500">{idx + 1}</TableCell>
                      <TableCell>
                        <span className="font-medium">{event.title}</span>
                        <span className="block sm:hidden text-xs text-gray-500 mt-0.5">
                          {formatDate(event.event_date)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 hidden sm:table-cell">
                        {formatDate(event.event_date)}
                      </TableCell>
                      <TableCell className="text-gray-600 hidden md:table-cell">
                        {truncate(event.description)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </SortableRow>
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
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

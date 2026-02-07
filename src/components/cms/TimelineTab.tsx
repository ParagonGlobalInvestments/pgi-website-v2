'use client';

import { useState, useMemo } from 'react';
import TimelineEventForm from './TimelineEventForm';
import { CmsTabLayout, type CmsColumn } from './CmsTabLayout';
import { useCmsData } from '@/hooks/useCmsData';
import type { CmsTimelineEvent } from '@/lib/cms/types';

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

const truncate = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function TimelineTab() {
  const { items, loading, refetch, handleDragEnd, handleDelete, sensors } =
    useCmsData<CmsTimelineEvent>({
      endpoint: '/api/cms/timeline',
      sortBy: 'sort_order',
    });

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<
    CmsTimelineEvent | undefined
  >(undefined);

  const columns: CmsColumn<CmsTimelineEvent>[] = useMemo(
    () => [
      {
        header: 'Title',
        render: event => (
          <>
            <span className="font-medium">{event.title}</span>
            <span className="block sm:hidden text-xs text-gray-500 mt-0.5">
              {formatDate(event.event_date)}
            </span>
          </>
        ),
      },
      {
        header: 'Date',
        className: 'w-32 hidden sm:table-cell',
        render: event => (
          <span className="text-xs tabular-nums text-gray-500">
            {formatDate(event.event_date)}
          </span>
        ),
      },
      {
        header: 'Description',
        className: 'hidden md:table-cell',
        render: event => (
          <span className="text-gray-600">{truncate(event.description)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="mt-4">
      <CmsTabLayout
        items={items}
        loading={loading}
        count={items.length}
        noun={['event', 'events']}
        columns={columns}
        onAdd={() => {
          setEditingEvent(undefined);
          setFormOpen(true);
        }}
        onEdit={event => {
          setEditingEvent(event);
          setFormOpen(true);
        }}
        onDelete={event => handleDelete(event, event.title)}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        emptyMessage="No timeline events yet."
        itemLabel={event => event.title}
      />

      <TimelineEventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        onSaved={() => {
          setFormOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

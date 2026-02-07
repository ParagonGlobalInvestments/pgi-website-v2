'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DetailPanel } from '@/components/ui/detail-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import CmsFormFooter from '@/components/cms/CmsFormFooter';
import type { CmsTimelineEvent } from '@/lib/cms/types';

interface TimelineEventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CmsTimelineEvent;
  onSaved: () => void;
}

export default function TimelineEventForm({
  open,
  onOpenChange,
  event,
  onSaved,
}: TimelineEventFormProps) {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(event);

  useEffect(() => {
    if (open) {
      if (event) {
        setTitle(event.title);
        const date = new Date(event.event_date);
        setEventDate(date.toISOString().split('T')[0]);
        setDescription(event.description);
      } else {
        setTitle('');
        setEventDate('');
        setDescription('');
      }
    }
  }, [open, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!eventDate) {
      toast.error('Date is required');
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      event_date: eventDate,
      description: description.trim(),
    };

    try {
      const url = isEditing
        ? `/api/cms/timeline/${event!.id}`
        : '/api/cms/timeline';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      toast.success(isEditing ? 'Updated' : 'Created');
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DetailPanel isOpen={open} onClose={() => onOpenChange(false)}>
      <h2 className="text-base font-semibold mb-4">
        {isEditing ? 'Edit Timeline Event' : 'Add Timeline Event'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Event title"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event_date">Date *</Label>
          <DatePicker
            id="event_date"
            value={eventDate}
            onChange={setEventDate}
            placeholder="Select event date"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Event description"
            rows={3}
            className="text-sm"
          />
        </div>

        <CmsFormFooter
          saving={saving}
          isEditing={isEditing}
          onCancel={() => onOpenChange(false)}
        />
      </form>
    </DetailPanel>
  );
}

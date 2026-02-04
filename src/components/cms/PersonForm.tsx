'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import type { CmsPerson, PeopleGroupSlug } from '@/lib/cms/types';
import { PEOPLE_GROUPS } from '@/lib/cms/types';

interface PersonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupSlug: PeopleGroupSlug;
  person?: CmsPerson;
  onSaved: () => void;
}

export default function PersonForm({
  open,
  onOpenChange,
  groupSlug,
  person,
  onSaved,
}: PersonFormProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [school, setSchool] = useState('');
  const [company, setCompany] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [saving, setSaving] = useState(false);

  const groupConfig = PEOPLE_GROUPS.find(g => g.slug === groupSlug);
  const fields = groupConfig?.fields || [];
  const isEditing = Boolean(person);

  useEffect(() => {
    if (open) {
      if (person) {
        setName(person.name);
        setTitle(person.title || '');
        setSchool(person.school || '');
        setCompany(person.company || '');
        setLinkedin(person.linkedin || '');
      } else {
        setName('');
        setTitle('');
        setSchool('');
        setCompany('');
        setLinkedin('');
      }
    }
  }, [open, person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    const payload: Record<string, string | null> = {
      group_slug: groupSlug,
      name: name.trim(),
      title: fields.includes('title') ? title.trim() || null : null,
      school: fields.includes('school') ? school.trim() || null : null,
      company: fields.includes('company') ? company.trim() || null : null,
      linkedin: fields.includes('linkedin') ? linkedin.trim() || null : null,
    };

    try {
      const url = isEditing ? `/api/cms/people/${person!.id}` : '/api/cms/people';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Person' : 'Add Person'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              autoFocus
            />
          </div>

          {fields.includes('title') && (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. President, VP of Finance"
              />
            </div>
          )}

          {fields.includes('school') && (
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="e.g. Columbia University"
              />
            </div>
          )}

          {fields.includes('company') && (
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Goldman Sachs"
              />
            </div>
          )}

          {fields.includes('linkedin') && (
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DetailPanel } from '@/components/ui/detail-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CmsImageUpload from '@/components/cms/CmsImageUpload';
import CmsFormFooter from '@/components/cms/CmsFormFooter';
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
  const [headshotUrl, setHeadshotUrl] = useState('');
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
        setHeadshotUrl(person.headshot_url || '');
      } else {
        setName('');
        setTitle('');
        setSchool('');
        setCompany('');
        setLinkedin('');
        setHeadshotUrl('');
      }
    }
  }, [open, person]);

  const handleAutoSaveImage = async (url: string) => {
    if (isEditing && person) {
      const patchRes = await fetch(`/api/cms/people/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headshot_url: url }),
      });
      if (!patchRes.ok) {
        toast.error(
          'Photo uploaded but failed to save — click Update to retry'
        );
        return;
      }
      toast.success('Photo saved');
      onSaved();
    }
  };

  const handleAutoClearImage = async () => {
    if (isEditing && person) {
      await fetch(`/api/cms/people/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headshot_url: null }),
      });
      onSaved();
    }
  };

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
      headshot_url: fields.includes('headshot_url')
        ? headshotUrl.trim() || null
        : null,
    };

    try {
      const url = isEditing
        ? `/api/cms/people/${person!.id}`
        : '/api/cms/people';
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
        {isEditing ? 'Edit Person' : 'Add Person'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
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

        {fields.includes('headshot_url') && (
          <div className="space-y-2">
            <Label>Headshot</Label>
            <CmsImageUpload
              folder="headshots"
              value={headshotUrl}
              onChange={setHeadshotUrl}
              onAutoSave={isEditing ? handleAutoSaveImage : undefined}
              onAutoClear={handleAutoClearImage}
              shape="circle"
              label="Headshot"
            />
          </div>
        )}

        <CmsFormFooter
          saving={saving}
          isEditing={isEditing}
          onCancel={() => onOpenChange(false)}
        />
      </form>
    </DetailPanel>
  );
}

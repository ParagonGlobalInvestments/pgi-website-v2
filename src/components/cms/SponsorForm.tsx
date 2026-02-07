'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DetailPanel } from '@/components/ui/detail-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CmsImageUpload from '@/components/cms/CmsImageUpload';
import CmsFormFooter from '@/components/cms/CmsFormFooter';
import type { CmsSponsor, SponsorType } from '@/lib/cms/types';

interface SponsorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: SponsorType;
  sponsor?: CmsSponsor;
  onSaved: () => void;
}

export default function SponsorForm({
  open,
  onOpenChange,
  type,
  sponsor,
  onSaved,
}: SponsorFormProps) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [website, setWebsite] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(sponsor);
  const isPartner = type === 'partner';
  const label = isPartner ? 'Partner' : 'Sponsor';

  useEffect(() => {
    if (open) {
      if (sponsor) {
        setName(sponsor.name);
        setDisplayName(sponsor.display_name);
        setWebsite(sponsor.website || '');
        setImagePath(sponsor.image_path || '');
        setDescription(sponsor.description || '');
      } else {
        setName('');
        setDisplayName('');
        setWebsite('');
        setImagePath('');
        setDescription('');
      }
    }
  }, [open, sponsor]);

  const handleAutoSaveImage = async (url: string) => {
    if (isEditing && sponsor) {
      const patchRes = await fetch(`/api/cms/sponsors/${sponsor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_path: url }),
      });
      if (!patchRes.ok) {
        toast.error(
          'Image uploaded but failed to save — click Update to retry'
        );
        return;
      }
      toast.success('Logo saved');
      onSaved();
    }
  };

  const handleAutoClearImage = async () => {
    if (isEditing && sponsor) {
      await fetch(`/api/cms/sponsors/${sponsor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_path: null }),
      });
      onSaved();
    }
  };

  // Auto-generate slug from display name
  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setName(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Slug name is required');
      return;
    }
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setSaving(true);
    const payload = {
      type,
      name: name.trim(),
      display_name: displayName.trim(),
      website: website.trim() || null,
      image_path: imagePath.trim() || null,
      description: isPartner ? description.trim() || null : null,
    };

    try {
      const url = isEditing
        ? `/api/cms/sponsors/${sponsor!.id}`
        : '/api/cms/sponsors';
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
        {isEditing ? `Edit ${label}` : `Add ${label}`}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={e => handleDisplayNameChange(e.target.value)}
            placeholder="e.g. Bloomberg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Slug Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. bloomberg"
            className={isEditing ? 'bg-gray-50' : ''}
          />
          <p className="text-xs text-gray-500">
            URL-friendly identifier (auto-generated from display name)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label>Logo Image</Label>
          <CmsImageUpload
            folder="sponsors"
            value={imagePath}
            onChange={setImagePath}
            onAutoSave={isEditing ? handleAutoSaveImage : undefined}
            onAutoClear={handleAutoClearImage}
            shape="contain"
            label="Logo"
          />

          {/* Manual path fallback */}
          <div className="space-y-1">
            <Label htmlFor="imagePath" className="text-xs text-gray-500">
              Or enter path manually
            </Label>
            <Input
              id="imagePath"
              value={imagePath}
              onChange={e => {
                setImagePath(e.target.value);
              }}
              placeholder="/sponsors/logo.png or https://..."
              className="text-sm"
            />
          </div>
        </div>

        {isPartner && (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Partner description..."
              rows={3}
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

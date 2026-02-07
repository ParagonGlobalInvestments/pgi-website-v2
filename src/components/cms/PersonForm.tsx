'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
import { Loader2, Save, Upload, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPreviewUrl(person.headshot_url || null);
      } else {
        setName('');
        setTitle('');
        setSchool('');
        setCompany('');
        setLinkedin('');
        setHeadshotUrl('');
        setPreviewUrl(null);
      }
    }
  }, [open, person]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use PNG, JPEG, WebP, or SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cms/upload?folder=headshots', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const { url } = await res.json();
      setHeadshotUrl(url);
      setPreviewUrl(url);

      // Auto-save headshot to DB when editing an existing person
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
      } else {
        toast.success('Photo uploaded — click Create to save');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(headshotUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = async () => {
    setHeadshotUrl('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Auto-save removal when editing an existing person
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Person' : 'Add Person'}</DialogTitle>
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

          {fields.includes('headshot_url') && (
            <div className="space-y-2">
              <Label>Headshot</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                  uploading
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {previewUrl ? (
                  <div className="relative flex items-center justify-center">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="object-cover rounded-full w-24 h-24"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 mx-auto text-blue-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500">
                          Drag & drop or{' '}
                          <button
                            type="button"
                            className="text-blue-500 hover:underline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPEG, WebP (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
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

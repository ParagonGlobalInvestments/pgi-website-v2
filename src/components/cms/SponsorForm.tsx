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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Upload, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setPreviewUrl(sponsor.image_path || null);
      } else {
        setName('');
        setDisplayName('');
        setWebsite('');
        setImagePath('');
        setDescription('');
        setPreviewUrl(null);
      }
    }
  }, [open, sponsor]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type client-side
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use PNG, JPEG, WebP, or SVG.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cms/upload?folder=sponsors', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const { url } = await res.json();
      setImagePath(url);
      setPreviewUrl(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      // Revert preview on error
      setPreviewUrl(imagePath || null);
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

  const clearImage = () => {
    setImagePath('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      const url = isEditing ? `/api/cms/sponsors/${sponsor!.id}` : '/api/cms/sponsors';
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${label}` : `Add ${label}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={e => handleDisplayNameChange(e.target.value)}
              placeholder="e.g. Bloomberg"
              autoFocus
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

            {/* Image preview / upload area */}
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
                    width={120}
                    height={120}
                    className="object-contain max-h-24"
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
                <div className="text-center py-4">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
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
                        PNG, JPEG, WebP, SVG (max 5MB)
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
                  setPreviewUrl(e.target.value || null);
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

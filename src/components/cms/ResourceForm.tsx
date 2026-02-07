'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DetailPanel } from '@/components/ui/detail-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CmsFormFooter from '@/components/cms/CmsFormFooter';
import { Upload, Loader2, X, FileText } from 'lucide-react';
import type { CmsResource, ResourceTabId, ResourceType } from '@/lib/cms/types';

const TAB_OPTIONS: { id: ResourceTabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'value', label: 'Value' },
  { id: 'quant', label: 'Quant' },
];

const SECTION_OPTIONS: Record<ResourceTabId, string[]> = {
  general: ['Networking', 'Career Prep'],
  value: [
    'Value Education',
    'IB Technicals',
    'Financial Modeling',
    'Stock Pitches',
  ],
  quant: ['Education', 'Interview Prep'],
};

const TYPE_OPTIONS: { id: ResourceType; label: string }[] = [
  { id: 'pdf', label: 'PDF' },
  { id: 'doc', label: 'Word Document' },
  { id: 'sheet', label: 'Spreadsheet' },
  { id: 'folder', label: 'Folder' },
  { id: 'link', label: 'External Link' },
];

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: CmsResource;
  defaultTabId?: ResourceTabId;
  defaultSection?: string;
  onSaved: () => void;
}

export default function ResourceForm({
  open,
  onOpenChange,
  resource,
  defaultTabId,
  defaultSection,
  onSaved,
}: ResourceFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [type, setType] = useState<ResourceType>('pdf');
  const [tabId, setTabId] = useState<ResourceTabId>(defaultTabId || 'general');
  const [section, setSection] = useState(defaultSection || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(resource);

  useEffect(() => {
    if (open) {
      if (resource) {
        setTitle(resource.title);
        setDescription(resource.description);
        setUrl(resource.url);
        setLinkUrl(resource.link_url);
        setType(resource.type);
        setTabId(resource.tab_id);
        setSection(resource.section);
      } else {
        setTitle('');
        setDescription('');
        setUrl('');
        setLinkUrl('');
        setType('pdf');
        setTabId(defaultTabId || 'general');
        setSection(
          defaultSection || SECTION_OPTIONS[defaultTabId || 'general'][0] || ''
        );
      }
    }
  }, [open, resource, defaultTabId, defaultSection]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 25MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cms/resources/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const { url: uploadedUrl } = await res.json();
      setUrl(uploadedUrl);
      toast.success('File uploaded');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!section) {
      toast.error('Section is required');
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      link_url: linkUrl.trim(),
      type,
      tab_id: tabId,
      section,
    };

    try {
      const endpoint = isEditing
        ? `/api/cms/resources/${resource!.id}`
        : '/api/cms/resources';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
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

  const sections = SECTION_OPTIONS[tabId] || [];

  return (
    <DetailPanel isOpen={open} onClose={() => onOpenChange(false)}>
      <h2 className="text-base font-semibold mb-4">
        {isEditing ? 'Edit Resource' : 'Add Resource'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="res-title">Title *</Label>
          <Input
            id="res-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Resource title"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="res-description">Description</Label>
          <Textarea
            id="res-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description"
            rows={2}
            className="text-sm"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-1.5">
          <Label>File Upload</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
              uploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {url ? (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {url.split('/').pop()}
                </span>
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                {uploading ? (
                  <Loader2 className="h-6 w-6 mx-auto text-blue-500 animate-spin" />
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
                      PDF, Word, Excel, PowerPoint (max 25MB)
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
              className="hidden"
              aria-label="Upload resource file"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        </div>

        {/* External Link */}
        <div className="space-y-1.5">
          <Label htmlFor="res-link">External Link (optional)</Label>
          <Input
            id="res-link"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="h-9 text-sm"
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={v => setType(v as ResourceType)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tab */}
        <div className="space-y-1.5">
          <Label>Tab *</Label>
          <Select
            value={tabId}
            onValueChange={v => {
              const newTab = v as ResourceTabId;
              setTabId(newTab);
              setSection(SECTION_OPTIONS[newTab][0] || '');
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_OPTIONS.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section */}
        <div className="space-y-1.5">
          <Label>Section *</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

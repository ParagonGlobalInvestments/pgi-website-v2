'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

interface CmsImageUploadProps {
  folder: string;
  value: string;
  onChange: (url: string) => void;
  onAutoSave?: (url: string) => void;
  onAutoClear?: () => void;
  shape?: 'circle' | 'contain';
  label: string;
}

export default function CmsImageUpload({
  folder,
  value,
  onChange,
  onAutoSave,
  onAutoClear,
  shape = 'circle',
  label,
}: CmsImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview when value changes externally (form reset, auto-save, etc.)
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

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

      const res = await fetch(`/api/cms/upload?folder=${folder}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const { url } = await res.json();
      onChange(url);
      setPreviewUrl(url);

      if (onAutoSave) {
        onAutoSave(url);
      } else {
        toast.success(`${label} uploaded — click Create to save`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(value || null);
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
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAutoClear?.();
  };

  const isCircle = shape === 'circle';

  return (
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
            width={isCircle ? 96 : 120}
            height={isCircle ? 96 : 120}
            className={
              isCircle
                ? 'object-cover rounded-full w-24 h-24'
                : 'object-contain max-h-24'
            }
          />
          <button
            type="button"
            onClick={clearImage}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className={isCircle ? 'text-center py-2' : 'text-center py-4'}>
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto text-blue-500 animate-spin" />
          ) : (
            <>
              <Upload
                className={
                  isCircle
                    ? 'h-6 w-6 mx-auto text-gray-400 mb-1'
                    : 'h-8 w-8 mx-auto text-gray-400 mb-2'
                }
              />
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
        aria-label={`Upload ${label.toLowerCase()} image`}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
}

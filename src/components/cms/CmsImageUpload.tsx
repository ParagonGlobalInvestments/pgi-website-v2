'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

/**
 * Upload lifecycle. While uploading, a local blob preview is shown; otherwise
 * the preview is `value` (empty or the uploaded URL). Only the latest upload
 * may settle the state, so a superseded or cleared upload is ignored.
 */
type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; localUrl: string };

const IDLE: UploadState = { status: 'idle' };

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
  const [state, setState] = useState<UploadState>(IDLE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Id of the latest upload; bumping it orphans any upload still in flight.
  const latestUpload = useRef(0);

  // Release the local blob preview once the upload settles, or on unmount.
  const localUrl = state.status === 'uploading' ? state.localUrl : null;
  useEffect(() => {
    if (!localUrl) return;
    return () => URL.revokeObjectURL(localUrl);
  }, [localUrl]);

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

    const id = ++latestUpload.current;
    setState({ status: 'uploading', localUrl: URL.createObjectURL(file) });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/admin/upload?folder=${folder}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const { url } = await res.json();
      if (id !== latestUpload.current) return;
      onChange(url);
      setState(IDLE);

      if (onAutoSave) {
        onAutoSave(url);
      } else {
        toast.success(`${label} uploaded — click Create to save`);
      }
    } catch (err: unknown) {
      if (id !== latestUpload.current) return;
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setState(IDLE);
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
    latestUpload.current++;
    onChange('');
    setState(IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAutoClear?.();
  };

  const isCircle = shape === 'circle';
  const previewUrl =
    state.status === 'uploading' ? state.localUrl : value || null;

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
        state.status === 'uploading'
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

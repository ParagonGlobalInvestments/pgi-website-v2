'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface CmsFormFooterProps {
  saving: boolean;
  /** Disables submit without the saving spinner (e.g. while uploading). */
  disabled?: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export default function CmsFormFooter({
  saving,
  disabled = false,
  isEditing,
  onCancel,
}: CmsFormFooterProps) {
  return (
    <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={saving || disabled}>
        {saving ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-1" />
        )}
        {isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );
}

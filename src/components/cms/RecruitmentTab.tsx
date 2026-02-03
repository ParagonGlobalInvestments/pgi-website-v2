'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import type { CmsRecruitment } from '@/lib/cms/types';

const KEY_LABELS: Record<string, string> = {
  app_open_date: 'Application Open Date',
  app_deadline: 'Application Deadline',
  zoom_session_1_link: 'Info Session 1 Link',
  zoom_session_1_time: 'Info Session 1 Time',
  zoom_session_2_link: 'Info Session 2 Link',
  zoom_session_2_time: 'Info Session 2 Time',
  education_eligibility: 'Education Eligibility',
  fund_eligibility: 'Fund Eligibility',
};

const KEY_ORDER = [
  'app_open_date',
  'app_deadline',
  'zoom_session_1_link',
  'zoom_session_1_time',
  'zoom_session_2_link',
  'zoom_session_2_time',
  'education_eligibility',
  'fund_eligibility',
];

export default function RecruitmentTab() {
  const [items, setItems] = useState<CmsRecruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await window.fetch('/api/cms/recruitment');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setItems(data);
      } catch {
        toast.error('Failed to load recruitment settings');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const getValue = (key: string): string => {
    const item = items.find(i => i.key === key);
    return item?.value || '';
  };

  const setValue = (key: string, value: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => (i.key === key ? { ...i, value } : i));
      }
      // Create a temporary new item
      return [
        ...prev,
        { id: `temp-${key}`, key, value, updated_at: new Date().toISOString() },
      ];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = items.map(i => ({ key: i.key, value: i.value }));
      const res = await fetch('/api/cms/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Saved');
      // Refresh to get updated data from server
      const refreshRes = await fetch('/api/cms/recruitment');
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setItems(data);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 py-8 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {KEY_ORDER.map(key => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{KEY_LABELS[key] || key}</Label>
            <Input
              id={key}
              value={getValue(key)}
              onChange={e => setValue(key, e.target.value)}
              placeholder={KEY_LABELS[key]}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save All
        </Button>
      </div>
    </div>
  );
}

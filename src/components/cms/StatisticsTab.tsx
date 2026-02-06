'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import type { CmsStatistic } from '@/lib/cms/types';

export default function StatisticsTab() {
  const [stats, setStats] = useState<CmsStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await window.fetch('/api/cms/statistics');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Sort by sort_order
        setStats(
          data.sort(
            (a: CmsStatistic, b: CmsStatistic) => a.sort_order - b.sort_order
          )
        );
      } catch {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const updateStat = (
    id: string,
    field: 'label' | 'value',
    newValue: string
  ) => {
    setStats(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: newValue } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = stats.map(s => ({
        id: s.id,
        key: s.key,
        label: s.label,
        value: s.value,
        sort_order: s.sort_order,
      }));
      const res = await fetch('/api/cms/statistics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Saved');
      // Refresh
      const refreshRes = await fetch('/api/cms/statistics');
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setStats(
          data.sort(
            (a: CmsStatistic, b: CmsStatistic) => a.sort_order - b.sort_order
          )
        );
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

  if (stats.length === 0) {
    return (
      <div className="mt-4 text-gray-500 py-8 text-center">
        No statistics configured yet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-4">
        {stats.map(stat => (
          <div
            key={stat.id}
            className="grid gap-4 sm:grid-cols-3 items-end p-4 border rounded-lg bg-gray-50"
          >
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Key (readonly)</Label>
              <Input
                value={stat.key}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`label-${stat.id}`}>Label</Label>
              <Input
                id={`label-${stat.id}`}
                value={stat.label}
                onChange={e => updateStat(stat.id, 'label', e.target.value)}
                placeholder="Display label"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`value-${stat.id}`}>Value</Label>
              <Input
                id={`value-${stat.id}`}
                value={stat.value}
                onChange={e => updateStat(stat.id, 'value', e.target.value)}
                placeholder="Statistic value"
              />
            </div>
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

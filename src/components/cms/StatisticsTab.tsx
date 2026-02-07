'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { CmsStatistic } from '@/lib/cms/types';

export default function StatisticsTab() {
  const [stats, setStats] = useState<CmsStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const serverStats = useRef<CmsStatistic[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await window.fetch('/api/cms/statistics');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: CmsStatistic[] = await res.json();
        const sorted = data.sort((a, b) => a.sort_order - b.sort_order);
        setStats(sorted);
        serverStats.current = sorted;
      } catch {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const handleBlur = async (id: string) => {
    const current = stats.find(s => s.id === id);
    const server = serverStats.current.find(s => s.id === id);
    if (!current || !server) return;
    if (current.label === server.label && current.value === server.value)
      return;

    setSavingId(id);
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

      const data: CmsStatistic[] = await res.json();
      const sorted = data.sort((a, b) => a.sort_order - b.sort_order);
      setStats(sorted);
      serverStats.current = sorted;
    } catch {
      toast.error('Failed to save');
      setStats([...serverStats.current]);
    } finally {
      setSavingId(null);
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
    <div className="mt-4 space-y-3">
      <span className="text-xs tabular-nums text-gray-400">
        {stats.length} {stats.length === 1 ? 'statistic' : 'statistics'}
      </span>
      {stats.map(stat => (
        <div
          key={stat.id}
          className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center rounded-lg border border-gray-200 bg-white px-3 py-2.5"
        >
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500 whitespace-nowrap">
            {stat.key}
          </span>
          <div className="relative">
            <Input
              id={`label-${stat.id}`}
              value={stat.label}
              onChange={e => updateStat(stat.id, 'label', e.target.value)}
              onBlur={() => handleBlur(stat.id)}
              placeholder="Label"
              aria-label={`Label for ${stat.key}`}
              className={`h-8 text-sm ${savingId === stat.id ? 'opacity-60' : ''}`}
            />
          </div>
          <div className="relative">
            <Input
              id={`value-${stat.id}`}
              value={stat.value}
              onChange={e => updateStat(stat.id, 'value', e.target.value)}
              onBlur={() => handleBlur(stat.id)}
              placeholder="Value"
              aria-label={`Value for ${stat.key}`}
              className={`h-8 text-sm ${savingId === stat.id ? 'opacity-60' : ''}`}
            />
            {savingId === stat.id && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-gray-400" />
            )}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400">Changes save automatically.</p>
    </div>
  );
}

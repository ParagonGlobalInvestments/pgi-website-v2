'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2 } from 'lucide-react';
import type { CmsRecruitment } from '@/lib/cms/types';

const KEY_LABELS: Record<string, string> = {
  education_application_link: 'Education Application Link',
  fund_application_link: 'Fund Application Link',
  applications_open: 'Applications Open',
  app_open_date: 'Application Open Date',
  app_deadline: 'Application Deadline',
  zoom_session_1_link: 'Info Session 1 Link',
  zoom_session_1_time: 'Info Session 1 Time',
  zoom_session_1_visible: 'Show Info Session 1',
  zoom_session_2_link: 'Info Session 2 Link',
  zoom_session_2_time: 'Info Session 2 Time',
  zoom_session_2_visible: 'Show Info Session 2',
  education_eligibility: 'Education Eligibility',
  fund_eligibility: 'Fund Eligibility',
};

const KEY_ORDER = [
  'education_application_link',
  'fund_application_link',
  'applications_open',
  'app_open_date',
  'app_deadline',
  'zoom_session_1_link',
  'zoom_session_1_time',
  'zoom_session_1_visible',
  'zoom_session_2_link',
  'zoom_session_2_time',
  'zoom_session_2_visible',
  'education_eligibility',
  'fund_eligibility',
];

const TOGGLE_KEYS = new Set([
  'applications_open',
  'zoom_session_1_visible',
  'zoom_session_2_visible',
]);

const DATE_KEYS = new Set(['app_open_date', 'app_deadline']);

const TOGGLE_HINTS: Record<string, { on: string; off: string }> = {
  applications_open: {
    on: 'Apply buttons visible on website.',
    off: 'Apply buttons hidden.',
  },
  zoom_session_1_visible: {
    on: 'Zoom link visible on Apply page.',
    off: 'Zoom link hidden.',
  },
  zoom_session_2_visible: {
    on: 'Zoom link visible on Apply page.',
    off: 'Zoom link hidden.',
  },
};

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: 'Application Links',
    keys: [
      'education_application_link',
      'fund_application_link',
      'applications_open',
    ],
  },
  {
    title: 'Timeline',
    keys: ['app_open_date', 'app_deadline'],
  },
  {
    title: 'Info Session 1',
    keys: [
      'zoom_session_1_link',
      'zoom_session_1_time',
      'zoom_session_1_visible',
    ],
  },
  {
    title: 'Info Session 2',
    keys: [
      'zoom_session_2_link',
      'zoom_session_2_time',
      'zoom_session_2_visible',
    ],
  },
  {
    title: 'Eligibility',
    keys: ['education_eligibility', 'fund_eligibility'],
  },
];

export default function RecruitmentTab() {
  const [items, setItems] = useState<CmsRecruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const serverValues = useRef<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await window.fetch('/api/cms/recruitment');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: CmsRecruitment[] = await res.json();
        setItems(data);
        const sv: Record<string, string> = {};
        for (const item of data) sv[item.key] = item.value;
        serverValues.current = sv;
      } catch {
        toast.error('Failed to load recruitment settings');
      } finally {
        setLoading(false);
      }
    }
    load();
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
      return [
        ...prev,
        { id: `temp-${key}`, key, value, updated_at: new Date().toISOString() },
      ];
    });
  };

  const saveKey = async (key: string, overrideValue?: string) => {
    const current = overrideValue ?? getValue(key);
    if (
      current === (serverValues.current[key] ?? '') &&
      overrideValue === undefined
    )
      return;

    setSavingKey(key);
    try {
      const allItems = KEY_ORDER.map(k => ({
        key: k,
        value: k === key ? current : getValue(k),
      }));

      const res = await fetch('/api/cms/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems }),
      });
      if (!res.ok) throw new Error('Failed to save');

      const data: CmsRecruitment[] = await res.json();
      setItems(data);
      const sv: Record<string, string> = {};
      for (const item of data) sv[item.key] = item.value;
      serverValues.current = sv;
    } catch {
      toast.error('Failed to save');
      setValue(key, serverValues.current[key] ?? '');
    } finally {
      setSavingKey(null);
    }
  };

  const handleBlur = (key: string) => saveKey(key);

  const handleDateChange = (key: string, value: string) => {
    setValue(key, value);
    saveKey(key, value);
  };

  const handleToggle = (key: string) => {
    const current = getValue(key);
    const next = current === 'true' ? 'false' : 'true';
    setValue(key, next);
    setSavingKey(key);
    const allItems = KEY_ORDER.map(k => ({
      key: k,
      value: k === key ? next : getValue(k),
    }));

    fetch('/api/cms/recruitment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: allItems }),
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to save');
        const data: CmsRecruitment[] = await res.json();
        setItems(data);
        const sv: Record<string, string> = {};
        for (const item of data) sv[item.key] = item.value;
        serverValues.current = sv;
      })
      .catch(() => {
        toast.error('Failed to save');
        setValue(key, current);
      })
      .finally(() => setSavingKey(null));
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
      {SECTIONS.map(section => (
        <div
          key={section.title}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.keys.map(key =>
              TOGGLE_KEYS.has(key) ? (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 sm:col-span-2 py-1"
                >
                  <div className="min-w-0">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {KEY_LABELS[key]}
                    </Label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {
                        TOGGLE_HINTS[key]?.[
                          getValue(key) === 'true' ? 'on' : 'off'
                        ]
                      }
                    </p>
                  </div>
                  <button
                    id={key}
                    type="button"
                    role="switch"
                    aria-checked={getValue(key) === 'true'}
                    disabled={savingKey === key}
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      getValue(key) === 'true'
                        ? 'bg-pgi-light-blue'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
                        getValue(key) === 'true'
                          ? 'translate-x-4'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ) : DATE_KEYS.has(key) ? (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key} className="text-sm">
                    {KEY_LABELS[key]}
                  </Label>
                  <DatePicker
                    id={key}
                    value={getValue(key)}
                    onChange={v => handleDateChange(key, v)}
                    placeholder={KEY_LABELS[key]}
                    disabled={savingKey === key}
                  />
                </div>
              ) : (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key} className="text-sm">
                    {KEY_LABELS[key]}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      value={getValue(key)}
                      onChange={e => setValue(key, e.target.value)}
                      onBlur={() => handleBlur(key)}
                      placeholder={KEY_LABELS[key]}
                      className={`h-9 text-sm ${savingKey === key ? 'opacity-60' : ''}`}
                    />
                    {savingKey === key && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400">Changes save automatically.</p>
    </div>
  );
}

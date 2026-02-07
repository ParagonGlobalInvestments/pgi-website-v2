'use client';

import { useState, useEffect, useCallback } from 'react';
import { Linkedin, Github, Globe, X, Plus, Trash2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalUser } from '@/hooks/usePortalUser';
import { useMockUser } from '@/contexts/MockUserContext';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import {
  SCHOOL_LABELS,
  ROLE_LABELS,
  PROGRAM_LABELS,
} from '@/components/portal/constants';
import type { User, UserRole, UserProgram, UserPreferences } from '@/types';

function extractLinkedInUsername(input: string): string {
  if (!input) return '';
  const match = input.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match
    ? match[1].replace(/\/$/, '')
    : input.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function extractGitHubUsername(input: string): string {
  if (!input) return '';
  const match = input.match(/github\.com\/([^/?#]+)/i);
  return match
    ? match[1].replace(/\/$/, '')
    : input.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function buildLinkedInUrl(username: string): string {
  if (!username) return '';
  return `https://linkedin.com/in/${username}`;
}

function buildGitHubUrl(username: string): string {
  if (!username) return '';
  return `https://github.com/${username}`;
}

// ============================================================================
// Section wrapper — consistent card pattern
// ============================================================================

function Section({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white ${className ?? ''}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

// ============================================================================
// Toggle switch
// ============================================================================

function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00172B] focus-visible:ring-offset-2 ${
        checked ? 'bg-[#00172B]' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ============================================================================
// Preferences section
// ============================================================================

const PREFERENCE_ITEMS: {
  key: keyof UserPreferences;
  label: string;
  description: string;
  comingSoon?: boolean;
}[] = [
  {
    key: 'openToCoffeeChats',
    label: 'Open to connect',
    description:
      "Show others you're approachable — happy to chat, grab coffee, or answer questions.",
  },
  {
    key: 'recruiterSharing',
    label: 'Recruiter sharing',
    description:
      'Allow PGI to share your profile with sponsors and recruiters.',
    comingSoon: true,
  },
  {
    key: 'emailUpdates',
    label: 'Email updates',
    description:
      'Receive PGI newsletters, event announcements, and opportunities.',
    comingSoon: true,
  },
  {
    key: 'betaTester',
    label: 'Beta tester',
    description:
      'Help us catch bugs and issues on the portal so we can fix them for everyone.',
  },
];

function PreferencesSection({
  preferences,
  onUpdate,
  saving,
}: {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
  saving: boolean;
}) {
  const handleToggle = (key: keyof UserPreferences, value: boolean) => {
    onUpdate({ ...preferences, [key]: value });
  };

  return (
    <Section title="Preferences">
      <div className="space-y-0 divide-y divide-gray-100">
        {PREFERENCE_ITEMS.map(item => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`pref-${item.key}`}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {item.label}
                </label>
                {item.comingSoon && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-500 rounded">
                    Soon
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </div>
            <Toggle
              id={`pref-${item.key}`}
              checked={preferences[item.key] ?? false}
              onChange={v => handleToggle(item.key, v)}
              disabled={saving}
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================================
// Experience types & management
// ============================================================================

interface ExperienceRow {
  id: string;
  company: string;
  role: string;
  start_year: number;
  end_year: number | null;
  sort_order: number;
}

interface ExperienceDraft {
  company: string;
  role: string;
  startYear: string;
  endYear: string;
}

const emptyDraft: ExperienceDraft = {
  company: '',
  role: '',
  startYear: '',
  endYear: '',
};

function draftFromRow(row: ExperienceRow): ExperienceDraft {
  return {
    company: row.company,
    role: row.role,
    startYear: row.start_year ? String(row.start_year) : '',
    endYear: row.end_year ? String(row.end_year) : '',
  };
}

function ExperienceForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel,
}: {
  draft: ExperienceDraft;
  onChange: (d: ExperienceDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel: string;
}) {
  const valid = draft.company.trim() && draft.role.trim();
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="exp-company"
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Company
          </label>
          <Input
            id="exp-company"
            value={draft.company}
            onChange={e => onChange({ ...draft, company: e.target.value })}
            placeholder="Goldman Sachs"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="exp-role"
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Role
          </label>
          <Input
            id="exp-role"
            value={draft.role}
            onChange={e => onChange({ ...draft, role: e.target.value })}
            placeholder="Summer Analyst"
            className="h-9 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="exp-start"
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Start Year
          </label>
          <select
            id="exp-start"
            value={draft.startYear}
            onChange={e => onChange({ ...draft, startYear: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select year</option>
            {Array.from(
              { length: 12 },
              (_, i) => new Date().getFullYear() + 2 - i
            ).map(y => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="exp-end"
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            End Year
          </label>
          <select
            id="exp-end"
            value={draft.endYear}
            onChange={e => onChange({ ...draft, endYear: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Ongoing</option>
            {Array.from(
              { length: 12 },
              (_, i) => new Date().getFullYear() + 2 - i
            ).map(y => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="navy"
          size="sm"
          disabled={saving || !valid}
          onClick={onSave}
        >
          {saving ? 'Saving...' : saveLabel}
        </Button>
      </div>
    </motion.div>
  );
}

function ExperienceSection({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDraft, setAddDraft] = useState<ExperienceDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExperienceDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchExperience = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me/experience');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.experience ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId !== 'admin-allowlist') fetchExperience();
    else setLoading(false);
  }, [userId, fetchExperience]);

  const handleAdd = async () => {
    if (!addDraft.company.trim() || !addDraft.role.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: addDraft.company.trim(),
          role: addDraft.role.trim(),
          startYear: addDraft.startYear ? Number(addDraft.startYear) : null,
          endYear: addDraft.endYear ? Number(addDraft.endYear) : null,
        }),
      });
      if (res.ok) {
        setAddDraft(emptyDraft);
        setShowAddForm(false);
        await fetchExperience();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editDraft.company.trim() || !editDraft.role.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/me/experience/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: editDraft.company.trim(),
          role: editDraft.role.trim(),
          startYear: editDraft.startYear ? Number(editDraft.startYear) : null,
          endYear: editDraft.endYear ? Number(editDraft.endYear) : null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchExperience();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/users/me/experience/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEntries(prev => prev.filter(i => i.id !== id));
        if (editingId === id) setEditingId(null);
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  const startEditing = (entry: ExperienceRow) => {
    setEditingId(entry.id);
    setEditDraft(draftFromRow(entry));
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <Section title="Experience">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </Section>
    );
  }

  const addButton =
    !showAddForm && !editingId ? (
      <button
        type="button"
        onClick={() => setShowAddForm(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Add experience"
      >
        <Plus size={14} />
        Add
      </button>
    ) : null;

  return (
    <Section title="Experience" action={addButton}>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {entries.map(entry =>
            editingId === entry.id ? (
              <ExperienceForm
                key={entry.id}
                draft={editDraft}
                onChange={setEditDraft}
                onSave={() => handleUpdate(entry.id)}
                onCancel={() => setEditingId(null)}
                saving={saving}
                saveLabel="Save"
              />
            ) : (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors focus-within:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.role}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.company}
                    {entry.start_year && (
                      <>
                        {' '}
                        · {entry.start_year}
                        {entry.end_year ? `–${entry.end_year}` : '–Present'}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEditing(entry)}
                    aria-label={`Edit ${entry.role} at ${entry.company}`}
                    className="p-2 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleting === entry.id}
                    aria-label={`Delete ${entry.role} at ${entry.company}`}
                    className="p-2 text-gray-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {entries.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-400 py-2">No experience added yet.</p>
        )}

        <AnimatePresence>
          {showAddForm && (
            <ExperienceForm
              draft={addDraft}
              onChange={setAddDraft}
              onSave={handleAdd}
              onCancel={() => {
                setShowAddForm(false);
                setAddDraft(emptyDraft);
              }}
              saving={saving}
              saveLabel="Add"
            />
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ============================================================================
// Mock Mode section (admin only — "View As")
// ============================================================================

const MOCK_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'committee', label: 'Committee' },
  { value: 'pm', label: 'PM' },
  { value: 'analyst', label: 'Analyst' },
];

const MOCK_PROGRAMS: { value: UserProgram | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'value', label: 'Value' },
  { value: 'quant', label: 'Quant' },
];

function MockModeSection() {
  const { realUser } = usePortalUser();
  const { mock, startMock, updateMock, stopMock } = useMockUser();

  if (realUser?.role !== 'admin') return null;

  const selectedRole = mock.isActive ? mock.role : 'analyst';
  const selectedProgram = mock.isActive ? (mock.program ?? '') : '';

  const handleStart = () => {
    startMock(selectedRole, selectedProgram || null);
  };

  const handleRoleChange = (role: UserRole) => {
    if (mock.isActive) {
      updateMock({ role });
    }
  };

  const handleProgramChange = (program: UserProgram | '') => {
    if (mock.isActive) {
      updateMock({ program: program || null });
    }
  };

  return (
    <Section title="View As">
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          Preview the portal as a different role. API calls always use your real
          admin credentials.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="mock-role"
              className="text-xs font-medium text-gray-600 mb-1.5 block"
            >
              Role
            </label>
            <select
              id="mock-role"
              value={mock.isActive ? mock.role : selectedRole}
              onChange={e => {
                const role = e.target.value as UserRole;
                if (mock.isActive) handleRoleChange(role);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {MOCK_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="mock-program"
              className="text-xs font-medium text-gray-600 mb-1.5 block"
            >
              Program
            </label>
            <select
              id="mock-program"
              value={mock.isActive ? (mock.program ?? '') : selectedProgram}
              onChange={e => {
                const program = e.target.value as UserProgram | '';
                if (mock.isActive) handleProgramChange(program);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {MOCK_PROGRAMS.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mock.isActive ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopMock}
            className="w-full"
          >
            Stop Mock Mode
          </Button>
        ) : (
          <Button
            type="button"
            variant="navy"
            size="sm"
            onClick={handleStart}
            className="w-full"
          >
            Start Mock Mode
          </Button>
        )}
      </div>
    </Section>
  );
}

// ============================================================================
// Settings Page
// ============================================================================

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({});

  // Track server-confirmed values so we only save on actual changes
  const [serverName, setServerName] = useState('');
  const [serverWebsite, setServerWebsite] = useState('');
  const [serverLinkedin, setServerLinkedin] = useState('');
  const [serverGithub, setServerGithub] = useState('');
  const {
    user: portalUserData,
    isLoading: portalLoading,
    mutate: mutatePortalUser,
  } = usePortalUser();

  // Sync local form state when portalUser data arrives or changes
  useEffect(() => {
    if (portalLoading) return;
    if (portalUserData) {
      const u = portalUserData;
      setUser(u);
      setName(u.name);
      setWebsiteUrl(u.websiteUrl || '');
      setLinkedinUsername(extractLinkedInUsername(u.linkedinUrl || ''));
      setGithubUsername(extractGitHubUsername(u.githubUrl || ''));
      setPreferences(u.preferences || {});
      // Track server values
      setServerName(u.name);
      setServerWebsite(u.websiteUrl || '');
      setServerLinkedin(extractLinkedInUsername(u.linkedinUrl || ''));
      setServerGithub(extractGitHubUsername(u.githubUrl || ''));
    }
    setLoading(false);
  }, [portalUserData, portalLoading]);

  const handleLinkedInChange = (value: string) => {
    setLinkedinUsername(extractLinkedInUsername(value));
  };

  const handleGitHubChange = (value: string) => {
    setGithubUsername(extractGitHubUsername(value));
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFieldSave = async (field: string, overrideValue?: string) => {
    // Determine the API payload and check if value actually changed
    let payload: Record<string, string> = {};
    let changed = false;

    switch (field) {
      case 'name': {
        const val = overrideValue ?? name;
        if (val === serverName) return;
        if (!val.trim()) {
          showToast('error', 'Name cannot be empty.');
          setName(serverName);
          return;
        }
        payload = { name: val };
        changed = true;
        break;
      }
      case 'linkedin': {
        const val = overrideValue ?? linkedinUsername;
        if (val === serverLinkedin) return;
        payload = { linkedinUrl: buildLinkedInUrl(val) };
        changed = true;
        break;
      }
      case 'github': {
        const val = overrideValue ?? githubUsername;
        if (val === serverGithub) return;
        payload = { githubUrl: buildGitHubUrl(val) };
        changed = true;
        break;
      }
      case 'website': {
        const val = overrideValue ?? websiteUrl;
        if (val === serverWebsite) return;
        payload = { websiteUrl: val };
        changed = true;
        break;
      }
    }

    if (!changed) return;
    setSavingField(field);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setUser(data.user);
      mutatePortalUser();
      // Update server values from response
      const u = data.user as User;
      setServerName(u.name);
      setServerLinkedin(extractLinkedInUsername(u.linkedinUrl || ''));
      setServerGithub(extractGitHubUsername(u.githubUrl || ''));
      setServerWebsite(u.websiteUrl || '');
    } catch (err: unknown) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to save.'
      );
      // Revert to server value
      if (field === 'name') setName(serverName);
      if (field === 'linkedin') setLinkedinUsername(serverLinkedin);
      if (field === 'github') setGithubUsername(serverGithub);
      if (field === 'website') setWebsiteUrl(serverWebsite);
    } finally {
      setSavingField(null);
    }
  };

  const handlePreferencesUpdate = async (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPrefs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setUser(data.user);
    } catch {
      // Revert on failure
      setPreferences(user?.preferences || {});
      showToast('error', 'Failed to save preference.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div>
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-14 mb-1.5" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load your profile. Please try refreshing.
      </div>
    );
  }

  const isAdmin = user.id === 'admin-allowlist';

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Settings"
        description="Manage your profile information"
      />

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="status"
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column grid on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT column */}
        <div className="space-y-6">
          {/* Account Details */}
          <Section title="Account">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </dd>
              </div>
              {user.school && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">
                    School
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {SCHOOL_LABELS[user.school] || user.school}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {ROLE_LABELS[user.role] || user.role}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide">
                  Program
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {user.program
                    ? PROGRAM_LABELS[user.program] || user.program
                    : 'N/A'}
                </dd>
              </div>
              {user.graduationYear && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wide">
                    Graduation
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {user.graduationYear}
                  </dd>
                </div>
              )}
            </dl>
          </Section>

          {/* Profile */}
          {isAdmin ? (
            <Section title="Profile">
              <p className="text-sm text-gray-500">
                Admin allowlist accounts use external authentication. Profile
                editing is not available.
              </p>
            </Section>
          ) : (
            <Section title="Profile">
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-600"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => handleFieldSave('name')}
                    className={`mt-1.5 ${savingField === 'name' ? 'opacity-60' : ''}`}
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label
                    htmlFor="linkedin"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                  >
                    <Linkedin size={12} className="text-[#0077B5]" />
                    LinkedIn
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                      linkedin.com/in/
                    </span>
                    <div className="relative flex-1">
                      <input
                        id="linkedin"
                        type="text"
                        value={linkedinUsername}
                        onChange={e => handleLinkedInChange(e.target.value)}
                        onBlur={() => handleFieldSave('linkedin')}
                        placeholder="your-profile"
                        className={`w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00172B] focus-visible:border-transparent ${savingField === 'linkedin' ? 'opacity-60' : ''}`}
                      />
                      {linkedinUsername && (
                        <button
                          type="button"
                          onClick={() => {
                            setLinkedinUsername('');
                            handleFieldSave('linkedin', '');
                          }}
                          aria-label="Clear LinkedIn"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <label
                    htmlFor="github"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                  >
                    <Github size={12} />
                    GitHub
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                      github.com/
                    </span>
                    <div className="relative flex-1">
                      <input
                        id="github"
                        type="text"
                        value={githubUsername}
                        onChange={e => handleGitHubChange(e.target.value)}
                        onBlur={() => handleFieldSave('github')}
                        placeholder="your-username"
                        className={`w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00172B] focus-visible:border-transparent ${savingField === 'github' ? 'opacity-60' : ''}`}
                      />
                      {githubUsername && (
                        <button
                          type="button"
                          onClick={() => {
                            setGithubUsername('');
                            handleFieldSave('github', '');
                          }}
                          aria-label="Clear GitHub"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label
                    htmlFor="website"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                  >
                    <Globe size={12} />
                    Personal Website
                  </label>
                  <div className="relative">
                    <Input
                      id="website"
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      onBlur={() => handleFieldSave('website')}
                      placeholder="https://yoursite.com"
                      className={savingField === 'website' ? 'opacity-60' : ''}
                    />
                    {websiteUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setWebsiteUrl('');
                          handleFieldSave('website', '');
                        }}
                        aria-label="Clear website"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Changes save automatically. Paste a full URL or just your
                  username for LinkedIn/GitHub.
                </p>
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          {/* View As — admin only */}
          <MockModeSection />

          {/* Experience */}
          {!isAdmin && <ExperienceSection userId={user.id} />}

          {/* Preferences */}
          {!isAdmin && (
            <PreferencesSection
              preferences={preferences}
              onUpdate={handlePreferencesUpdate}
              saving={savingPrefs}
            />
          )}
        </div>
      </div>
    </div>
  );
}

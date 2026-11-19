'use client';

import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { Globe, X, Plus, Trash2, Pencil } from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/brand-icons';
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
import type { UserIdentity } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/browser';
import {
  experienceEditorReducer,
  initialExperienceEditorState,
  isDraftValid,
  type ExperienceDraft,
} from '@/lib/settings/experienceEditor';
import {
  profileFormReducer,
  shouldSave,
  type ProfileField,
  type ProfileFormState,
  type ProfileValues,
} from '@/lib/settings/profileAutosave';
import { linkedAccountsReducer } from '@/lib/settings/linkedAccounts';
import { isAdminAllowlistUserId } from '@/lib/members/lifecycle';

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
  busy,
  saveLabel,
}: {
  draft: ExperienceDraft;
  onChange: (d: ExperienceDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  /** This form's save is in flight */
  saving: boolean;
  /** Any experience request is in flight */
  busy: boolean;
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
          disabled={busy || !valid}
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
  const [editor, dispatch] = useReducer(
    experienceEditorReducer,
    initialExperienceEditorState
  );
  const { mode, pending } = editor;

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
    if (!isAdminAllowlistUserId(userId)) fetchExperience();
    else setLoading(false);
  }, [userId, fetchExperience]);

  const handleSave = async () => {
    if (mode.kind === 'list' || pending.kind !== 'idle') return;
    if (!isDraftValid(mode.draft)) return;
    const { draft } = mode;
    dispatch({ type: 'SAVE_START' });
    try {
      const res = await fetch(
        mode.kind === 'adding'
          ? '/api/users/me/experience'
          : `/api/users/me/experience/${mode.id}`,
        {
          method: mode.kind === 'adding' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: draft.company.trim(),
            role: draft.role.trim(),
            startYear: draft.startYear ? Number(draft.startYear) : null,
            endYear: draft.endYear ? Number(draft.endYear) : null,
          }),
        }
      );
      if (!res.ok) {
        dispatch({ type: 'SAVE_FAILURE' });
        return;
      }
      dispatch({ type: 'SAVE_SUCCESS' });
      await fetchExperience();
    } catch {
      // silently fail
      dispatch({ type: 'SAVE_FAILURE' });
    }
  };

  const handleDelete = async (id: string) => {
    if (pending.kind !== 'idle') return;
    dispatch({ type: 'DELETE_START', id });
    try {
      const res = await fetch(`/api/users/me/experience/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        dispatch({ type: 'DELETE_FAILURE' });
        return;
      }
      setEntries(prev => prev.filter(i => i.id !== id));
      dispatch({ type: 'DELETE_SUCCESS', id });
    } catch {
      // silently fail
      dispatch({ type: 'DELETE_FAILURE' });
    }
  };

  const startEditing = (entry: ExperienceRow) =>
    dispatch({ type: 'START_EDIT', id: entry.id, draft: draftFromRow(entry) });

  const updateDraft = (draft: ExperienceDraft) =>
    dispatch({ type: 'UPDATE_DRAFT', draft });

  const cancel = () => dispatch({ type: 'CANCEL' });

  // "Saving..." only on the form whose save is in flight
  const saving =
    pending.kind === 'saving' &&
    mode.kind !== 'list' &&
    pending.formId === mode.formId;
  const busy = pending.kind !== 'idle';

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
    mode.kind === 'list' ? (
      <button
        type="button"
        onClick={() => dispatch({ type: 'START_ADD' })}
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
            mode.kind === 'editing' && mode.id === entry.id ? (
              <ExperienceForm
                key={entry.id}
                draft={mode.draft}
                onChange={updateDraft}
                onSave={handleSave}
                onCancel={cancel}
                saving={saving}
                busy={busy}
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
                    disabled={busy}
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

        {entries.length === 0 && mode.kind !== 'adding' && (
          <p className="text-sm text-gray-400 py-2">No experience added yet.</p>
        )}

        <AnimatePresence>
          {mode.kind === 'adding' && (
            <ExperienceForm
              draft={mode.draft}
              onChange={updateDraft}
              onSave={handleSave}
              onCancel={cancel}
              saving={saving}
              busy={busy}
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

  // Selection for the next start. Only shown while mock mode is inactive;
  // once active, the selects edit the live mock instead.
  const [pendingRole, setPendingRole] = useState<UserRole>('analyst');
  const [pendingProgram, setPendingProgram] = useState<UserProgram | ''>('');

  if (realUser?.role !== 'admin') return null;

  const isActive = mock.status === 'active';
  const currentRole = isActive ? mock.role : pendingRole;
  const currentProgram = isActive ? (mock.program ?? '') : pendingProgram;

  const handleStart = () => {
    startMock(pendingRole, pendingProgram || null);
  };

  const handleRoleChange = (role: UserRole) => {
    if (isActive) {
      updateMock({ role });
    } else {
      setPendingRole(role);
    }
  };

  const handleProgramChange = (program: UserProgram | '') => {
    if (isActive) {
      updateMock({ program: program || null });
    } else {
      setPendingProgram(program);
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
          <div className="min-w-0">
            <label
              htmlFor="mock-role"
              className="text-xs font-medium text-gray-600 mb-1.5 block"
            >
              Role
            </label>
            <select
              id="mock-role"
              value={currentRole}
              onChange={e => handleRoleChange(e.target.value as UserRole)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {MOCK_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label
              htmlFor="mock-program"
              className="text-xs font-medium text-gray-600 mb-1.5 block"
            >
              Program
            </label>
            <select
              id="mock-program"
              value={currentProgram}
              onChange={e =>
                handleProgramChange(e.target.value as UserProgram | '')
              }
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

        {isActive ? (
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

// ============================================================================
// Linked Google accounts — sign in with a personal account after proving
// ownership of both (signed in with one, OAuth with the other). Requires
// "Manual linking" in Supabase Auth settings.
// ============================================================================

const LINK_ERRORS: Record<string, string> = {
  identity_already_exists:
    'That Google account already has its own PGI login. Ask a PGI admin to remove it, then try again.',
  access_denied: 'Linking was cancelled.',
};

function LinkedAccountsSection() {
  const supabase = createClient();
  const [state, dispatch] = useReducer(linkedAccountsReducer<UserIdentity>, {
    status: 'loading',
    error: null,
  });

  const fetchIdentities = useCallback(async () => {
    const { data } = await supabase.auth.getUserIdentities();
    return data?.identities ?? [];
  }, [supabase]);

  useEffect(() => {
    fetchIdentities().then(identities =>
      dispatch({ type: 'LOADED', identities })
    );
    // /auth/callback forwards OAuth errors from a failed link here
    const url = new URL(window.location.href);
    const code = url.searchParams.get('auth_error');
    if (!code) return;
    dispatch({
      type: 'SHOW_ERROR',
      message:
        LINK_ERRORS[code] ?? 'Could not link that account. Please try again.',
    });
    url.searchParams.delete('auth_error');
    window.history.replaceState({}, '', url.toString());
  }, [fetchIdentities]);

  const link = async () => {
    if (state.status !== 'ready') return;
    dispatch({ type: 'LINK_START' });
    const next = encodeURIComponent(window.location.pathname);
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        queryParams: { prompt: 'select_account' },
      },
    });
    // On success the browser is already leaving for Google
    if (linkError)
      dispatch({ type: 'LINK_FAILED', message: linkError.message });
  };

  const unlink = async (identity: UserIdentity) => {
    if (state.status !== 'ready') return;
    dispatch({ type: 'UNLINK_START', identityId: identity.identity_id });
    const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity);
    const identities = await fetchIdentities();
    dispatch({
      type: 'UNLINK_DONE',
      identities,
      error: unlinkError?.message ?? null,
    });
  };

  const busy = state.status !== 'ready';
  const error =
    state.status === 'ready' || state.status === 'loading' ? state.error : null;

  return (
    <Section title="Linked Google accounts">
      <p className="text-xs text-gray-500 mb-3">
        You can sign in to the portal with any of these accounts.
      </p>
      {state.status === 'loading' ? (
        <Skeleton className="h-5 w-48" />
      ) : (
        <ul className="divide-y divide-gray-100">
          {state.identities.map(identity => (
            <li
              key={identity.identity_id}
              className="flex items-center justify-between gap-3 py-2 first:pt-0"
            >
              <span className="text-sm text-gray-900 truncate">
                {String(identity.identity_data?.email ?? identity.provider)}
              </span>
              {state.identities.length > 1 && (
                <button
                  type="button"
                  onClick={() => unlink(identity)}
                  disabled={busy}
                  className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={link}
        disabled={busy}
        className="mt-4"
      >
        Link another Google account
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </Section>
  );
}

function profileValuesFromUser(u: User): ProfileValues {
  return {
    name: u.name,
    website: u.websiteUrl || '',
    linkedin: extractLinkedInUsername(u.linkedinUrl || ''),
    github: extractGitHubUsername(u.githubUrl || ''),
  };
}

function profilePayload(
  field: ProfileField,
  value: string
): Record<string, string> {
  switch (field) {
    case 'name':
      return { name: value };
    case 'linkedin':
      return { linkedinUrl: buildLinkedInUrl(value) };
    case 'github':
      return { githubUrl: buildGitHubUrl(value) };
    case 'website':
      return { websiteUrl: value };
  }
}

export default function SettingsPage() {
  const {
    user: portalUser,
    isLoading: portalLoading,
    mutate: mutatePortalUser,
  } = usePortalUser();

  // A failed revalidation reports a null user; keep showing the last one so
  // the form (and any unsaved edits) stays mounted.
  const [lastUser, setLastUser] = useState(portalUser);
  if (portalUser && portalUser !== lastUser) setLastUser(portalUser);
  const user = portalUser ?? lastUser;

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(
    () => user?.preferences || {}
  );

  // Seeded synchronously when the user is already cached, so inputs never
  // render empty before the first sync.
  const [profile, dispatchProfile] = useReducer(
    profileFormReducer,
    user,
    (u): ProfileFormState =>
      u
        ? profileFormReducer(
            { status: 'unloaded' },
            { type: 'LOAD', values: profileValuesFromUser(u) }
          )
        : { status: 'unloaded' }
  );
  const requestSeq = useRef(0);
  // Newest request per field, so superseded failures stay quiet
  const latestRequest = useRef<Partial<Record<ProfileField, number>>>({});

  // Merge fresh server data into the form; unsaved edits are kept
  useEffect(() => {
    if (!user) return;
    dispatchProfile({ type: 'LOAD', values: profileValuesFromUser(user) });
    setPreferences(user.preferences || {});
  }, [user]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fields = profile.status === 'loaded' ? profile.fields : null;

  const editField = (field: ProfileField, value: string) =>
    dispatchProfile({ type: 'EDIT', field, value });

  const handleFieldSave = async (
    field: ProfileField,
    overrideValue?: string
  ) => {
    if (!fields) return;
    const current = fields[field];
    const value = overrideValue ?? current.value;
    if (!shouldSave({ ...current, value })) return;

    if (field === 'name' && !value.trim()) {
      showToast('error', 'Name cannot be empty.');
      dispatchProfile({
        type: 'REJECT',
        field,
        message: 'Name cannot be empty.',
      });
      return;
    }

    const requestId = ++requestSeq.current;
    latestRequest.current[field] = requestId;
    dispatchProfile({ type: 'SAVE_START', field, value, requestId });

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload(field, value)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      dispatchProfile({
        type: 'SAVE_SUCCESS',
        field,
        requestId,
        values: profileValuesFromUser(data.user as User),
      });
      mutatePortalUser();
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Failed to save.';
      if (latestRequest.current[field] === requestId) showToast('error', text);
      dispatchProfile({
        type: 'SAVE_FAILURE',
        field,
        requestId,
        message: text,
      });
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
      // Keep the cache current so a later failure reverts to this value
      mutatePortalUser(data.user as User, { revalidate: false });
    } catch {
      // Revert on failure
      setPreferences(user?.preferences || {});
      showToast('error', 'Failed to save preference.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (portalLoading || (user && !fields)) {
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

  if (!user || !fields) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load your profile. Please try refreshing.
      </div>
    );
  }

  const isAdmin = isAdminAllowlistUserId(user.id);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* LEFT column */}
        <div className="space-y-6 min-w-0">
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

          <LinkedAccountsSection />

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
                    value={fields.name.value}
                    onChange={e => editField('name', e.target.value)}
                    onBlur={() => handleFieldSave('name')}
                    className={`mt-1.5 ${fields.name.status === 'saving' ? 'opacity-60' : ''}`}
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
                        value={fields.linkedin.value}
                        onChange={e =>
                          editField(
                            'linkedin',
                            extractLinkedInUsername(e.target.value)
                          )
                        }
                        onBlur={() => handleFieldSave('linkedin')}
                        placeholder="your-profile"
                        className={`w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00172B] focus-visible:border-transparent ${fields.linkedin.status === 'saving' ? 'opacity-60' : ''}`}
                      />
                      {fields.linkedin.value && (
                        <button
                          type="button"
                          onClick={() => {
                            editField('linkedin', '');
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
                        value={fields.github.value}
                        onChange={e =>
                          editField(
                            'github',
                            extractGitHubUsername(e.target.value)
                          )
                        }
                        onBlur={() => handleFieldSave('github')}
                        placeholder="your-username"
                        className={`w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00172B] focus-visible:border-transparent ${fields.github.status === 'saving' ? 'opacity-60' : ''}`}
                      />
                      {fields.github.value && (
                        <button
                          type="button"
                          onClick={() => {
                            editField('github', '');
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
                      value={fields.website.value}
                      onChange={e => editField('website', e.target.value)}
                      onBlur={() => handleFieldSave('website')}
                      placeholder="https://yoursite.com"
                      className={
                        fields.website.status === 'saving' ? 'opacity-60' : ''
                      }
                    />
                    {fields.website.value && (
                      <button
                        type="button"
                        onClick={() => {
                          editField('website', '');
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
        <div className="space-y-6 min-w-0">
          {/* View As — admin only */}
          <MockModeSection />

          {/* Experience */}
          {!isAdmin && <ExperienceSection userId={user.id} />}

          {/* Preferences — dev only, hidden in production */}
          {!isAdmin && process.env.NODE_ENV !== 'production' && (
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

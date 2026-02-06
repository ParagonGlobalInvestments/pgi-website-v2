'use client';

import { useState, useEffect } from 'react';
import { Linkedin, Github, Globe, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalUser } from '@/hooks/usePortalUser';
import type { User } from '@/types';

const SCHOOL_LABELS: Record<string, string> = {
  brown: 'Brown',
  columbia: 'Columbia',
  cornell: 'Cornell',
  nyu: 'NYU',
  princeton: 'Princeton',
  uchicago: 'UChicago',
  upenn: 'UPenn',
  yale: 'Yale',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  committee: 'Committee',
  pm: 'PM',
  analyst: 'Analyst',
};

const PROGRAM_LABELS: Record<string, string> = {
  value: 'Value',
  quant: 'Quant',
};

// Extract username from LinkedIn URL (handles various formats)
function extractLinkedInUsername(input: string): string {
  if (!input) return '';
  const match = input.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match
    ? match[1].replace(/\/$/, '')
    : input.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// Extract username from GitHub URL
function extractGitHubUsername(input: string): string {
  if (!input) return '';
  const match = input.match(/github\.com\/([^/?#]+)/i);
  return match
    ? match[1].replace(/\/$/, '')
    : input.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// Build full URL from username
function buildLinkedInUrl(username: string): string {
  if (!username) return '';
  return `https://linkedin.com/in/${username}`;
}

function buildGitHubUrl(username: string): string {
  if (!username) return '';
  return `https://github.com/${username}`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  // Store just usernames for cleaner UI
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const { mutate: mutatePortalUser } = usePortalUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          const u = data.user as User;
          setUser(u);
          setName(u.name);
          setBio(u.bio || '');
          setWebsiteUrl(u.websiteUrl || '');
          // Extract usernames from stored URLs
          setLinkedinUsername(extractLinkedInUsername(u.linkedinUrl || ''));
          setGithubUsername(extractGitHubUsername(u.githubUrl || ''));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle paste - auto-extract username from full URL
  const handleLinkedInChange = (value: string) => {
    setLinkedinUsername(extractLinkedInUsername(value));
  };

  const handleGitHubChange = (value: string) => {
    setGithubUsername(extractGitHubUsername(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Build full URLs from usernames for storage
    const linkedinUrl = buildLinkedInUrl(linkedinUsername);
    const githubUrl = buildGitHubUrl(githubUsername);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, websiteUrl, linkedinUrl, githubUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setUser(data.user);
      // Update SWR cache so header/sidebar reflect changes immediately
      mutatePortalUser();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-4 rounded-lg bg-gray-50 border border-gray-100 p-5">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <Skeleton className="h-3 w-14 mb-1.5" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div>
              <Skeleton className="h-3 w-14 mb-1.5" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div>
              <Skeleton className="h-3 w-14 mb-1.5" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div>
              <Skeleton className="h-3 w-14 mb-1.5" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-4 w-28 mb-3" />
          <div>
            <Skeleton className="h-3 w-12 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-md" />
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

  return (
    <div className="max-w-5xl">
      {/* Header stays full width */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your profile information
        </p>
      </div>

      {/* Toast - full width */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-lg text-sm mb-8 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Account Details - LEFT (read-only info) */}
        <section className="lg:sticky lg:top-8 lg:self-start">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Account Details
          </h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 bg-gray-50 rounded-lg p-5 border border-gray-100">
            <DetailItem label="Email" value={user.email} />
            {user.school && (
              <DetailItem
                label="School"
                value={SCHOOL_LABELS[user.school] || user.school}
              />
            )}
            <DetailItem
              label="Role"
              value={ROLE_LABELS[user.role] || user.role}
            />
            <DetailItem
              label="Program"
              value={
                user.program
                  ? PROGRAM_LABELS[user.program] || user.program
                  : 'N/A'
              }
            />
            {user.graduationYear && (
              <DetailItem
                label="Graduation Year"
                value={String(user.graduationYear)}
              />
            )}
          </dl>
        </section>

        {/* Edit Profile - RIGHT (form) */}
        {user.id === 'admin-allowlist' ? (
          <section className="bg-gray-50 rounded-lg p-5 border border-gray-100 h-fit">
            <p className="text-sm text-gray-600">
              Admin allowlist accounts use external authentication. Profile
              editing is not available.
            </p>
          </section>
        ) : (
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Edit Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-700">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 200))}
                  placeholder="Brief introduction for the directory..."
                  rows={3}
                  maxLength={200}
                  className="mt-1.5 w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00172B] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/200
                </p>
              </div>

              {/* Social Links Section */}
              <div className="space-y-4">
                <Label className="text-gray-700">Social Profiles</Label>

                {/* Connected profiles as buttons */}
                {(linkedinUsername || githubUsername || websiteUrl) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {linkedinUsername && (
                      <a
                        href={buildLinkedInUrl(linkedinUsername)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0077B5]/10 text-[#0077B5] rounded-md text-sm font-medium hover:bg-[#0077B5]/20 transition-colors"
                      >
                        <Linkedin size={14} />
                        {linkedinUsername}
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    )}
                    {githubUsername && (
                      <a
                        href={buildGitHubUrl(githubUsername)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Github size={14} />
                        {githubUsername}
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    )}
                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Globe size={14} />
                        Website
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    )}
                  </div>
                )}

                {/* LinkedIn Input */}
                <div>
                  <label
                    htmlFor="linkedin"
                    className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5"
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
                        placeholder="your-profile"
                        className="w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00172B] focus:border-transparent"
                      />
                      {linkedinUsername && (
                        <button
                          type="button"
                          onClick={() => setLinkedinUsername('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* GitHub Input */}
                <div>
                  <label
                    htmlFor="github"
                    className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5"
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
                        placeholder="your-username"
                        className="w-full h-10 px-3 rounded-r-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00172B] focus:border-transparent"
                      />
                      {githubUsername && (
                        <button
                          type="button"
                          onClick={() => setGithubUsername('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Paste a full URL or just your username
                </p>

                {/* Website Input */}
                <div>
                  <label
                    htmlFor="website"
                    className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5"
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
                      placeholder="https://yoursite.com"
                    />
                    {websiteUrl && (
                      <button
                        type="button"
                        onClick={() => setWebsiteUrl('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <Button type="submit" disabled={saving} variant="navy">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

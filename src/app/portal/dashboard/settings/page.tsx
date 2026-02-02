'use client';

import { useState, useEffect } from 'react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label } from '@/components/ui';
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          const u = data.user as User;
          setUser(u);
          setName(u.name);
          setLinkedinUrl(u.linkedinUrl || '');
          setGithubUrl(u.githubUrl || '');
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, linkedinUrl, githubUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
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
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your profile information</p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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

      {/* Account details — read-only */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Account Details</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 bg-gray-50 rounded-lg p-5 border border-gray-100">
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="School" value={SCHOOL_LABELS[user.school] || user.school} />
          <DetailItem label="Role" value={ROLE_LABELS[user.role] || user.role} />
          <DetailItem
            label="Program"
            value={user.program ? (PROGRAM_LABELS[user.program] || user.program) : 'N/A'}
          />
          {user.graduationYear && (
            <DetailItem label="Graduation Year" value={String(user.graduationYear)} />
          )}
        </dl>
      </section>

      {/* Edit profile form */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-gray-700">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="linkedin" className="flex items-center gap-2 text-gray-700">
              <FaLinkedin className="text-[#0077B5]" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Must start with https://linkedin.com/in/ or https://www.linkedin.com/in/
            </p>
          </div>

          <div>
            <Label htmlFor="github" className="flex items-center gap-2 text-gray-700">
              <FaGithub className="text-gray-700" />
              GitHub URL
            </Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-username"
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Must start with https://github.com/
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <Button type="submit" disabled={saving} variant="navy">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

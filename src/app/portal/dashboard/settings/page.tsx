'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaLinkedin, FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Label, Card, CardHeader, CardContent } from '@/components/ui';
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

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Fetch user
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile information</p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read-only fields */}
      <Card>
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 px-2">Account Details</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium text-gray-900 mt-0.5">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-500">School</span>
              <p className="font-medium text-gray-900 mt-0.5">
                {SCHOOL_LABELS[user.school] || user.school}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Role</span>
              <p className="font-medium text-gray-900 mt-0.5">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Program</span>
              <p className="font-medium text-gray-900 mt-0.5">
                {user.program
                  ? PROGRAM_LABELS[user.program] || user.program
                  : 'N/A'}
              </p>
            </div>
            {user.graduationYear && (
              <div>
                <span className="text-gray-500">Graduation Year</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {user.graduationYear}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 px-2">Edit Profile</h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <FaLinkedin className="text-[#0077B5]" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must start with https://linkedin.com/in/ or https://www.linkedin.com/in/
              </p>
            </div>

            <div>
              <Label htmlFor="github" className="flex items-center gap-2">
                <FaGithub className="text-gray-900" />
                GitHub URL
              </Label>
              <Input
                id="github"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must start with https://github.com/
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} variant="navy" className="flex items-center gap-2">
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

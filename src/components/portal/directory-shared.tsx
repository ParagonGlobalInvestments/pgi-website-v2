'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Briefcase, Globe } from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/brand-icons';
import { Card, CardContent } from '@/components/ui/card';
import { SCHOOL_LABELS } from '@/components/portal/constants';
import type { User } from '@/types';

/** Building blocks shared by the member and alumni directories. */

const SCHOOL_LOGOS: Record<string, string> = {
  brown: 'brown.png',
  columbia: 'columbia.png',
  cornell: 'cornell.png',
  nyu: 'nyu.png',
  princeton: 'princeton.png',
  uchicago: 'uchicago.png',
  upenn: 'upenn.png',
  yale: 'yale.png',
};

export const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

export const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

export function schoolLabel(school: string | null): string | null {
  if (!school) return null;
  return SCHOOL_LABELS[school] || school;
}

/** Chapter logo, or nothing for schools without one. */
export function SchoolLogo({
  school,
  size,
}: {
  school: string | null;
  size: 36 | 48;
}) {
  if (!school || !SCHOOL_LOGOS[school]) return null;
  const box = size === 48 ? 'w-12 h-12' : 'w-9 h-9';
  return (
    <div className={`${box} flex items-center justify-center flex-shrink-0`}>
      <Image
        src={`/images/universities/${SCHOOL_LOGOS[school]}`}
        alt={schoolLabel(school) ?? school}
        width={size}
        height={size}
        className={`${box} object-contain`}
      />
    </div>
  );
}

interface ExperienceRow {
  id: string;
  company: string;
  role: string | null;
  start_year: number | null;
  end_year: number | null;
}

export function ExperienceList({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/experience`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEntries(data.experience ?? []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchExperience();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return null;
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Experience
      </h3>
      <div className="space-y-1.5">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-start gap-2.5 py-2 text-sm">
            <Briefcase
              className="text-gray-400 flex-shrink-0 mt-0.5"
              size={14}
            />
            <div className="min-w-0">
              {/* Historical entries may have a firm but no position */}
              <p className="text-gray-900 font-medium">
                {entry.role || entry.company}
              </p>
              <p className="text-gray-500 text-xs">
                {entry.role && entry.company}
                {entry.start_year && (
                  <>
                    {entry.role ? ' · ' : ''}
                    {entry.start_year}
                    {entry.end_year ? `–${entry.end_year}` : '–Present'}
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** LinkedIn / GitHub / website rows for the detail panel. */
export function ProfileLinks({ user }: { user: User }) {
  return (
    <>
      {user.linkedinUrl && (
        <a
          href={user.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Linkedin className="text-[#0077B5] flex-shrink-0" />
          <span className="flex-1">LinkedIn Profile</span>
          <span className="text-xs text-gray-400">↗</span>
        </a>
      )}

      {user.githubUrl && (
        <a
          href={user.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Github className="text-gray-700 flex-shrink-0" />
          <span className="flex-1">GitHub Profile</span>
          <span className="text-xs text-gray-400">↗</span>
        </a>
      )}

      {user.websiteUrl && (
        <a
          href={user.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Globe className="text-gray-700 flex-shrink-0" />
          <span className="flex-1">Personal Website</span>
          <span className="text-xs text-gray-400">↗</span>
        </a>
      )}
    </>
  );
}

interface ExperienceEntry {
  user_id: string;
  company: string;
  role: string | null;
}

/** userId → every company and role they have listed, for free-text search. */
export async function fetchExperienceSearchMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const res = await fetch('/api/users/experience');
  if (!res.ok) return map;
  const data = await res.json();
  const entries: ExperienceEntry[] = data.experience ?? [];
  for (const entry of entries) {
    const existing = map.get(entry.user_id) ?? '';
    map.set(entry.user_id, `${existing} ${entry.company} ${entry.role ?? ''}`);
  }
  return map;
}

/** Card placeholders shown while a directory loads. */
export function DirectoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

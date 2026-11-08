'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DetailPanel } from '@/components/ui/detail-panel';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { SCHOOL_LABELS, PROGRAM_LABELS } from '@/components/portal/constants';
import {
  DirectoryGridSkeleton,
  ExperienceList,
  ProfileLinks,
  SchoolLogo,
  fetchExperienceSearchMap,
  gridContainerVariants,
  gridItemVariants,
  schoolLabel,
} from '@/components/portal/directory-shared';
import { presentParts } from '@/lib/alumni';
import type { AlumniUser } from '@/types';
import { motion } from 'framer-motion';

// ============================================================================
// Helpers
// ============================================================================

/** Case- and whitespace-insensitive key so "Goldman Sachs " = "goldman sachs" */
function companyKey(company: string | null): string | null {
  const key = company?.trim().replace(/\s+/g, ' ').toLowerCase();
  return key || null;
}

/** "Company | School | Class of 2024", omitting whatever is missing */
function metaParts(user: AlumniUser) {
  return presentParts([
    user.company,
    schoolLabel(user.school),
    user.graduationYear ? `Class of ${user.graduationYear}` : null,
  ]);
}

// ============================================================================
// Alumni Detail Panel Content
// ============================================================================

function AlumniDetail({ user }: { user: AlumniUser }) {
  const [copied, setCopied] = useState(false);
  const school = schoolLabel(user.school);
  const hasLinks = Boolean(
    user.linkedinUrl || user.githubUrl || user.websiteUrl
  );

  const copyEmail = () => {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with school logo */}
      <div className="flex items-start gap-4">
        <SchoolLogo school={user.school} size={48} />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            {user.program && (
              <span
                className={`font-medium ${
                  user.program === 'quant' ? 'text-blue-600' : 'text-purple-600'
                }`}
              >
                {PROGRAM_LABELS[user.program]}
              </span>
            )}
            {user.program && <span className="text-gray-400">·</span>}
            <span className="text-gray-700 font-medium">Alumni</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        {user.company && (
          <div className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100">
            <span className="text-gray-500">Company</span>
            <span className="text-gray-900 font-medium text-right">
              {user.company}
            </span>
          </div>
        )}
        {school && (
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-gray-500">School</span>
            <span className="text-gray-900 font-medium">{school}</span>
          </div>
        )}
        {user.graduationYear && (
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-gray-500">Graduation</span>
            <span className="text-gray-900 font-medium">
              Class of {user.graduationYear}
            </span>
          </div>
        )}
      </div>

      {/* Experience */}
      <ExperienceList userId={user.id} />

      {/* Contact & Links */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Contact
        </h3>
        {user.email && (
          <button
            onClick={copyEmail}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-800 hover:bg-gray-50 transition-colors text-left"
          >
            <Mail className="text-gray-400 flex-shrink-0" />
            <span className="flex-1 truncate">{user.email}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        )}

        <ProfileLinks user={user} />

        {!user.email && !hasLinks && (
          <p className="text-gray-500 text-sm py-2">
            No contact info on file yet
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Alumni Directory Page
// ============================================================================

const DEFAULT_FILTER = { school: 'all', program: 'all', company: 'all' };

export default function AlumniDirectoryPage() {
  const [users, setUsers] = useState<AlumniUser[]>([]);
  const [experienceMap, setExperienceMap] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AlumniUser | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filter, setFilter] = useState(DEFAULT_FILTER);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch alumni and experience (experience powers company/role search)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, experience] = await Promise.all([
          fetch('/api/users/alumni'),
          fetchExperienceSearchMap().catch(() => new Map<string, string>()),
        ]);
        if (!usersRes.ok) throw new Error(`API error: ${usersRes.status}`);
        const usersData = await usersRes.json();
        if (!usersData.success || !Array.isArray(usersData.users)) {
          throw new Error(usersData.error || 'Failed to fetch alumni');
        }
        setUsers(usersData.users);
        setExperienceMap(experience);
        setError('');
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load alumni directory'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Company filter options: one per distinct current company, A–Z
  const companyOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const user of users) {
      const key = companyKey(user.company);
      if (key && !byKey.has(key)) byKey.set(key, user.company!.trim());
    }
    return Array.from(byKey.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [users]);

  // Filter alumni
  const filteredUsers = useMemo(
    () =>
      users.filter(user => {
        if (debouncedSearch) {
          const term = debouncedSearch.toLowerCase();
          const experience = experienceMap.get(user.id) ?? '';
          const haystack =
            `${user.name} ${user.email ?? ''} ${user.company ?? ''} ${experience}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        if (filter.school !== 'all' && user.school !== filter.school)
          return false;
        if (filter.program !== 'all' && user.program !== filter.program)
          return false;
        if (
          filter.company !== 'all' &&
          companyKey(user.company) !== filter.company
        )
          return false;
        return true;
      }),
    [users, debouncedSearch, filter, experienceMap]
  );

  const handleFilterChange = useCallback((type: string, value: string) => {
    setFilter(prev => ({ ...prev, [type]: value }));
  }, []);

  const hasActiveFilters =
    filter.school !== 'all' ||
    filter.program !== 'all' ||
    filter.company !== 'all' ||
    searchTerm !== '';

  const openPanel = (user: AlumniUser) => {
    setSelectedUser(user);
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Alumni Directory"
        description="Browse and connect with PGI alumni"
      />

      {/* Search + Filters */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, or role..."
            aria-label="Search alumni"
            className="pl-10 pr-4 w-full bg-white border-gray-300"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <Select
            value={filter.school}
            onValueChange={v => handleFilterChange('school', v)}
          >
            <SelectTrigger
              className="h-10 sm:h-9 w-full sm:w-[140px] text-sm bg-white border-gray-300"
              aria-label="Filter by school"
            >
              <SelectValue placeholder="School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {Object.entries(SCHOOL_LABELS).map(([slug, label]) => (
                <SelectItem key={slug} value={slug}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.program}
            onValueChange={v => handleFilterChange('program', v)}
          >
            <SelectTrigger
              className="h-10 sm:h-9 w-full sm:w-[140px] text-sm bg-white border-gray-300"
              aria-label="Filter by program"
            >
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="quant">Quant</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.company}
            onValueChange={v => handleFilterChange('company', v)}
          >
            <SelectTrigger
              className="h-10 sm:h-9 w-full sm:w-[180px] text-sm bg-white border-gray-300"
              aria-label="Filter by company"
            >
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All Companies</SelectItem>
              {companyOptions.map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter(DEFAULT_FILTER);
                setSearchTerm('');
              }}
              className="h-9 text-sm text-gray-600"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}

          <div className="sm:ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md text-center">
            {filteredUsers.length} of {users.length}
          </div>
        </div>
      </div>

      {/* Alumni Grid */}
      {loading ? (
        <DirectoryGridSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800">
          <h3 className="font-semibold mb-2">Error Loading Alumni Directory</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No alumni found</p>
          <p>
            {debouncedSearch
              ? `No alumni match "${debouncedSearch}" with the current filters.`
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredUsers.map(user => {
            const meta = metaParts(user);
            return (
              <motion.div key={user.id} variants={gridItemVariants}>
                <Card
                  className={`border transition-all duration-200 ease-smooth cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                    selectedUser?.id === user.id && isPanelOpen
                      ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => openPanel(user)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <SchoolLogo school={user.school} size={36} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </h3>
                        {meta.length > 0 && (
                          // Each part carries its own "|" in front; the
                          // negative margin + overflow clip hides the one at
                          // the start of every line, so wraps stay clean.
                          <div className="overflow-hidden">
                            <div className="-ml-4 flex flex-wrap text-sm text-gray-600">
                              {meta.map((part, i) => (
                                <span
                                  key={i}
                                  className={`flex items-center before:w-4 before:text-center before:text-gray-300 before:content-['|'] ${
                                    i === 0 && user.company
                                      ? 'font-medium text-gray-700'
                                      : ''
                                  }`}
                                >
                                  {part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Alumni Detail Panel */}
      <DetailPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        aria-label="Alumni details"
      >
        {selectedUser && <AlumniDetail user={selectedUser} />}
      </DetailPanel>
    </div>
  );
}

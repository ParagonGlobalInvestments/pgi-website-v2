'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Linkedin, Mail, Github, X } from 'lucide-react';
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
import type { User } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ============================================================================
// Constants
// ============================================================================

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

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

// ============================================================================
// Member Detail Panel Content
// ============================================================================

function MemberDetail({ user }: { user: User }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with school logo */}
      <div className="flex items-start gap-4">
        {SCHOOL_LOGOS[user.school] && (
          <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Image
              src={`/images/universities/${SCHOOL_LOGOS[user.school]}`}
              alt={SCHOOL_LABELS[user.school] || user.school}
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
        )}
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
            {user.program && user.role && (
              <span className="text-gray-400">·</span>
            )}
            <span className="text-gray-700 font-medium">
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">School</span>
          <span className="text-gray-900 font-medium">
            {SCHOOL_LABELS[user.school] || user.school}
          </span>
        </div>
        {user.graduationYear && (
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span className="text-gray-500">Graduation</span>
            <span className="text-gray-900 font-medium">
              Class of {user.graduationYear}
            </span>
          </div>
        )}
      </div>

      {/* Contact & Links */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Contact
        </h3>
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

        {!user.linkedinUrl && !user.githubUrl && (
          <p className="text-gray-500 text-sm py-2">No profile links added yet</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Directory Page
// ============================================================================

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [filter, setFilter] = useState({
    school: 'all',
    program: 'all',
    role: 'all',
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (!data.success || !Array.isArray(data.users)) {
          throw new Error(data.error || 'Failed to fetch users');
        }
        setUsers(data.users);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const haystack = `${user.name} ${user.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filter.school !== 'all' && user.school !== filter.school) return false;
      if (filter.program !== 'all' && user.program !== filter.program) return false;
      if (filter.role !== 'all' && user.role !== filter.role) return false;
      return true;
    });
  }, [users, debouncedSearch, filter]);

  const handleFilterChange = useCallback((type: string, value: string) => {
    setFilter(prev => ({ ...prev, [type]: value }));
  }, []);

  const hasActiveFilters =
    filter.school !== 'all' ||
    filter.program !== 'all' ||
    filter.role !== 'all' ||
    searchTerm !== '';

  const openPanel = (user: User) => {
    setSelectedUser(user);
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Directory</h1>
        <p className="text-gray-500 mt-1 text-sm">Browse and connect with PGI members</p>
      </div>

      {/* Search + Filters */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="pl-10 pr-4 w-full bg-white border-gray-300"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
          <Select
            value={filter.school}
            onValueChange={v => handleFilterChange('school', v)}
          >
            <SelectTrigger className="h-10 sm:h-9 w-full sm:w-[140px] text-sm bg-white border-gray-300">
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
            <SelectTrigger className="h-10 sm:h-9 w-full sm:w-[140px] text-sm bg-white border-gray-300">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="quant">Quant</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.role}
            onValueChange={v => handleFilterChange('role', v)}
          >
            <SelectTrigger className="h-10 sm:h-9 w-full sm:w-[140px] text-sm bg-white border-gray-300">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
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
                setFilter({ school: 'all', program: 'all', role: 'all' });
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

      {/* Members Grid */}
      {loading ? (
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800">
          <h3 className="font-semibold mb-2">Error Loading Directory</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No members found</p>
          <p>
            {debouncedSearch
              ? `No members match "${debouncedSearch}" with the current filters.`
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
          {filteredUsers.map(user => (
            <motion.div key={user.id} variants={gridItemVariants}>
            <Card
              className={`border transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                selectedUser?.id === user.id && isPanelOpen
                  ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => openPanel(user)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  {SCHOOL_LOGOS[user.school] && (
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={`/images/universities/${SCHOOL_LOGOS[user.school]}`}
                        alt={SCHOOL_LABELS[user.school] || user.school}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {user.program && (
                        <span
                          className={`font-medium ${
                            user.program === 'quant' ? 'text-blue-600' : 'text-purple-600'
                          }`}
                        >
                          {PROGRAM_LABELS[user.program]}
                        </span>
                      )}
                      {user.program && user.role && (
                        <span className="mx-1.5 text-gray-400">/</span>
                      )}
                      <span className="font-medium text-gray-700">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium">
                    {SCHOOL_LABELS[user.school] || user.school}
                  </span>
                  {user.graduationYear && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>Class of {user.graduationYear}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Member Detail Panel */}
      <DetailPanel isOpen={isPanelOpen} onClose={closePanel}>
        {selectedUser && <MemberDetail user={selectedUser} />}
      </DetailPanel>
    </div>
  );
}

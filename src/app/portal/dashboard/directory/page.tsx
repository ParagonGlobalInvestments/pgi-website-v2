'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaSearch,
  FaLinkedin,
  FaUsers,
  FaEnvelope,
  FaGithub,
  FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/types';
import Image from 'next/image';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      } catch (err: any) {
        setError(err.message || 'Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        const haystack = `${user.name} ${user.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      // School
      if (filter.school !== 'all' && user.school !== filter.school) return false;
      // Program
      if (filter.program !== 'all' && user.program !== filter.program) return false;
      // Role
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

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div>
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="pl-10 pr-4 w-full bg-white border-gray-300"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filter.school}
            onValueChange={v => handleFilterChange('school', v)}
          >
            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-gray-300">
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
            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-gray-300">
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
            <SelectTrigger className="h-9 w-[140px] text-sm bg-white border-gray-300">
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
              <FaTimes className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}

          <div className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
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
          <FaUsers className="text-gray-300 text-5xl mb-4 mx-auto" />
          <p className="text-lg font-medium mb-2">No members found</p>
          <p>
            {debouncedSearch
              ? `No members match "${debouncedSearch}" with the current filters.`
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <Card
              key={user.id}
              className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => openModal(user)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  {/* School logo */}
                  {SCHOOL_LOGOS[user.school] && (
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={`/images/universities/${SCHOOL_LOGOS[user.school]}`}
                        alt={SCHOOL_LABELS[user.school] || user.school}
                        width={32}
                        height={32}
                        className="w-7 h-7 object-contain"
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
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`relative p-6 text-white ${
                  selectedUser.program === 'quant'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-800'
                    : 'bg-gradient-to-br from-purple-600 to-indigo-800'
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                >
                  <FaTimes size={16} />
                </Button>

                <h2 className="text-2xl font-bold mb-1">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  {selectedUser.program && (
                    <span>{PROGRAM_LABELS[selectedUser.program]}</span>
                  )}
                  {selectedUser.program && <span className="text-white/60">·</span>}
                  <span>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</span>
                  {selectedUser.role === 'admin' && (
                    <Badge className="bg-yellow-500/30 text-yellow-200 border-yellow-400/50 ml-1">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-white/70 text-sm mt-1">
                  {SCHOOL_LABELS[selectedUser.school] || selectedUser.school}
                  {selectedUser.graduationYear &&
                    ` · Class of ${selectedUser.graduationYear}`}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3 text-sm">
                  <FaEnvelope className="text-gray-400 flex-shrink-0" />
                  <span
                    className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedUser.email);
                    }}
                    title="Click to copy"
                  >
                    {selectedUser.email}
                  </span>
                </div>

                {/* LinkedIn */}
                {selectedUser.linkedinUrl && (
                  <a
                    href={selectedUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaLinkedin className="flex-shrink-0" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}

                {/* GitHub */}
                {selectedUser.githubUrl && (
                  <a
                    href={selectedUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-800 hover:text-gray-600 transition-colors"
                  >
                    <FaGithub className="flex-shrink-0" />
                    <span>GitHub Profile</span>
                  </a>
                )}

                {!selectedUser.linkedinUrl && !selectedUser.githubUrl && (
                  <p className="text-gray-400 italic text-sm">
                    No profile links added yet
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

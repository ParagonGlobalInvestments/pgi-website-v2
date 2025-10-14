'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/browser';
import {
  FaSearch,
  FaLinkedin,
  FaUsers,
  FaEnvelope,
  FaGithub,
  FaFile,
  FaTimes,
  FaDownload,
} from 'react-icons/fa';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { SmoothTransition } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

// Updated User interface that matches the MongoDB schema
interface User {
  id: string;
  personal: {
    name: string;
    email: string;
    bio?: string;
    major?: string;
    gradYear?: number;
    isAlumni?: boolean;
    phone?: string;
  };
  org: {
    permissionLevel: string;
    track?: string;
    trackRoles: string[];
    execRoles: string[];
    status?: string;
    chapterId?: string;
    joinDate?: string;
  };
  profile?: {
    skills?: string[];
    linkedin?: string;
    avatarUrl?: string;
    github?: string;
    resumeUrl?: string;
  };
  system?: {
    firstLogin: boolean;
  };
}

// Removed sample users - using real data with optimistic loading

// Add this utility function at the top level, outside the component
const filterUsers = (users: User[], searchTerm: string, filters: any) => {
  return users.filter(user => {
    // Search filter (name, email, or bio)
    const searchFields = [
      user.personal?.name,
      user.personal?.email,
      user.personal?.bio,
      ...(user.profile?.skills || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const searchMatch =
      !searchTerm || searchFields.includes(searchTerm.toLowerCase());

    // Role filter
    const roleMatch =
      filters.role === 'all' || user.org?.permissionLevel === filters.role;

    // Track filter
    const trackMatch =
      filters.track === 'all' || user.org?.track === filters.track;

    // Chapter filter
    const chapterMatch =
      filters.chapter === 'all' || user.org?.chapterId === filters.chapter;

    return searchMatch && roleMatch && trackMatch && chapterMatch;
  });
};

export default function DirectoryPage() {
  const { user: supabaseUserData, isLoading } = useSupabaseUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chapters, setChapters] = useState<{ _id: string; name: string }[]>([]);
  const [showAlumni, setShowAlumni] = useState(false);
  const [filter, setFilter] = useState({
    role: 'all',
    track: 'all',
    chapter: 'all',
  });
  // State for modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Load alumni preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('pgi-show-alumni');
    if (savedPreference !== null) {
      setShowAlumni(savedPreference === 'true');
    }
  }, []);

  // Save alumni preference to localStorage
  useEffect(() => {
    localStorage.setItem('pgi-show-alumni', String(showAlumni));
  }, [showAlumni]);

  // Update debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filtered users with alumni filter
  const filteredUsers = useMemo(() => {
    console.log('Recomputing filtered users');
    let filtered = filterUsers(users, debouncedSearchTerm, filter);

    // Apply alumni filter
    if (!showAlumni) {
      filtered = filtered.filter(user => !user.personal?.isAlumni);
    }

    return filtered;
  }, [users, debouncedSearchTerm, filter, showAlumni]);

  // Filter handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((type: string, value: string) => {
    setFilter(prev => ({ ...prev, [type]: value }));
  }, []);

  // Calculate counts for badges
  const alumniCount = users.filter(user => user.personal?.isAlumni).length;
  const hasActiveFilters =
    filter.role !== 'all' ||
    filter.track !== 'all' ||
    searchTerm ||
    !showAlumni;

  // Modal open/close functions
  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Clear selected user after animation completes
    setTimeout(() => setSelectedUser(null), 300);
  };

  // Fetch users and chapters with optimistic loading
  useEffect(() => {
    if (isLoading || !supabaseUser) {
      console.log('[Directory] User not loaded yet, skipping data fetch');
      return;
    }

    const fetchData = async () => {
      console.log('[Directory] Starting data fetch with filters:', filter);

      // Check for cached data and show it immediately (optimistic loading)
      const cachedData = sessionStorage.getItem('pgi-directory-cache');
      if (cachedData && loading) {
        try {
          const parsed = JSON.parse(cachedData);
          setUsers(parsed.users || []);
          setChapters(parsed.chapters || []);
          setLoading(false);
          setRefreshing(true); // Show subtle refresh indicator
          console.log(
            '[Directory] Loaded cached data, fetching fresh data in background'
          );
        } catch {
          console.warn('[Directory] Failed to parse cached data');
        }
      }

      try {
        if (!cachedData) {
          setLoading(true);
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filter.role !== 'all') {
          queryParams.append('permissionLevel', filter.role);
        }
        if (filter.track !== 'all') {
          queryParams.append('track', filter.track);
        }

        const queryString = queryParams.toString();
        console.log(
          `[Directory] Fetching users with query: ${
            queryString || '(no filters)'
          }`
        );

        // Fetch users with combined payload (includes chapters)
        const usersResponse = await fetch(`/api/users?${queryString}`, {
          // Let the server handle caching with ISR
          next: { revalidate: 60 },
        });

        console.log(
          `[Directory] Users API response status: ${usersResponse.status}`
        );

        if (!usersResponse.ok) {
          const errorText = await usersResponse
            .text()
            .catch(() => 'Could not read response');
          console.error(
            `[Directory] API error ${usersResponse.status}:`,
            errorText
          );
          throw new Error(`API error: ${usersResponse.status}`);
        }

        const data = await usersResponse.json();
        console.log(`[Directory] Raw API response:`, data);

        if (!data.success || !Array.isArray(data.users)) {
          console.error(
            '[Directory] API response success=false or invalid users array:',
            data
          );
          throw new Error(data.error || 'Failed to fetch users');
        }

        console.log(`[Directory] Received ${data.users.length} users from API`);

        // Validate user data structure
        const validUsers = data.users.filter((user: any) => {
          const isValid = user && user.id;
          if (!isValid) {
            console.warn('[Directory] Filtered out invalid user object:', user);
          }
          return isValid;
        });

        if (validUsers.length !== data.users.length) {
          console.warn(
            `[Directory] Filtered out ${
              data.users.length - validUsers.length
            } invalid user objects`
          );
        }

        setUsers(validUsers);

        // Update chapters if provided in response
        if (data.chapters && Array.isArray(data.chapters)) {
          setChapters(data.chapters);
        }

        // Cache the data for optimistic loading on next visit
        sessionStorage.setItem(
          'pgi-directory-cache',
          JSON.stringify({
            users: validUsers,
            chapters: data.chapters || chapters,
            timestamp: data.timestamp || new Date().toISOString(),
          })
        );

        console.log(
          `[Directory] Users state updated with ${validUsers.length} users`
        );
        setError('');
      } catch (err: any) {
        console.error('[Directory] Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        console.log('[Directory] Fetch completed');
      }
    };

    fetchData();
  }, [supabaseUser, filter.role, filter.track]);

  // Helper functions for display formatting
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      lead: 'Chapter Lead',
      member: 'Member',
    };
    return roleMap[role] || role;
  };

  const getTrackRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      QuantitativeResearchCommittee: 'Quant Research Committee',
      QuantitativeAnalyst: 'Analyst',
      InvestmentCommittee: 'Investment Committee',
      ValueAnalyst: 'Analyst',
      PortfolioManager: 'Portfolio Manager',
    };
    return roleMap[role] || role || 'Analyst';
  };

  const getExecRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      chairman: 'Chairman',
      ceo: 'Chief Executive Officer',
      coo: 'Chief Operating Officer',
      cio: 'Chief Investment Officer',
      cqr: 'Chief Quantitative Researcher',
      cto: 'Chief Technology Officer',
      'Chapter Founder': 'Founder',
      Founder: 'PGI Founder',
      'Alumni Board': 'Alumni Board',
    };
    return roleMap[role] || role;
  };

  // Get chapter name helper
  const getChapterName = (user: User) => {
    if (user.org?.chapterId) {
      const chapter = chapters.find(
        (c: any) => c._id === user.org.chapterId || c.id === user.org.chapterId
      );
      return chapter?.name || 'Unknown Chapter';
    }
    return 'No Chapter';
  };

  // Get display role for a user (prioritize exec role over permission level)
  const getDisplayRole = (user: User) => {
    if (user.org?.execRoles && user.org.execRoles.length > 0) {
      return getExecRoleDisplayName(user.org.execRoles[0]);
    }
    return getRoleDisplayName(user.org?.permissionLevel || 'member');
  };

  // Minimal member cards
  const renderUserCards = () => {
    if (filteredUsers.length === 0) {
      console.log('[Directory] No users match the filters', {
        totalUsers: users.length,
        searchTerm: debouncedSearchTerm,
        filters: filter,
      });
      return (
        <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500">
          <div className="flex flex-col items-center">
            <FaUsers className="text-gray-300 text-5xl mb-4" />
            <p className="text-lg font-medium mb-2">No members found</p>
            <p className="max-w-md mx-auto">
              {debouncedSearchTerm
                ? `No members match "${debouncedSearchTerm}" with the current filters.`
                : 'Try adjusting your filters to find members.'}
            </p>

            {(filter.role !== 'all' ||
              filter.track !== 'all' ||
              filter.chapter !== 'all' ||
              !showAlumni) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setFilter({ role: 'all', track: 'all', chapter: 'all' });
                  setSearchTerm('');
                  setShowAlumni(false);
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      );
    }

    console.log(`[Directory] Rendering ${filteredUsers.length} user cards`);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <Card
            key={user.id}
            className="border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer text-navy overflow-hidden group"
            onClick={() => openModal(user)}
          >
            <CardContent className="p-5">
              {/* Line 1: Avatar + Name */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    user.profile?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.personal?.name || 'User'
                    )}&background=random`
                  }
                  alt={user.personal?.name || 'User'}
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-primary transition-colors"
                />
                <div className="flex-1 min-w-0 text-sm">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {user.personal?.name || 'Unnamed User'}
                  </h3>
                  <span
                    className={`font-medium ${user.org?.track === 'quant' ? 'text-blue-600' : 'text-purple-600'}`}
                  >
                    {user.org?.track
                      ? user.org.track === 'quant'
                        ? 'Quant'
                        : 'Value'
                      : 'No Track'}
                  </span>
                  <span className="mx-1.5 text-gray-400">/</span>
                  <span className="font-medium text-gray-700">
                    {getDisplayRole(user)}
                  </span>
                  {user.personal?.isAlumni && (
                    <span className="text-xs text-blue-600 font-medium">
                      Alumni
                    </span>
                  )}
                </div>
              </div>

              {/* Line 3: University | Major | Grad Year */}
              <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium">{getChapterName(user)}</span>
                {user.personal?.major && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>{user.personal.major}</span>
                  </>
                )}
                {user.personal?.gradYear && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>Class of {user.personal.gradYear}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // User Detail Modal Component - Styled like TickerDetailModal
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    // Determine gradient based on track
    const gradientClass =
      selectedUser.org?.track === 'quant'
        ? 'from-blue-600 via-blue-700 to-indigo-800'
        : 'from-purple-600 via-purple-700 to-indigo-800';

    return (
      <AnimatePresence>
        {isModalOpen && (
          <>
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] z-[101]"
                onClick={e => e.stopPropagation()}
              >
                {/* Hero Header */}
                <div
                  className={`relative bg-gradient-to-br ${gradientClass} p-8 text-white`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                  >
                    <FaTimes size={16} />
                  </Button>

                  <div className="flex items-start gap-6">
                    <img
                      src={
                        selectedUser.profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedUser.personal.name || 'User'
                        )}&background=random`
                      }
                      alt={selectedUser.personal.name || 'User'}
                      className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white/30 shadow-xl"
                    />

                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        {selectedUser.personal.name || 'Unnamed User'}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-white/90 text-sm font-medium">
                          {selectedUser.org?.track
                            ? selectedUser.org.track === 'quant'
                              ? 'Quant'
                              : 'Value'
                            : 'No Track'}
                        </span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/90 text-sm font-medium">
                          {getDisplayRole(selectedUser)}
                        </span>
                        {selectedUser.personal?.isAlumni && (
                          <>
                            <span className="text-white/60">•</span>
                            <Badge className="bg-white/20 text-white border-white/30">
                              Alumni
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">
                        {getChapterName(selectedUser)}
                        {selectedUser.personal?.major &&
                          ` • ${selectedUser.personal.major}`}
                        {selectedUser.personal?.gradYear &&
                          ` • Class of ${selectedUser.personal.gradYear}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-240px)] bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Contact & Bio */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <FaEnvelope className="text-primary" size={18} />
                          Contact Information
                        </h3>

                        <div className="space-y-3">
                          {selectedUser.personal.email && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                                Email
                              </p>
                              <p
                                className="text-gray-800 text-sm cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    selectedUser.personal.email || ''
                                  );
                                  alert('Email copied to clipboard!');
                                }}
                              >
                                {selectedUser.personal.email}
                              </p>
                            </div>
                          )}

                          {selectedUser.personal.phone && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                                Phone
                              </p>
                              <p
                                className="text-gray-800 text-sm cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    selectedUser.personal.phone || ''
                                  );
                                  alert('Phone copied to clipboard!');
                                }}
                              >
                                {selectedUser.personal.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {selectedUser.personal.bio && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            Bio
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedUser.personal.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Professional */}
                    <div className="space-y-6">
                      {/* Links */}
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Professional Links
                        </h3>
                        <div className="space-y-2">
                          {selectedUser.profile?.linkedin && (
                            <a
                              href={
                                selectedUser.profile.linkedin.startsWith('http')
                                  ? selectedUser.profile.linkedin
                                  : `https://linkedin.com/in/${selectedUser.profile.linkedin}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-blue-600 hover:bg-blue-50 transition-colors p-3 rounded-lg border border-transparent hover:border-blue-200"
                            >
                              <FaLinkedin size={18} />
                              <span className="font-medium text-sm">
                                LinkedIn Profile
                              </span>
                            </a>
                          )}

                          {selectedUser.profile?.github && (
                            <a
                              href={
                                selectedUser.profile.github.startsWith('http')
                                  ? selectedUser.profile.github
                                  : `https://github.com/${selectedUser.profile.github}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-gray-800 hover:bg-gray-50 transition-colors p-3 rounded-lg border border-transparent hover:border-gray-200"
                            >
                              <FaGithub size={18} />
                              <span className="font-medium text-sm">
                                GitHub Profile
                              </span>
                            </a>
                          )}

                          {selectedUser.profile?.resumeUrl && (
                            <a
                              href={selectedUser.profile.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors p-3 rounded-lg border border-transparent hover:border-red-200"
                            >
                              <FaFile size={18} />
                              <span className="font-medium text-sm">
                                View Resume
                              </span>
                            </a>
                          )}

                          {!selectedUser.profile?.linkedin &&
                            !selectedUser.profile?.github &&
                            !selectedUser.profile?.resumeUrl && (
                              <p className="text-gray-400 italic text-sm py-2">
                                No professional links provided
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">
                          Skills
                        </h3>
                        {selectedUser.profile?.skills &&
                        selectedUser.profile.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.profile.skills.map((skill, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="bg-gray-100 text-gray-700 border-gray-300"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic text-sm">
                            No skills listed
                          </p>
                        )}
                      </div>

                      {/* Roles */}
                      {(selectedUser.org?.trackRoles &&
                        selectedUser.org.trackRoles.length > 0) ||
                      (selectedUser.org?.execRoles &&
                        selectedUser.org.execRoles.length > 0) ? (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            Roles & Responsibilities
                          </h3>
                          <div className="space-y-2">
                            {selectedUser.org?.execRoles &&
                              selectedUser.org.execRoles.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                                    Executive Roles
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedUser.org.execRoles.map(
                                      (role, i) => (
                                        <Badge
                                          key={i}
                                          variant="destructive"
                                          className="font-medium"
                                        >
                                          {getExecRoleDisplayName(role)}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {selectedUser.org?.trackRoles &&
                              selectedUser.org.trackRoles.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 uppercase font-medium mb-2 mt-3">
                                    Track Roles
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedUser.org.trackRoles.map(
                                      (role, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="bg-blue-50 text-blue-700 border-blue-300"
                                        >
                                          {getTrackRoleDisplayName(role)}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Loading state
  if (isLoading || !supabaseUser) {
    return null; // Let layout handle loading
  }

  // Export function
  const exportToCSV = () => {
    try {
      const headers = [
        'Name',
        'Email',
        'Role',
        'Track',
        'Chapter',
        'Major',
        'Grad Year',
        'Status',
        'Track Roles',
        'Exec Roles',
        'Alumni',
      ];
      const rows = filteredUsers.map(user => [
        user.personal?.name || '',
        user.personal?.email || '',
        user.org?.permissionLevel || '',
        user.org?.track || '',
        getChapterName(user),
        user.personal?.major || '',
        user.personal?.gradYear || '',
        user.org?.status || '',
        user.org?.trackRoles?.join('; ') || '',
        user.org?.execRoles?.join('; ') || '',
        user.personal?.isAlumni ? 'Yes' : 'No',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `pgi-directory-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Before returning JSX, add a final log
  console.log(
    `[Directory] Rendering with ${filteredUsers.length} filtered users, loading=${loading}`
  );

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-20 lg:pt-0 text-pgi-dark-blue"
      >
        {/* Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Member Directory
            </h1>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!isLoading &&
              supabaseUserData?.org_permission_level === 'admin' && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-2"
                  asChild
                >
                  <Link href="/portal/dashboard/directory/admin">
                    <FaUsers className="w-4 h-4" />
                    Manage Users
                  </Link>
                </Button>
              )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
              disabled={filteredUsers.length === 0}
            >
              <FaFile className="w-3 h-3" />
              Export CSV
            </Button>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
              {filteredUsers.length} of {users.length} members
            </div>
          </div>
        </motion.div> */}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, email, or skills..."
              className="pl-10 pr-4 w-full bg-white border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Compact Filter Bar */}
          <div className="items-center gap-2 flex-wrap hidden md:flex">
            {/* Role Filter - Hidden on mobile */}
            <Select
              value={filter.role}
              onValueChange={value => handleFilterChange('role', value)}
            >
              <SelectTrigger className="hidden md:flex h-9 w-[140px] text-sm bg-white border-gray-300">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>

            {/* Track Filter - Hidden on mobile */}
            <Select
              value={filter.track}
              onValueChange={value => handleFilterChange('track', value)}
            >
              <SelectTrigger className="hidden md:flex h-9 w-[140px] text-sm bg-white border-gray-300">
                <SelectValue placeholder="Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                <SelectItem value="quant">Quant</SelectItem>
                <SelectItem value="value">Value</SelectItem>
              </SelectContent>
            </Select>

            {/* Alumni Toggle - Hidden on mobile */}
            <Button
              variant={showAlumni ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAlumni(!showAlumni)}
              className="hidden md:flex h-9 text-sm"
            >
              {showAlumni ? `Alumni (${alumniCount})` : 'Show Alumni'}
            </Button>

            {/* Reset - Hidden on mobile */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter({ role: 'all', track: 'all', chapter: 'all' });
                  setSearchTerm('');
                  setShowAlumni(false);
                }}
                className="hidden md:flex h-9 text-sm text-gray-600 hover:text-gray-900"
              >
                <FaTimes className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}

            {/* Results Count */}
            <div className="flex items-center ml-auto gap-2 md:gap-3 flex-wrap">
              {!isLoading &&
                supabaseUserData?.org_permission_level === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center gap-2"
                    asChild
                  >
                    <Link href="/portal/dashboard/directory/admin">
                      <FaUsers className="w-4 h-4" />
                      Manage Users
                    </Link>
                  </Button>
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2 text-xs md:text-sm"
                disabled={filteredUsers.length === 0}
              >
                <FaDownload className="w-3 h-3" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1.5 rounded-md">
                {filteredUsers.length} of {users.length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Members List */}
        <div>
          {loading ? (
            // Loading skeletons
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <Card key={n} className="overflow-hidden animate-pulse">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : error ? (
            // Error message
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800"
            >
              <h3 className="font-semibold mb-2">Error Loading Directory</h3>
              <p className="text-sm">{error}</p>
            </motion.div>
          ) : (
            renderUserCards()
          )}
        </div>

        {/* User Detail Modal */}
        <UserDetailModal />
      </SmoothTransition>
    </ProtectedPage>
  );
}

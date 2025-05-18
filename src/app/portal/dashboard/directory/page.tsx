'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  FaSearch,
  FaGraduationCap,
  FaLinkedin,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaFile,
  FaTimes,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

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

// Define badge variant types for type safety
type BadgeVariant =
  | 'outline'
  | 'destructive'
  | 'amber'
  | 'default'
  | 'secondary'
  | 'blue'
  | 'purple'
  | 'teal';

// Add hardcoded sample users for demo/fallback purposes
const sampleUsers: User[] = [
  {
    id: 'sample-user-1',
    personal: {
      name: 'John Smith',
      email: 'john.smith@university.edu',
      bio: 'Quantitative analyst specializing in algorithmic trading strategies and machine learning applications in finance.',
      major: 'Computer Science',
      gradYear: 2024,
      isAlumni: false,
      phone: '+1 (555) 123-4567',
    },
    org: {
      permissionLevel: 'member',
      track: 'quant',
      trackRoles: ['QuantitativeAnalyst'],
      execRoles: [],
      status: 'active',
    },
    profile: {
      skills: ['Python', 'Machine Learning', 'Algorithmic Trading'],
      linkedin: 'https://linkedin.com/in/johnsmith',
      github: 'https://github.com/johnsmith',
      avatarUrl: '',
      resumeUrl: '',
    },
    system: {
      firstLogin: false,
    },
  },
  {
    id: 'sample-user-2',
    personal: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      bio: 'Value investor focused on fundamental analysis of undervalued companies in the technology sector.',
      major: 'Finance',
      gradYear: 2023,
      isAlumni: false,
    },
    org: {
      permissionLevel: 'lead',
      track: 'value',
      trackRoles: ['InvestmentCommittee'],
      execRoles: [],
      status: 'active',
    },
    profile: {
      skills: ['Valuation', 'Financial Modeling', 'Industry Analysis'],
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      avatarUrl: '',
      resumeUrl: '',
      github: '',
    },
    system: {
      firstLogin: false,
    },
  },
  {
    id: 'sample-user-3',
    personal: {
      name: 'Michael Chen',
      email: 'michael.chen@university.edu',
      bio: 'Administrative lead with expertise in organizational management and leadership for investment clubs.',
      major: 'Business Administration',
      gradYear: 2022,
      isAlumni: true,
    },
    org: {
      permissionLevel: 'admin',
      track: 'value',
      trackRoles: ['PortfolioManager'],
      execRoles: ['cio'],
      status: 'active',
    },
    profile: {
      skills: ['Portfolio Management', 'Leadership', 'Strategic Planning'],
      linkedin: 'https://linkedin.com/in/michaelchen',
      avatarUrl: '',
      resumeUrl: '',
      github: '',
    },
    system: {
      firstLogin: false,
    },
  },
];

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
  const { isLoaded, user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chapters, setChapters] = useState<{ _id: string; name: string }[]>([]);
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

  // Update debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filtered users
  const filteredUsers = useMemo(() => {
    console.log('Recomputing filtered users');
    return filterUsers(users, debouncedSearchTerm, filter);
  }, [users, debouncedSearchTerm, filter]);

  // Memoize the search handler
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize the filter handler
  const handleFilterChange = useCallback((type: string, value: string) => {
    setFilter(prev => ({ ...prev, [type]: value }));
  }, []);

  // Replace the search input with this optimized version
  const SearchInput = useMemo(
    () => (
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search members by name, email, bio, or skills..."
          className="pl-10 w-full text-gray-900 bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
    ),
    [searchTerm, handleSearch]
  );

  // Replace the filter selects with these optimized versions
  const FilterSelects = useMemo(
    () => (
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="w-full md:w-auto">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <Select
            value={filter.role}
            onValueChange={value => handleFilterChange('role', value)}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-500">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="lead">Chapter Lead</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto">
          <label
            htmlFor="track"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Track
          </label>
          <Select
            value={filter.track}
            onValueChange={value => handleFilterChange('track', value)}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md">
              <SelectValue placeholder="Select track" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-500">
              <SelectItem value="all">All Tracks</SelectItem>
              <SelectItem value="quant">Quantitative</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto opacity-50">
          <label
            htmlFor="chapter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Chapter (Coming Soon)
          </label>
          <Select
            value={filter.chapter}
            onValueChange={value => handleFilterChange('chapter', value)}
            disabled={true}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md">
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-500">
              <SelectItem value="all">All Chapters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-auto md:ml-auto md:self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilter({ role: 'all', track: 'all', chapter: 'all' });
              setSearchTerm('');
            }}
            className="mt-4 md:mt-0"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    ),
    [filter, handleFilterChange]
  );

  console.log('[Directory] Component rendering with state:', {
    usersCount: users.length,
    loading,
    hasError: !!error,
    filters: filter,
    searchTerm,
  });

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

  // Fetch users and chapters
  useEffect(() => {
    if (!isLoaded) {
      console.log('[Directory] Clerk not loaded yet, skipping data fetch');
      return;
    }

    const fetchData = async () => {
      console.log('[Directory] Starting data fetch with filters:', filter);
      try {
        setLoading(true);

        // Fetch chapters
        console.log('[Directory] Fetching chapters');
        const chaptersResponse = await fetch('/api/chapters');
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          console.log(
            `[Directory] Loaded ${chaptersData.length} chapters:`,
            chaptersData
          );
          setChapters(chaptersData);
        } else {
          console.error(
            '[Directory] Failed to load chapters:',
            chaptersResponse.status
          );
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (filter.role !== 'all') {
          queryParams.append('org.permissionLevel', filter.role);
        }
        if (filter.track !== 'all') {
          queryParams.append('org.track', filter.track);
        }

        const queryString = queryParams.toString();
        console.log(
          `[Directory] Fetching users with query: ${
            queryString || '(no filters)'
          }`
        );

        // Fetch users with no-cache to ensure fresh data
        const usersResponse = await fetch(`/api/users?${queryString}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        console.log(
          `[Directory] Users API response status: ${usersResponse.status}`
        );

        if (!usersResponse.ok) {
          const errorText = await usersResponse
            .text()
            .catch(e => 'Could not read response');
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

        // If no users are returned from the API, use the sample users
        if (validUsers.length === 0) {
          console.log(
            '[Directory] No users found in API response, using sample users'
          );
          setUsers(sampleUsers);
        } else {
          setUsers(validUsers);
        }

        console.log(
          `[Directory] Users state updated with ${
            validUsers.length || sampleUsers.length
          } users`
        );
      } catch (err: any) {
        console.error('[Directory] Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please try again.');
        // Even if there's an error, show sample users
        console.log('[Directory] Using sample users due to API error');
        setUsers(sampleUsers);
      } finally {
        setLoading(false);
        console.log('[Directory] Fetch completed, loading set to false');
      }
    };

    fetchData();
  }, [isLoaded, filter.role, filter.track]);

  // Helper functions for display formatting
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      lead: 'Chapter Lead',
      member: 'Member',
    };
    return roleMap[role] || role;
  };

  const getTrackDisplayName = (track?: string) => {
    if (!track) return 'No Track';

    const trackMap: Record<string, string> = {
      quant: 'Quant',
      value: 'Value',
    };
    return trackMap[track] || track;
  };

  const getRoleBadgeVariant = (role: string): BadgeVariant => {
    const variantMap: Record<string, BadgeVariant> = {
      admin: 'destructive',
      lead: 'amber',
      member: 'default',
    };
    return variantMap[role] || 'outline';
  };

  const getTrackBadgeVariant = (track?: string): BadgeVariant => {
    if (!track) return 'secondary';

    const variantMap: Record<string, BadgeVariant> = {
      quant: 'blue',
      value: 'purple',
    };
    return variantMap[track] || 'secondary';
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

  const getExecRoleBadgeVariant = (role: string): BadgeVariant => {
    const variantMap: Record<string, BadgeVariant> = {
      chairman: 'destructive',
      ceo: 'amber',
      coo: 'blue',
      cio: 'purple',
      cqr: 'teal',
      cto: 'secondary',
      'Chapter Founder': 'secondary',
      Founder: 'blue',
      'Alumni Board': 'secondary',
    };
    return variantMap[role] || 'outline';
  };

  // Modify the component to always check for sample users when rendering:
  const renderUserCards = () => {
    // Always ensure there are users to display
    const displayUsers = users.length > 0 ? users : sampleUsers;

    // Apply filters to whatever users we have
    const displayFilteredUsers = displayUsers.filter(user => {
      // Search filter (name or email)
      const nameMatch =
        user.personal?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      const emailMatch =
        user.personal?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) || false;
      const searchMatch = searchTerm === '' || nameMatch || emailMatch;

      // Role filter
      const roleMatch =
        filter.role === 'all' || user.org?.permissionLevel === filter.role;

      // Track filter
      const trackMatch =
        filter.track === 'all' || user.org?.track === filter.track;

      // Chapter filter
      const chapterMatch = filter.chapter === 'all';

      return searchMatch && roleMatch && trackMatch && chapterMatch;
    });

    if (displayFilteredUsers.length === 0) {
      console.log('[Directory] No users match the filters', {
        totalUsers: displayUsers.length,
        searchTerm,
        filters: filter,
      });
      return (
        <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500 text-navy">
          <div className="flex flex-col items-center">
            <FaUsers className="text-gray-300 text-5xl mb-4" />
            <p className="text-lg font-medium mb-2">No members found</p>
            <p className="max-w-md mx-auto">
              {searchTerm
                ? `No members match "${searchTerm}" with the current filters.`
                : 'Try adjusting your filters to find members.'}
            </p>

            {(filter.role !== 'all' ||
              filter.track !== 'all' ||
              filter.chapter !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  setFilter({ role: 'all', track: 'all', chapter: 'all' })
                }
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      );
    }

    console.log(
      `[Directory] Rendering ${displayFilteredUsers.length} user cards`
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayFilteredUsers.map(user => (
          <Card
            key={user.id}
            className="h-full border border-gray-200 hover:border-primary transition-colors duration-300 cursor-pointer text-navy"
            onClick={() => openModal(user)}
          >
            <CardHeader className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={
                      user.profile?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.personal?.name || 'User'
                      )}&background=random`
                    }
                    alt={user.personal?.name || 'User'}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm font-medium text-gray-900">
                      {user.personal?.name || 'Unnamed User'}
                    </CardTitle>
                    {user.personal?.isAlumni && (
                      <div className="text-xs text-blue-500">Alumni</div>
                    )}
                  </div>
                  <CardDescription className="text-sm text-gray-500 truncate">
                    {user.personal?.email || 'No email'}
                  </CardDescription>

                  <div className="flex gap-1 flex-wrap mt-2">
                    <Badge
                      variant={getRoleBadgeVariant(
                        user.org?.permissionLevel || 'member'
                      )}
                    >
                      {getRoleDisplayName(
                        user.org?.permissionLevel || 'member'
                      )}
                    </Badge>
                    {/* Show track roles */}
                    {user.org?.trackRoles && user.org.trackRoles.length > 0 && (
                      <div className="flex gap-1 flex-wrap ">
                        {user.org.trackRoles.map((role, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-gray-50 text-xs text-gray-500"
                          >
                            {getTrackRoleDisplayName(role)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {/* Display execRoles if they exist */}
                    {user.org?.execRoles && user.org.execRoles.length > 0 && (
                      <>
                        {user.org.execRoles.map(role => (
                          <Badge
                            key={role}
                            variant={getExecRoleBadgeVariant(role)}
                            className="text-xs"
                          >
                            {getExecRoleDisplayName(role)}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Bio - truncated on card */}
              {user.personal?.bio && (
                <div className="mt-2 mb-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {user.personal.bio}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
              <div className="flex gap-2 items-center">
                {user.personal?.gradYear && (
                  <span>Class of {user.personal.gradYear}</span>
                )}
                {user.org?.track && (
                  <Badge variant={getTrackBadgeVariant(user.org.track)}>
                    {getTrackDisplayName(user.org.track)}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-500"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // User Detail Modal Component
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center p-4 text-navy"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] z-50"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                  >
                    <FaTimes size={18} />
                  </Button>

                  <div className="flex items-center gap-6">
                    <img
                      src={
                        selectedUser.profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedUser.personal.name || 'User'
                        )}&background=random`
                      }
                      alt={selectedUser.personal.name || 'User'}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                    />

                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {selectedUser.personal.name || 'Unnamed User'}
                      </h2>
                      <p className="text-blue-100">
                        {getRoleDisplayName(selectedUser.org.permissionLevel)}
                        {selectedUser.org.execRoles &&
                          selectedUser.org.execRoles.map(
                            (role, idx) => ` • ${getExecRoleDisplayName(role)}`
                          )}
                        {selectedUser.org.track &&
                          ` • ${getTrackDisplayName(selectedUser.org.track)}`}
                        {selectedUser.org.trackRoles &&
                          selectedUser.org.trackRoles.map(
                            (role, idx) => ` • ${getTrackRoleDisplayName(role)}`
                          )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Personal Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                        Personal
                      </h3>

                      <div className="space-y-4">
                        {selectedUser.personal.email && (
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-500">
                              <FaEnvelope size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p
                                className="text-gray-800 cursor-pointer hover:underline"
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
                          </div>
                        )}

                        {selectedUser.personal.phone && (
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-500">
                              <FaPhone size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p
                                className="text-gray-800 cursor-pointer hover:underline"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    selectedUser.personal.phone || ''
                                  );
                                  alert('Phone number copied to clipboard!');
                                }}
                              >
                                {selectedUser.personal.phone}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedUser.personal.major && (
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-500">
                              <FaGraduationCap size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Education</p>
                              <p className="text-gray-800">
                                {selectedUser.personal.major}
                                {selectedUser.personal.gradYear &&
                                  ` • Class of ${selectedUser.personal.gradYear}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bio Section */}
                      {selectedUser.personal.bio && (
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            Bio
                          </h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {selectedUser.personal.bio}
                          </p>
                        </div>
                      )}
                      {!selectedUser.personal.bio && (
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            Bio
                          </h4>
                          <p className="text-gray-400 italic">
                            No bio provided.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Professional Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                        Professional
                      </h3>

                      <div className="space-y-4">
                        {/* Chapter */}
                        {selectedUser.org.chapterId && (
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-full text-amber-500">
                              <FaUsers size={16} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Chapter</p>
                              <p className="text-gray-800">
                                ID: {selectedUser.org.chapterId}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Links Section */}
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            Links
                          </h4>
                          <div className="space-y-2">
                            {selectedUser.profile?.linkedin && (
                              <a
                                href={`https://linkedin.com/in/${selectedUser.profile.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-2 bg-gray-50 rounded"
                              >
                                <FaLinkedin size={16} />
                                <span>LinkedIn</span>
                              </a>
                            )}

                            {selectedUser.profile?.github && (
                              <a
                                href={`https://github.com/${selectedUser.profile.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors p-2 bg-gray-50 rounded"
                              >
                                <FaGithub size={16} />
                                <span>GitHub</span>
                              </a>
                            )}

                            {selectedUser.profile?.resumeUrl && (
                              <a
                                href={selectedUser.profile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors p-2 bg-gray-50 rounded"
                              >
                                <FaFile size={16} />
                                <span>Resume</span>
                              </a>
                            )}
                            {/* Fallback if no links */}
                            {!selectedUser.profile?.linkedin &&
                              !selectedUser.profile?.github &&
                              !selectedUser.profile?.resumeUrl && (
                                <p className="text-gray-400 italic">
                                  No professional links provided.
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Skills */}
                        {selectedUser.profile?.skills &&
                          selectedUser.profile.skills.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-md font-medium text-gray-700 mb-2">
                                Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedUser.profile.skills.map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="bg-gray-100 text-gray-700"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        {(!selectedUser.profile?.skills ||
                          selectedUser.profile.skills.length === 0) && (
                          <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-700 mb-2">
                              Skills
                            </h4>
                            <p className="text-gray-400 italic">
                              No skills listed.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                  <Button variant="destructive" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Loading state
  if (!isLoaded) {
    return null; // Let layout handle loading
  }

  // Before returning JSX, add a final log
  console.log(
    `[Directory] Rendering with ${filteredUsers.length} filtered users, loading=${loading}`
  );

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0 text-navy"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-gray-800">Member Directory</h1>
          <div className="flex items-center gap-4">
            {isLoaded && user?.publicMetadata?.role === 'admin' && (
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
            <div className="text-sm text-gray-500">
              Found: {users.length} members
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="mb-4">{SearchInput}</div>
          {FilterSelects}
        </motion.div>

        {/* Members List */}
        <div>
          {loading ? (
            // Loading skeletons
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <Card key={n} className="overflow-hidden animate-pulse">
                  <CardHeader className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : error ? (
            // Error message
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 p-4 rounded-lg text-red-800"
            >
              {error}
            </motion.div>
          ) : users.length === 0 ? (
            // If no users were found in the API response, show sample users
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleUsers.slice(0, 2).map(user => (
                <Card
                  key={user.id}
                  className="h-full border border-gray-200 hover:border-primary transition-colors duration-300 cursor-pointer"
                >
                  <CardHeader className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.personal?.name || 'User'
                          )}&background=random`}
                          alt={user.personal?.name || 'User'}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-gray-900">
                          {user.personal?.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 truncate">
                          {user.personal?.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant={getRoleBadgeVariant(
                          user.org?.permissionLevel || 'member'
                        )}
                      >
                        {getRoleDisplayName(
                          user.org?.permissionLevel || 'member'
                        )}
                      </Badge>
                      <Badge variant={getTrackBadgeVariant(user.org?.track)}>
                        {getTrackDisplayName(user.org?.track)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 col-span-1 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  User Data Loading
                </h3>
                <p className="text-sm text-yellow-700">
                  The system is currently displaying sample user cards while
                  real user data is loading or being set up.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  If this persists, there may be an issue with the database
                  connection or the user API.
                </p>
              </div>
            </div>
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

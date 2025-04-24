"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FaSearch,
  FaFilter,
  FaGraduationCap,
  FaLinkedin,
  FaBriefcase,
} from "react-icons/fa";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { motion } from "framer-motion";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { SmoothTransition } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  track: string;
  chapter: string;
  isManager: boolean;
  isAlumni: boolean;
  avatarUrl?: string;
  skills?: string[];
  bio?: string;
  linkedin?: string;
  gradYear?: number;
}

export default function DirectoryPage() {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chapters, setChapters] = useState<{ _id: string; name: string }[]>([]);
  const [filter, setFilter] = useState({
    role: "all",
    track: "all",
    chapter: "all",
  });

  // Fetch users and chapters
  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch chapters
        const chaptersResponse = await fetch("/api/chapters");
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
        }

        // Fetch users from our MongoDB API with any applied filters
        const queryParams = new URLSearchParams();
        if (filter.role !== "all") queryParams.append("role", filter.role);
        if (filter.track !== "all") queryParams.append("track", filter.track);
        if (filter.chapter !== "all")
          queryParams.append("chapter", filter.chapter);

        const usersResponse = await fetch(`/api/users?${queryParams}`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.success && usersData.users) {
            setUsers(usersData.users);
          } else {
            throw new Error("Failed to fetch users");
          }
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, filter.role, filter.track, filter.chapter]);

  // Filter and search users
  const filteredUsers = users.filter((u) => {
    // Apply search term filter
    const searchMatch =
      searchTerm === "" ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply role filter
    const roleMatch = filter.role === "all" || u.role === filter.role;

    // Apply track filter
    const trackMatch = filter.track === "all" || u.track === filter.track;

    // Apply chapter filter
    const chapterMatch =
      filter.chapter === "all" || u.chapter === filter.chapter;

    return searchMatch && roleMatch && trackMatch && chapterMatch;
  });

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "lead":
        return "Chapter Lead";
      case "member":
        return "Member";
      default:
        return role;
    }
  };

  // Get track display name
  const getTrackDisplayName = (track: string) => {
    switch (track) {
      case "quant":
        return "Quantitative";
      case "value":
        return "Value";
      case "both":
        return "Both Tracks";
      default:
        return track || "Unknown Track";
    }
  };

  // Get track badge variant
  const getTrackBadgeVariant = (track: string) => {
    switch (track) {
      case "quant":
        return "blue";
      case "value":
        return "purple";
      case "both":
        return "teal";
      default:
        return "secondary";
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "lead":
        return "amber";
      case "member":
        return "default";
      default:
        return "outline";
    }
  };

  if (!isLoaded) {
    return null; // Let the layout handle loading
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-gray-800">Member Directory</h1>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search members by name or email..."
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Role Filter */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <Select
                value={filter.role}
                onValueChange={(value: string) =>
                  setFilter({ ...filter, role: value })
                }
              >
                <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-0">
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

            {/* Track Filter */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="track"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Track
              </label>
              <Select
                value={filter.track}
                onValueChange={(value: string) =>
                  setFilter({ ...filter, track: value })
                }
              >
                <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-0">
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-500">
                  <SelectItem value="all">All Tracks</SelectItem>
                  <SelectItem value="quant">Quantitative</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="both">Both Tracks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Filter */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="chapter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Chapter
              </label>
              <Select
                value={filter.chapter}
                onValueChange={(value: string) =>
                  setFilter({ ...filter, chapter: value })
                }
              >
                <SelectTrigger className="w-full md:w-[180px] bg-white text-gray-500 border-gray-300 border-2 rounded-md focus:border-primary focus:ring-primary focus:ring-2 focus:ring-offset-0">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-500">
                  <SelectItem value="all">All Chapters</SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter._id} value={chapter.name}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Members List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003E6B]"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 p-4 rounded-lg text-red-800"
          >
            {error}
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 p-12 rounded-xl text-center text-gray-500"
          >
            <p className="text-lg mb-2">No members found</p>
            <p>
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                variants={itemVariants}
                custom={index}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}&background=random`
                          }
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                          {user.isManager && (
                            <Badge variant="outline" className="ml-2">
                              Portfolio Manager
                            </Badge>
                          )}
                          {user.isAlumni && (
                            <Badge variant="outline" className="ml-2">
                              Alumni
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 truncate">
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      <Badge variant={getTrackBadgeVariant(user.track)}>
                        {getTrackDisplayName(user.track)}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <span className="font-medium">Chapter:</span>{" "}
                        {user.chapter}
                      </p>
                      {user.gradYear && (
                        <p className="flex items-center gap-1">
                          <FaGraduationCap
                            className="text-gray-400"
                            size={14}
                          />
                          <span className="font-medium">Class of:</span>{" "}
                          {user.gradYear}
                        </p>
                      )}
                    </div>
                    {user.skills && user.skills.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 3).map((skill, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-gray-100 text-gray-500"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100 text-gray-500"
                            >
                              +{user.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {user.linkedin && (
                    <CardFooter className="p-3 pt-0 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-500"
                        asChild
                      >
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaLinkedin className="mr-1" size={14} />
                          LinkedIn
                        </a>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </SmoothTransition>
    </ProtectedPage>
  );
}

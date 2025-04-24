"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  FaPlus,
  FaFilter,
  FaExternalLinkAlt,
  FaArrowRight,
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaGraduationCap,
  FaUniversity,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { SmoothTransition } from "@/components/ui/SmoothTransition";
import { Badge } from "@/components/ui";

// School abbreviations and official colors
const SCHOOL_COLORS: Record<string, { abbr: string; color: string }> = {
  NYU: { abbr: "NYU", color: "#57068c" }, // NYU Purple
  "Columbia University": { abbr: "Columbia", color: "#0072CE" }, // Columbia Blue
  "Brown University": { abbr: "Brown", color: "#4E3629" }, // Brown
  "Yale University": { abbr: "Yale", color: "#00356B" }, // Yale Blue
  "University of Chicago": { abbr: "UChicago", color: "#800000" }, // Maroon
  "Cornell University": { abbr: "Cornell", color: "#B31B1B" }, // Cornell Red
  "University of Pennsylvania": { abbr: "UPenn", color: "#011F5B" }, // Penn Blue
  "Harvard University": { abbr: "Harvard", color: "#A51C30" }, // Harvard Crimson
  "Princeton University": { abbr: "Princeton", color: "#F58025" }, // Princeton Orange
  "Stanford University": { abbr: "Stanford", color: "#8C1515" }, // Stanford Cardinal
  MIT: { abbr: "MIT", color: "#A31F34" }, // MIT Cardinal
  "California Institute of Technology": { abbr: "Caltech", color: "#FF6C0C" }, // Caltech Orange
};

// Function to get school abbreviation and color
const getSchoolInfo = (schoolName: string) => {
  const schoolData = SCHOOL_COLORS[schoolName] || {
    abbr: schoolName,
    color: "#003E6B",
  };

  // Function to determine if text should be white or black based on background color brightness
  const getTextColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  return {
    ...schoolData,
    textColor: getTextColor(schoolData.color),
  };
};

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

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  track: "quant" | "value" | "both";
  chapter: string;
  isPaid: boolean;
  isRemote: boolean;
  isClosed: boolean;
  applicationLink: string;
  applicationUrl?: string;
  schoolTargets?: string[];
  posterUrl?: string | null;
  companyLogoUrl?: string | null;
}

// Track color utility
const getTrackColor = (track: string) => {
  switch (track) {
    case "quant":
      return "bg-blue-500 hover:bg-blue-600";
    case "value":
      return "bg-purple-500 hover:bg-purple-600";
    case "both":
      return "bg-teal-500 hover:bg-teal-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

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

export default function InternshipsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [chapters, setChapters] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    track: "all",
    chapter: "all",
    showClosed: false,
  });
  const [filterOpen, setFilterOpen] = useState(false);

  // Get user metadata
  const userRole = (user?.publicMetadata?.role as string) || "member";
  const userTrack = (user?.publicMetadata?.track as string) || "value";

  // State for MongoDB user data
  const [mongoUser, setMongoUser] = useState<{
    role: string;
    track: string;
  } | null>(null);

  // Fetch MongoDB user data
  useEffect(() => {
    if (!isLoaded || !user) return;

    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          console.log("MongoDB user data:", data);
          setMongoUser({
            role: data.role || "member",
            track: data.track || "value",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching MongoDB user data:", err);
      });
  }, [isLoaded, user]);

  // Use MongoDB user role/track if available, otherwise use Clerk metadata
  const effectiveRole = mongoUser?.role || userRole;
  const effectiveTrack = mongoUser?.track || userTrack;

  // Fetch internships and chapters based on filters
  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(
          "Effective user role:",
          effectiveRole,
          "Effective track:",
          effectiveTrack
        );

        // Fetch chapters
        const chaptersResponse = await fetch("/api/chapters");
        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
        }

        // Build query parameters for internships
        const queryParams = new URLSearchParams();
        // Always include track parameter, even if it's "all"
        queryParams.set("track", filters.track);
        if (filters.chapter !== "all") {
          queryParams.set("chapter", filters.chapter);
        }
        queryParams.set("isClosed", filters.showClosed.toString());

        console.log("Fetching with params:", queryParams.toString());

        // Fetch internships
        const response = await fetch(`/api/internships?${queryParams}`);

        if (!response.ok) {
          throw new Error("Failed to fetch internships");
        }

        const data = await response.json();
        console.log(`Loaded ${data.length} internships:`, data);
        setInternships(data);

        // Log the tracks present in the result for debugging
        const trackCounts: Record<string, number> = {};
        data.forEach((i: Internship) => {
          trackCounts[i.track] = (trackCounts[i.track] || 0) + 1;
        });
        console.log("Client track distribution:", trackCounts);

        // Log school targets for debugging
        const hasSchoolTargets = data.filter(
          (i: Internship) => i.schoolTargets && i.schoolTargets.length > 0
        ).length;
        console.log(
          `Internships with school targets: ${hasSchoolTargets}/${data.length}`
        );
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, filters, effectiveRole, effectiveTrack]);

  // Function to force sync user data
  const forceUserSync = async () => {
    try {
      console.log("Forcing user data sync...");
      const response = await fetch("/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body is fine
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User sync result:", result);
        alert("User data synced successfully! Please refresh the page.");
      } else {
        console.error("Failed to sync user data");
        alert("Failed to sync user data. Please try again.");
      }
    } catch (error) {
      console.error("Error syncing user data:", error);
      alert("Error syncing user data. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Check if deadline has passed
  const isDeadlinePassed = (dateString: string) => {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const today = new Date();
    return deadline < today;
  };

  // Get application URL (use applicationUrl if available, otherwise applicationLink)
  const getApplicationUrl = (internship: Internship) => {
    return internship.applicationUrl || internship.applicationLink;
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003E6B]"></div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0"
      >
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Internship Board
          </motion.h1>

          {(userRole === "admin" || userRole === "lead") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ActionButton
                href="/portal/dashboard/internships/new"
                variant="navy-accent"
                icon={<FaPlus />}
                showPulse={!internships.length}
              >
                Add Internship
              </ActionButton>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaFilter className="text-[#003E6B] mr-2" />
              <h2 className="text-lg font-medium text-gray-800">Filters</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className="text-sm text-[#003E6B]"
            >
              {filterOpen ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Track Filter - Only shown to admins/leads */}
              {(effectiveRole === "admin" || effectiveRole === "lead") && (
                <div>
                  <label
                    htmlFor="track"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Track
                  </label>
                  <select
                    id="track"
                    value={filters.track}
                    onChange={(e) =>
                      setFilters({ ...filters, track: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                  >
                    <option value="all">All Tracks</option>
                    <option value="quant">Quantitative</option>
                    <option value="value">Value</option>
                    <option value="both">Both Tracks</option>
                  </select>
                </div>
              )}

              {/* Chapter Filter */}
              <div>
                <label
                  htmlFor="chapter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter
                </label>
                <select
                  id="chapter"
                  value={filters.chapter}
                  onChange={(e) =>
                    setFilters({ ...filters, chapter: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#003E6B] focus:border-[#003E6B]"
                >
                  <option value="all">All Chapters</option>
                  {chapters.map((chapter) => (
                    <option key={chapter._id} value={chapter.name}>
                      {chapter.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show Closed Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showClosed"
                  checked={filters.showClosed}
                  onChange={(e) =>
                    setFilters({ ...filters, showClosed: e.target.checked })
                  }
                  className="h-4 w-4 text-[#003E6B] focus:ring-[#003E6B] border-gray-300 rounded"
                />
                <label
                  htmlFor="showClosed"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Show Closed Internships
                </label>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Internships List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003E6B]"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center"
          >
            <FaTimes className="mr-2" /> {error}
          </motion.div>
        ) : internships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 p-12 rounded-xl text-center text-gray-500"
          >
            <FaInfoCircle className="mx-auto text-2xl mb-2 text-gray-400" />
            <p className="text-lg mb-2">No internships found</p>
            <p>
              Try adjusting your filters or check back later for new
              opportunities.
            </p>
          </motion.div>
        ) : (
          // Display cards instead of a table for better mobile experience
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {internships.map((internship, index) => (
              <motion.div
                key={internship._id}
                variants={itemVariants}
                custom={index}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden border h-full ${
                  internship.isClosed || isDeadlinePassed(internship.deadline)
                    ? "border-gray-200 opacity-75"
                    : "border-[#003E6B]/10"
                }`}
              >
                <div className="p-5 flex flex-col h-full">
                  {/* Chapter badge at top */}
                  <div className="flex items-center mb-2">
                    <div className="group relative">
                      {(() => {
                        const schoolInfo = getSchoolInfo(internship.chapter);
                        return (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 font-medium flex items-center gap-1 shadow-sm"
                            style={{
                              backgroundColor: schoolInfo.color,
                              border: `1px solid ${schoolInfo.color}88`,
                              color: schoolInfo.textColor,
                            }}
                          >
                            <FaUniversity
                              size={10}
                              style={{ color: schoolInfo.textColor }}
                            />
                            {schoolInfo.abbr}
                          </Badge>
                        );
                      })()}
                      <div className="absolute left-0 -bottom-10 w-48 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Posted by {internship.chapter} Chapter
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gray-100 mb-3"></div>

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {internship.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FaBuilding className="mr-1 text-gray-400" />
                        {internship.company}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <FaMapMarkerAlt className="mr-1 text-gray-400" />
                        {internship.location}
                        {internship.isRemote && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Remote
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FaCalendarAlt className="mr-1 text-gray-400" />
                        {formatDate(internship.deadline)}
                        {isDeadlinePassed(internship.deadline) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {internship.track === "both" ? (
                        <>
                          <Badge
                            variant={getTrackBadgeVariant("quant")}
                            className="text-xs capitalize"
                          >
                            quant
                          </Badge>
                          <Badge
                            variant={getTrackBadgeVariant("value")}
                            className="text-xs capitalize"
                          >
                            value
                          </Badge>
                        </>
                      ) : (
                        <Badge
                          variant={getTrackBadgeVariant(internship.track)}
                          className="text-xs capitalize"
                        >
                          {internship.track}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* School targets */}
                  {internship.schoolTargets &&
                    internship.schoolTargets.length > 0 && (
                      <div className="mt-3 mb-2">
                        <div className="flex items-center text-gray-600 text-xs mb-1">
                          <FaGraduationCap className="mr-1 text-gray-400" />
                          <span className="text-gray-500 font-medium">
                            Target Schools:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {internship.schoolTargets
                            .slice(0, 3)
                            .map((school, idx) => {
                              const schoolInfo = getSchoolInfo(school);
                              return (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: schoolInfo.color,
                                    backgroundColor: `${schoolInfo.color}22`, // Very light background with transparency
                                    color: schoolInfo.color,
                                  }}
                                >
                                  {schoolInfo.abbr}
                                </Badge>
                              );
                            })}
                          {internship.schoolTargets.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{internship.schoolTargets.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-end text-sm">
                    {internship.isPaid && (
                      <Badge variant="secondary" className="text-xs">
                        <FaCheck className="mr-1" size={10} /> Paid
                      </Badge>
                    )}
                    {!internship.isPaid && <div></div>}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      disabled={
                        internship.isClosed ||
                        isDeadlinePassed(internship.deadline)
                      }
                      asChild
                    >
                      <Link
                        href={getApplicationUrl(internship)}
                        target="_blank"
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <FaExternalLinkAlt className="mr-1" size={12} />
                        Apply
                      </Link>
                    </Button>
                    <Button
                      variant="navy"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        router.push(
                          `/portal/dashboard/internships/${internship._id}`
                        );
                      }}
                    >
                      Details
                      <FaArrowRight size={12} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </SmoothTransition>
    </ProtectedPage>
  );
}

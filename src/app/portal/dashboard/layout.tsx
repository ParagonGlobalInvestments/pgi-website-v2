"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  FaChartLine,
  FaBriefcase,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaRocket,
  FaNewspaper,
} from "react-icons/fa";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMongoUser } from "@/hooks/useMongoUser";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SmoothTransition } from "@/components/ui/SmoothTransition";

// Map chapter names to their logo filenames
const universityLogoMap: { [key: string]: string } = {
  "Princeton University": "princeton.png",
  "Brown University": "brown.png",
  "Columbia University": "columbia.png",
  "Yale University": "yale.png",
  "University of Pennsylvania": "upenn.png",
  "New York University": "nyu.png",
  "University of Chicago": "uchicago.png",
  "Cornell University": "cornell.png",
};

// Helper function to get the logo path
const getUniversityLogoPath = (chapterName: string): string => {
  const logoFile = universityLogoMap[chapterName];
  return logoFile ? `/images/universities/${logoFile}` : "";
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  isCollapsed: boolean;
}

// NavItem component using shadcn Button with Tooltip
const NavItem = ({
  href,
  icon,
  label,
  isActive,
  onClick,
  count,
  isCollapsed,
}: NavItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} onClick={onClick} className="w-full">
          <Button
            variant={isActive ? "navy-accent" : "ghost"}
            className={`w-full ${
              isCollapsed ? "justify-center px-2" : "justify-start px-3"
            } transition-all duration-200 relative`}
          >
            <span className={`text-lg ${isCollapsed ? "mx-0" : "mr-3"}`}>
              {icon}
            </span>
            {!isCollapsed && <span>{label}</span>}
            {!isCollapsed && count !== undefined && (
              <span className="ml-auto bg-[#003E6B] text-xs px-1.5 py-0.5 rounded-md font-medium">
                {count}
              </span>
            )}
            {isCollapsed && count !== undefined && (
              <span className="absolute -top-1 -right-1 bg-[#003E6B] text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                {count}
              </span>
            )}
          </Button>
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeLink, setActiveLink] = useState("dashboard");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [internships, setInternships] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();
  const {
    user: mongoUser,
    isLoading: isMongoUserLoading,
    syncUser,
  } = useMongoUser();

  // Flag to track if we've already attempted sync
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Get user metadata once loaded
  const userRole = (user?.publicMetadata?.role as string) || "member";
  const userTrack = (user?.publicMetadata?.track as string) || "value";
  const userChapter =
    (user?.publicMetadata?.chapter as string) || "Yale University";

  // Sync Clerk user with MongoDB on initial load - only once
  useEffect(() => {
    if (isLoaded && user && !syncAttempted && !mongoUser) {
      setSyncAttempted(true);

      // Only sync once per session
      const syncUserOnce = async () => {
        try {
          await syncUser();
          console.log("User synced successfully");
        } catch (err) {
          console.error("Failed to sync user with MongoDB:", err);
          // No retry - we've already set syncAttempted to true
        }
      };

      syncUserOnce();
    }
  }, [isLoaded, user, syncUser, mongoUser, syncAttempted]);

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <FaRocket className="text-yellow-400" />;
      case "lead":
        return <FaGraduationCap className="text-green-400" />;
      default:
        return <FaUsers className="text-blue-400" />;
    }
  };

  // Get track color
  const getTrackColor = (track: string) => {
    switch (track) {
      case "quant":
        return "text-blue-400";
      case "value":
        return "text-purple-400";
      case "both":
        return "text-teal-400";
      default:
        return "text-gray-400";
    }
  };

  // Fetch chapters and internships
  useEffect(() => {
    // Only fetch if user is loaded and we haven't already loaded chapters
    if (isLoaded && chapters.length === 0) {
      const fetchData = async () => {
        try {
          // Fetch chapters
          const chaptersResponse = await fetch("/api/chapters");
          if (chaptersResponse.ok) {
            const chaptersData = await chaptersResponse.json();
            setChapters(chaptersData);

            // Set the selected chapter based on user's chapter or default to first one
            const userChapterObject = chaptersData.find(
              (ch: Chapter) => ch.name === userChapter
            );
            setSelectedChapter(userChapterObject || chaptersData[0]);
          }

          // Fetch internships
          const internshipsResponse = await fetch("/api/internships");
          if (internshipsResponse.ok) {
            const internshipsData = await internshipsResponse.json();
            setInternships(internshipsData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [isLoaded, chapters.length, userChapter]);

  useEffect(() => {
    // Set active link based on URL
    const path = window.location.pathname;
    if (path.includes("/internships")) {
      setActiveLink("internships");
    } else if (path.includes("/directory")) {
      setActiveLink("directory");
    } else if (path.includes("/settings")) {
      setActiveLink("settings");
    } else {
      setActiveLink("dashboard");
    }
  }, []);

  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add useEffect to handle mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use mongoUser data if available, otherwise fallback to Clerk data
  const displayName =
    mongoUser?.name || (user ? `${user.firstName} ${user.lastName}` : "");
  const displayRole = mongoUser?.role || userRole;
  const displayTrack = mongoUser?.track || userTrack;
  const displayChapter =
    mongoUser?.chapter?.name || selectedChapter?.name || userChapter;
  const displayAvatar = mongoUser?.avatarUrl || user?.imageUrl;

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Sidebar width animation
  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4.5rem" },
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b border-[#003E6B]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="Paragon Global Investments"
              width={120}
              height={24}
              className="h-6 w-auto"
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-[#003E6B] rounded-md transition-colors relative z-50"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#00172B] transition-transform duration-300 ease-in-out z-[55] ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        } pt-16`}
      >
        <div className="px-4 py-2">
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-[#002C4D] rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white font-medium">{displayName}</div>
              <div className="text-sm text-gray-400">{displayChapter}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/portal/dashboard"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === "dashboard"
                  ? "bg-[#003E6B]"
                  : "hover:bg-[#002C4D]"
              }`}
              onClick={() => {
                setActiveLink("dashboard");
                setIsMobileMenuOpen(false);
              }}
            >
              <FaChartLine className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/portal/dashboard/internships"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === "internships"
                  ? "bg-[#003E6B]"
                  : "hover:bg-[#002C4D]"
              }`}
              onClick={() => {
                setActiveLink("internships");
                setIsMobileMenuOpen(false);
              }}
            >
              <FaBriefcase className="h-5 w-5" />
              <span>Internships</span>
              {internships.length > 0 && (
                <span className="ml-auto bg-[#003E6B] text-xs px-2 py-1 rounded-full">
                  {internships.length}
                </span>
              )}
            </Link>
            <Link
              href="/portal/dashboard/directory"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === "directory"
                  ? "bg-[#003E6B]"
                  : "hover:bg-[#002C4D]"
              }`}
              onClick={() => {
                setActiveLink("directory");
                setIsMobileMenuOpen(false);
              }}
            >
              <FaUsers className="h-5 w-5" />
              <span>Directory</span>
            </Link>
            <Link
              href="/portal/dashboard/news"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === "news" ? "bg-[#003E6B]" : "hover:bg-[#002C4D]"
              }`}
              onClick={() => {
                setActiveLink("news");
                setIsMobileMenuOpen(false);
              }}
            >
              <FaNewspaper className="h-5 w-5" />
              <span>News</span>
            </Link>
            <Link
              href="/portal/dashboard/settings"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === "settings"
                  ? "bg-[#003E6B]"
                  : "hover:bg-[#002C4D]"
              }`}
              onClick={() => {
                setActiveLink("settings");
                setIsMobileMenuOpen(false);
              }}
            >
              <FaCog className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* User Metadata */}
          <div className="mt-6 p-4 bg-[#002C4D] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {getRoleIcon(displayRole)}
              <span className="text-sm font-medium text-white capitalize">
                {displayRole}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Track:{" "}
              <span className={`font-medium ${getTrackColor(displayTrack)}`}>
                {displayTrack}
              </span>
            </div>
          </div>

          {/* Back to Website Link */}
          <div className="mt-6">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-400 hover:bg-[#002C4D]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome className="h-5 w-5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Hide on mobile */}
      <motion.aside
        className="hidden lg:flex bg-[#00172B] flex-shrink-0 flex-col h-screen sticky top-0 shadow-xl overflow-hidden z-10"
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Organization Header */}
        <div className="px-4 py-4 border-b border-[#003E6B] flex items-center justify-between">
          <SmoothTransition
            isVisible={!isCollapsed}
            direction="vertical"
            className="flex w-full items-center justify-between gap-2"
          >
            <div className="w-30 h-8 bg-primary rounded flex items-center justify-center">
              <Image
                src="/logos/pgiLogoFull.jpg"
                alt="Paragon Global Investments"
                width={250}
                height={40}
                className="w-auto"
              />
            </div>
            {/* <h1 className="text-white text-center mr-2 font-bold">Portal</h1> */}
          </SmoothTransition>

          <div className="flex items-center hover:cursor-pointer rounded-full">
            <SmoothTransition
              isVisible={isCollapsed}
              direction="scale"
              className="w-full"
            >
              <div className="w-8 h-8 bg-primary rounded">
                <Image
                  src="/logos/pgiLogoTransparent.png"
                  alt="Paragon Global Investments"
                  width={32}
                  height={32}
                  className="w-auto"
                />
              </div>
            </SmoothTransition>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    variant="ghost"
                    size="icon"
                    className="text-white h-8 w-8 hover:cursor-pointer hover:text-white"
                    aria-label={
                      isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
                    }
                  >
                    {isCollapsed ? (
                      <FaChevronRight size={14} className="mr-4" />
                    ) : (
                      <FaChevronLeft size={14} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* User Account Section with Dropdown */}
        <div className="px-3 pt-4 pb-2">
          <SmoothTransition isVisible={!isCollapsed} direction="vertical">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-3 py-2 text-white hover:bg-[#003E6B] transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={displayAvatar} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[110px]">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {universityLogoMap[displayChapter] && (
                      <div className="w-5 h-5 bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={getUniversityLogoPath(displayChapter)}
                          alt={`${displayChapter} logo`}
                          width={20}
                          height={20}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                    )}
                    <FaChevronDown className="h-3 w-3" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Current chapter</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {chapters.map((chapter) => (
                  <DropdownMenuItem
                    key={chapter._id}
                    className={`gap-2 cursor-pointer ${
                      selectedChapter?.slug === chapter.slug
                        ? "bg-[#003E6B] text-white"
                        : "text-gray-500"
                    }`}
                    onClick={() => setSelectedChapter(chapter)}
                  >
                    {universityLogoMap[chapter.name] && (
                      <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={getUniversityLogoPath(chapter.name)}
                          alt={`${chapter.name} logo`}
                          width={24}
                          height={24}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    )}
                    <span className="truncate">{chapter.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SmoothTransition>

          <SmoothTransition
            isVisible={isCollapsed}
            direction="scale"
            className="flex justify-center"
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
          </SmoothTransition>
        </div>

        {/* Main Navigation */}
        <div className="px-3 mt-3 flex-1">
          {!isCollapsed && (
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main
            </h2>
          )}
          <nav className="space-y-1">
            <NavItem
              href="/portal/dashboard"
              icon={<FaChartLine />}
              label="Dashboard"
              isActive={activeLink === "dashboard"}
              onClick={() => setActiveLink("dashboard")}
              isCollapsed={isCollapsed}
            />

            <NavItem
              href="/portal/dashboard/internships"
              icon={<FaBriefcase />}
              label="Internships"
              isActive={activeLink === "internships"}
              onClick={() => setActiveLink("internships")}
              count={internships.length}
              isCollapsed={isCollapsed}
            />

            <NavItem
              href="/portal/dashboard/directory"
              icon={<FaUsers />}
              label="Directory"
              isActive={activeLink === "directory"}
              onClick={() => setActiveLink("directory")}
              isCollapsed={isCollapsed}
            />

            <NavItem
              href="/portal/dashboard/news"
              icon={<FaNewspaper />}
              label="News"
              isActive={activeLink === "news"}
              onClick={() => setActiveLink("news")}
              isCollapsed={isCollapsed}
            />

            <NavItem
              href="/portal/dashboard/settings"
              icon={<FaCog />}
              label="Settings"
              isActive={activeLink === "settings"}
              onClick={() => setActiveLink("settings")}
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>

        {/* User Metadata Display - Enhanced version with fluid transitions */}
        <SmoothTransition
          isVisible={!isCollapsed}
          direction="vertical"
          className="px-4 py-3 mt-auto mx-3 mb-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50 shadow-inner"
        >
          <div className="flex items-center gap-2 mb-2">
            {getRoleIcon(displayRole)}
            <span className="text-xs font-semibold text-white capitalize">
              {displayRole}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">
                Track:{" "}
                <span className={`font-medium ${getTrackColor(displayTrack)}`}>
                  {displayTrack}
                </span>
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {universityLogoMap[displayChapter] && (
                <div className="w-4 h-4 bg-white rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src={getUniversityLogoPath(displayChapter)}
                    alt={`${displayChapter} logo`}
                    width={16}
                    height={16}
                    className="w-3 h-3 object-contain"
                  />
                </div>
              )}
              <span className="text-xs text-gray-300">
                Chapter:{" "}
                <span className="font-medium text-blue-300">
                  {displayChapter}
                </span>
              </span>
            </div>
          </div>
        </SmoothTransition>

        <SmoothTransition
          isVisible={isCollapsed}
          direction="scale"
          className="px-0 py-3 mt-auto mb-3 mx-auto flex flex-col items-center gap-2"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-[#002C4D] flex items-center justify-center">
                  {getRoleIcon(displayRole)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">{displayRole}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {universityLogoMap[displayChapter] && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src={getUniversityLogoPath(displayChapter)}
                      alt={`${displayChapter} logo`}
                      width={20}
                      height={20}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{displayChapter}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </SmoothTransition>

        {/* Sidebar Footer with smooth transitions */}
        <div className="border-t border-[#003E6B]">
          <div
            className={`px-3 py-3 ${
              isCollapsed ? "flex flex-col items-center" : "space-y-1"
            }`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="w-full block">
                    <Button
                      variant="ghost"
                      className={`text-gray-300 hover:text-white hover:bg-[#003E6B] w-full justify-start ${
                        isCollapsed ? "px-2" : "px-3"
                      }`}
                    >
                      <FaHome
                        className={`${isCollapsed ? "mx-auto" : "mr-2"}`}
                      />
                      {!isCollapsed && <span>Back to Website</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Back to Website</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/portal/signout" className="w-full block">
                    <Button
                      variant="ghost"
                      className={`text-gray-300 hover:text-white hover:bg-[#003E6B] w-full justify-start ${
                        isCollapsed ? "px-2" : "px-3"
                      }`}
                    >
                      <FaSignOutAlt
                        className={`${isCollapsed ? "mx-auto" : "mr-2"}`}
                      />
                      {!isCollapsed && <span>Sign Out</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Sign Out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.aside>

      {/* Main Content - Add padding top on mobile */}
      <div className="flex-1 min-w-0 bg-white lg:ml-0">
        <div className="lg:p-8 p-4 pt-16 lg:pt-8">{children}</div>
      </div>
    </div>
  );
}

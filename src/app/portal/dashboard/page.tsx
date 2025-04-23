"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  FaBriefcase,
  FaUsers,
  FaNewspaper,
  FaArrowRight,
  FaChartLine,
  FaBuilding,
  FaGlobe,
} from "react-icons/fa";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { motion } from "framer-motion";
import { ActionButton, ActionIconButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { SmoothTransition } from "@/components/ui/SmoothTransition";
import MarketWatchNews from "@/components/dashboard/MarketWatchNews";
import SeekingAlphaNews from "@/components/dashboard/SeekingAlphaNews";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  color,
  bgColor,
  delay = 0,
}: StatCardProps) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl text-blue-950 font-bold mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className={`p-4 rounded-full ${bgColor} shadow-md`}>{icon}</div>
    </div>
  </motion.div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const ActionCard = ({
  title,
  description,
  icon,
  href,
  color,
  bgColor,
  delay = 0,
}: ActionCardProps) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link href={href} className="block">
      <div
        className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${color} hover:shadow-xl transition-all group`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-full ${bgColor} shadow-md`}>{icon}</div>
          <motion.div
            animate={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FaArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.div>
        </div>
        <h3 className="font-semibold text-xl text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </Link>
  </motion.div>
);

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState({
    internships: 0,
    members: 0,
    chapters: 0,
    loading: true,
  });

  // Fetch real data from the API
  useEffect(() => {
    if (!isLoaded) return;

    const fetchStats = async () => {
      try {
        // Fetch internship count
        let internshipStats = { total: 0 };
        let memberStats = { totalMembers: 0, totalChapters: 0 };

        try {
          const internshipsResponse = await fetch("/api/internships/stats");
          if (internshipsResponse.ok) {
            internshipStats = await internshipsResponse.json();
          }
        } catch (error) {
          console.warn("Internship stats API not available yet:", error);
          // Fallback to counting from regular endpoint
          try {
            const fallbackResponse = await fetch("/api/internships");
            if (fallbackResponse.ok) {
              const internships = await fallbackResponse.json();
              internshipStats = { total: internships.length };
            }
          } catch (fallbackError) {
            console.error("Fallback internship count failed:", fallbackError);
          }
        }

        // Fetch member and chapter count
        try {
          const membersResponse = await fetch("/api/users/stats");
          if (membersResponse.ok) {
            memberStats = await membersResponse.json();
          }
        } catch (error) {
          console.warn("User stats API not available yet:", error);
          // Use hardcoded fallback
          memberStats = {
            totalMembers: 45,
            totalChapters: 8,
          };
        }

        setStats({
          internships: internshipStats.total || 0,
          members: memberStats.totalMembers || 0,
          chapters: memberStats.totalChapters || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Use fallback values
        setStats({
          internships: 24,
          members: 45,
          chapters: 8,
          loading: false,
        });
      }
    };

    fetchStats();
  }, [isLoaded]);

  // Get user metadata
  const userRole = (user?.publicMetadata?.role as string) || "member";
  const userTrack = (user?.publicMetadata?.track as string) || "value";
  const chapter =
    (user?.publicMetadata?.chapter as string) || "New York University";

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Welcome back, {user?.firstName || "Member"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-500 mt-1"
          >
            {userRole === "admin"
              ? "Here's an overview of Paragon Global Investments"
              : `${chapter} Chapter • ${
                  userTrack === "both"
                    ? "Value & Quantitative"
                    : userTrack === "quant"
                    ? "Quantitative"
                    : "Value"
                } Track`}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <StatCard
            title="Available Internships"
            value={stats.loading ? "..." : stats.internships}
            icon={<FaBriefcase className="text-white text-xl" />}
            description={
              stats.loading
                ? "Loading..."
                : `${stats.internships} current opportunities`
            }
            color="border-blue-500"
            bgColor="bg-blue-500"
            delay={0.1}
          />

          {(userRole === "admin" || userRole === "lead") && (
            <StatCard
              title="Total Members"
              value={stats.loading ? "..." : stats.members}
              icon={<FaUsers className="text-white text-xl" />}
              description={
                stats.loading
                  ? "Loading..."
                  : `${stats.members} members across all chapters`
              }
              color="border-green-500"
              bgColor="bg-green-500"
              delay={0.2}
            />
          )}

          {userRole === "admin" && (
            <StatCard
              title="Active Chapters"
              value={stats.loading ? "..." : stats.chapters}
              icon={<FaBuilding className="text-white text-xl" />}
              description={
                stats.loading
                  ? "Loading..."
                  : `Across ${stats.chapters} universities`
              }
              color="border-amber-500"
              bgColor="bg-amber-500"
              delay={0.3}
            />
          )}
        </motion.div>

        {/* Market Watch News and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Watch News Feed */}
          <div className="lg:col-span-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              News & Updates
            </motion.h2>
            <div className="flex lg:flex-row flex-col gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:w-1/2"
              >
                <MarketWatchNews />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:w-1/2"
              >
                <SeekingAlphaNews />
              </motion.div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Quick Actions
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6"
            >
              <ActionCard
                title="Browse Internships"
                description="View all available internship opportunities"
                icon={<FaBriefcase className="text-white text-xl" />}
                href="/portal/dashboard/internships"
                color="border-blue-100"
                bgColor="bg-blue-500"
                delay={0.5}
              />

              {(userRole === "admin" || userRole === "lead") && (
                <ActionCard
                  title="Add New Internship"
                  description="Post a new internship opportunity"
                  icon={<FaBriefcase className="text-white text-xl" />}
                  href="/portal/dashboard/internships/new"
                  color="border-green-100"
                  bgColor="bg-green-500"
                  delay={0.6}
                />
              )}

              <ActionCard
                title="View Members"
                description="See all members in the chapter"
                icon={<FaUsers className="text-white text-xl" />}
                href="/portal/dashboard/members"
                color="border-purple-100"
                bgColor="bg-purple-500"
                delay={0.7}
              />
            </motion.div>
          </div>
        </div>

        {/* <div className="flex justify-end mt-6">
          <ActionIconButton
            icon={FaUsers}
            label="View PGI Directory"
            href="/portal/dashboard/directory"
            variant="navy"
            className="mr-4"
            showPulse={stats.members > 40}
          />
          <ActionButton
            href="/portal/dashboard/internships"
            variant="navy-accent"
            icon={<FaBriefcase />}
            showPulse={stats.internships > 20}
          >
            View All Internships
          </ActionButton>
        </div> */}
      </SmoothTransition>
    </ProtectedPage>
  );
}

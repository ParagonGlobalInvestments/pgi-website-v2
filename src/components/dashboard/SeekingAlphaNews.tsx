"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaExternalLinkAlt,
  FaNewspaper,
  FaClock,
  FaSync,
  FaDatabase,
} from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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

// RSS Item type
interface RssItem {
  _id: string;
  source: string;
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
  content?: string;
  fetchedAt: string;
  isNew?: boolean;
}

export default function SeekingAlphaNews() {
  const { user, isLoaded } = useUser();
  const [newsItems, setNewsItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [serverRefreshing, setServerRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  // Get user role from metadata
  const userRole = isLoaded
    ? (user?.publicMetadata?.role as string) || "member"
    : "member";
  const isAdmin = userRole === "admin";

  // Format date relative to now (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  // Fetch RSS items from the API
  const fetchNewsItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/rss-items?source=seekingalpha-news");

      if (!response.ok) {
        throw new Error("Failed to fetch news items");
      }

      const data = await response.json();

      // Compare with existing items to find new ones
      if (isRefresh && newsItems.length > 0) {
        const existingGuids = new Set(newsItems.map((item) => item.guid));
        const newItems = data.map((item: RssItem) => {
          if (!existingGuids.has(item.guid)) {
            return { ...item, isNew: true };
          }
          return item;
        });
        setNewsItems(newItems);
      } else {
        setNewsItems(data);
      }

      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching news items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isLoaded) {
      fetchNewsItems();
    }
  }, [isLoaded]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchNewsItems(true);
  };

  // Server-side refresh handler (admin only)
  const handleServerRefresh = async () => {
    if (!isAdmin) return;

    try {
      setServerRefreshing(true);
      setRefreshMessage("");

      const response = await fetch(
        "/api/rss-items/refresh?role=admin&source=seekingalpha",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to trigger RSS feed refresh");
      }

      const data = await response.json();
      setRefreshMessage(
        `Feed refreshed! ${data.newItemsCount} new items fetched.`
      );

      // Refresh our displayed items to show the new items
      setTimeout(() => {
        fetchNewsItems(true);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing RSS feed:", error);
      setRefreshMessage("Failed to refresh feed from server");
    } finally {
      setServerRefreshing(false);
      // Clear message after 5 seconds
      setTimeout(() => setRefreshMessage(""), 5000);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 ">
        <CardTitle className="text-xl font-bold flex text-gray-700 items-center">
          <FaNewspaper className="mr-2 text-orange-500" />
          Seeking Alpha
        </CardTitle>
        <div className="flex items-center text-xs text-gray-500">
          {lastRefreshed && (
            <span className="mr-2">
              Updated {formatRelativeTime(lastRefreshed.toISOString())}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 rounded-full hover:bg-orange-100 transition-colors"
            title="Refresh from cache"
          >
            <FaSync
              className={`text-orange-500 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {newsItems.length > 0 ? (
              newsItems.slice(0, 5).map((item: RssItem, index) => (
                <motion.div
                  key={item._id || index}
                  variants={itemVariants}
                  className={`border-b border-gray-100 pb-3 last:border-b-0 ${
                    item.isNew ? "bg-orange-50 rounded p-2 -m-2" : ""
                  }`}
                >
                  <Link
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                      {item.title}
                      {item.isNew && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          New
                        </span>
                      )}
                    </h3>
                    {item.contentSnippet && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.contentSnippet.substring(0, 160)}
                        {item.contentSnippet.length > 160 ? "..." : ""}
                      </p>
                    )}
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <FaClock className="mr-1" />
                      {formatRelativeTime(item.pubDate)}
                      <FaExternalLinkAlt className="ml-2 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-center">
                <p>No news items available</p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex flex-col items-start pt-2">
          <div className="w-full flex items-center justify-between">
            <Button
              onClick={handleServerRefresh}
              disabled={serverRefreshing}
              variant="outline"
              size="sm"
              className="text-xs flex items-center text-gray-700"
            >
              <FaDatabase className="mr-1" />
              {serverRefreshing ? "Refreshing Feed..." : "Refresh From Source"}
            </Button>

            {refreshMessage && (
              <span className="text-xs text-green-600">{refreshMessage}</span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

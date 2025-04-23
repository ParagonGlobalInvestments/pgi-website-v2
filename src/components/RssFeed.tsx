"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { io, Socket } from "socket.io-client";
import { FaExternalLinkAlt, FaSync } from "react-icons/fa";
import { motion } from "framer-motion";

// Define the RssItem interface
interface RssItem {
  _id: string;
  source: string;
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  creator?: string;
  categories?: string[];
  fetchedAt: string;
}

// Format the date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Truncate text to a specific length
const truncateText = (text: string | undefined, maxLength: number = 120) => {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
};

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch RSS items");
  }
  return res.json();
};

const RssFeed = () => {
  // State for RSS items
  const [items, setItems] = useState<RssItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch RSS items using SWR
  const { data, error, mutate } = useSWR(
    "/api/rss-items?source=marketwatch-top",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      onSuccess: (data) => {
        setItems(data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    }
  );

  // Initialize Socket.IO connection
  useEffect(() => {
    // Only initialize Socket.IO in the browser
    if (typeof window !== "undefined") {
      const socketIo = io(window.location.origin);

      socketIo.on("connect", () => {
        console.log("Socket.IO connected");
        setIsConnected(true);
      });

      socketIo.on("disconnect", () => {
        console.log("Socket.IO disconnected");
        setIsConnected(false);
      });

      socketIo.on("new-item", (newItem: RssItem) => {
        console.log("New RSS item received:", newItem);
        setItems((prevItems) => {
          // Check if the item already exists
          const exists = prevItems.some((item) => item.guid === newItem.guid);
          if (!exists) {
            // Add new item at the beginning and maintain max 50 items
            return [newItem, ...prevItems].slice(0, 50);
          }
          return prevItems;
        });
      });

      setSocket(socketIo);

      // Cleanup on unmount
      return () => {
        socketIo.disconnect();
      };
    }
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await mutate();
    setLoading(false);
  };

  // Animation variants for items
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Live MarketWatch Top Stories
          </h2>
          <div className="animate-spin text-blue-500">
            <FaSync />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Live MarketWatch Top Stories
          </h2>
          <button
            onClick={handleRefresh}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaSync />
          </button>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-xl shadow-md">
          Failed to load market news. Please try refreshing.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Live MarketWatch Top Stories
        </h2>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="flex items-center text-xs text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
              Live
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Refresh news"
          >
            <FaSync />
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {items && items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <motion.div
                key={item._id || index}
                variants={itemVariants}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-medium text-blue-900">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                  </h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors ml-2"
                  >
                    <FaExternalLinkAlt size={12} />
                  </a>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {truncateText(item.contentSnippet)}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(item.pubDate)}
                  </span>

                  {item.categories && item.categories.length > 0 && (
                    <div className="flex gap-1">
                      {item.categories.slice(0, 2).map((category, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                      {item.categories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{item.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No market news available. Check back later.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RssFeed;

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Folders,
  FileText,
  ArrowUpRight as ArrowUpRightIcon,
} from 'lucide-react';

interface BentoFolderGridProps {
  parentFolderId: string;
}

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
}

export default function BentoFolderGrid({
  parentFolderId,
}: BentoFolderGridProps) {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriveItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/drive/folders?folderId=${parentFolderId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch drive items');
        }

        const data = await response.json();
        setItems(data.items || []);
      } catch (err) {
        console.error('Error fetching drive items:', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    if (parentFolderId) {
      fetchDriveItems();
    }
  }, [parentFolderId]);

  // Simplified PGI-style grid - no complex bento patterns needed

  const isFolder = (mimeType: string) => {
    return mimeType === 'application/vnd.google-apps.folder';
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-darkNavy p-6 rounded-xl border border-gray-700 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <div className="animate-pulse">
                <div className="bg-gray-600 rounded-full h-12 w-12 mb-4"></div>
                <div className="bg-gray-600 rounded h-5 w-3/4 mb-2"></div>
                <div className="bg-gray-700 rounded h-4 w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-darkNavy border border-red-500/30 rounded-xl p-8 text-center shadow-xl">
          <p className="text-red-400 mb-4 text-lg font-medium">{error}</p>
          <p className="text-gray-400 text-sm font-light">
            Please try again or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-darkNavy border border-gray-700 rounded-xl p-12 text-center shadow-xl">
          <Folders className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <p className="text-gray-300 text-lg font-medium">
            No resources found in this folder.
          </p>
          <p className="text-gray-400 text-sm font-light mt-2">
            Check back later for new content.
          </p>
        </div>
      </div>
    );
  }

  // Determine if we need to center the last item
  const shouldCenterLast = items.length % 3 === 1;

  return (
    <div className="w-full max-w-7xl mx-auto mb-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
      >
        {items.map((item, index) => {
          const ItemIcon = isFolder(item.mimeType) ? Folders : FileText;
          const isLastItem = index === items.length - 1;
          const isOnlyItemInRow = shouldCenterLast && isLastItem;

          return (
            <motion.div
              key={item.id}
              className={`bg-darkNavy p-6 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 shadow-xl cursor-pointer ${
                isOnlyItemInRow ? 'lg:col-start-2' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                item.webViewLink && window.open(item.webViewLink, '_blank')
              }
            >
              {/* Icon */}
              <div className="bg-pgi-light-blue p-3 rounded-full mb-4 w-fit">
                <ItemIcon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">
                {item.name}
              </h3>

              <p className="text-gray-300 text-sm font-light mb-4">
                {isFolder(item.mimeType) ? 'Folder' : 'Document'}
                {item.size && ` • ${item.size}`}
              </p>

              {/* Action indicator */}
              {item.webViewLink && (
                <div className="flex justify-end items-center mt-auto">
                  <div className="flex items-center space-x-2 text-gray-400 hover:text-pgi-light-blue transition-colors duration-300">
                    <span className="text-xs font-medium">Open</span>
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

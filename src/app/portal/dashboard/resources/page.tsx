'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFolder } from 'react-icons/fa';
import { RESOURCE_CATEGORIES, type Resource } from '@/lib/constants/resources';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FaFilePdf,
  doc: FaFileWord,
  sheet: FaFileExcel,
  folder: FaFolder,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  sheet: 'text-green-500',
  folder: 'text-yellow-600',
};

function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = TYPE_ICONS[resource.type] || FaFilePdf;
  const color = TYPE_COLORS[resource.type] || 'text-gray-500';
  const hasUrl = Boolean(resource.driveUrl);

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200 ${
        hasUrl
          ? 'hover:border-blue-300 hover:shadow-sm cursor-pointer'
          : 'opacity-60'
      }`}
      onClick={() => {
        if (hasUrl) window.open(resource.driveUrl, '_blank');
      }}
    >
      <div className={`flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm truncate">
          {resource.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{resource.description}</p>
      </div>
      {hasUrl ? (
        <FaExternalLinkAlt className="text-gray-400 h-3 w-3 flex-shrink-0" />
      ) : (
        <span className="text-xs text-gray-400 flex-shrink-0">Coming soon</span>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState(RESOURCE_CATEGORIES[0].id);
  const activeCategory = RESOURCE_CATEGORIES.find(c => c.id === activeTab)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">
          Education materials, recruitment prep, and investment pitches
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {RESOURCE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === cat.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
            {activeTab === cat.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Category description */}
      <p className="text-sm text-gray-600">{activeCategory.description}</p>

      {/* Resource list */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {activeCategory.resources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </motion.div>
    </div>
  );
}

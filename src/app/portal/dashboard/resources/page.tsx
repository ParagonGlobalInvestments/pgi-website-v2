'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaExternalLinkAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFolder,
} from 'react-icons/fa';
import { Button } from '@/components/ui';
import { DetailPanel } from '@/components/ui/detail-panel';
import { RESOURCE_CATEGORIES, type Resource } from '@/lib/constants/resources';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';

// ============================================================================
// Constants
// ============================================================================

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

const TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  sheet: 'Spreadsheet',
  folder: 'Folder',
};

// ============================================================================
// Resource Detail Panel Content
// ============================================================================

function ResourceDetail({
  resource,
  categoryLabel,
  isMobile,
  onPreview,
}: {
  resource: Resource;
  categoryLabel: string;
  isMobile: boolean;
  onPreview: () => void;
}) {
  const Icon = TYPE_ICONS[resource.type] || FaFilePdf;
  const color = TYPE_COLORS[resource.type] || 'text-gray-500';
  const hasUrl = Boolean(resource.url);
  const canPreview = hasUrl && (resource.type === 'pdf' || resource.type === 'sheet');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{resource.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {TYPE_LABELS[resource.type] || resource.type}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 text-sm">
        <div className="py-2.5 border-b border-gray-100">
          <span className="text-gray-500 block mb-1">Description</span>
          <span className="text-gray-900">{resource.description}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Category</span>
          <span className="text-gray-900 font-medium">{categoryLabel}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Type</span>
          <span className="text-gray-900 font-medium">
            {TYPE_LABELS[resource.type] || resource.type}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Status</span>
          {hasUrl ? (
            <span className="text-green-700 font-medium">Available</span>
          ) : (
            <span className="text-gray-500 font-medium">Coming soon</span>
          )}
        </div>
      </div>

      {/* Action */}
      {hasUrl ? (
        isMobile && canPreview ? (
          <div className="space-y-3">
            <Button
              variant="navy"
              className="w-full justify-center gap-2"
              onClick={onPreview}
            >
              Preview
            </Button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Open in New Tab
            </a>
          </div>
        ) : (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="navy" className="w-full justify-center gap-2">
              Open Resource
              <FaExternalLinkAlt className="h-3 w-3" />
            </Button>
          </a>
        )
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-500">
            This resource is not yet available.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Resource Card
// ============================================================================

function ResourceCard({
  resource,
  isSelected,
  onClick,
}: {
  resource: Resource;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[resource.type] || FaFilePdf;
  const color = TYPE_COLORS[resource.type] || 'text-gray-500';
  const hasUrl = Boolean(resource.url);

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
          : hasUrl
            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            : 'border-gray-200 opacity-60'
      }`}
      onClick={onClick}
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
        <span className="text-xs text-gray-500 flex-shrink-0">Coming soon</span>
      )}
    </div>
  );
}

// ============================================================================
// Resources Page
// ============================================================================

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState(RESOURCE_CATEGORIES[0].id);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isMobile = useIsMobile();

  const activeCategory = RESOURCE_CATEGORIES.find(c => c.id === activeTab)!;

  const isPreviewable = (r: Resource) =>
    Boolean(r.url) && (r.type === 'pdf' || r.type === 'sheet');

  const openPanel = (resource: Resource) => {
    setSelectedResource(resource);
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1 text-sm">
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
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
          opacity: { duration: 0.15 },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {activeCategory.resources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isSelected={selectedResource?.id === resource.id && isPanelOpen}
            onClick={() => openPanel(resource)}
          />
        ))}
      </motion.div>

      {/* Resource Detail Panel */}
      <DetailPanel isOpen={isPanelOpen} onClose={closePanel}>
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            categoryLabel={activeCategory.label}
            isMobile={isMobile}
            onPreview={() => setIsViewerOpen(true)}
          />
        )}
      </DetailPanel>

      {/* Mobile Document Viewer (full-screen overlay) */}
      {selectedResource && isPreviewable(selectedResource) && (
        <MobileDocumentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          url={selectedResource.url}
          title={selectedResource.title}
          type={selectedResource.type === 'sheet' ? 'sheet' : 'pdf'}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Folder,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DetailPanel } from '@/components/ui/detail-panel';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import MobileDocumentViewer from '@/components/portal/MobileDocumentViewer';
import type { CmsResource, ResourceTabId } from '@/lib/cms/types';

// ============================================================================
// Constants
// ============================================================================

const TABS: { id: ResourceTabId; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description:
      'Networking guides, resume templates, and career prep materials',
  },
  {
    id: 'value',
    label: 'Value',
    description:
      'Value education, IB technicals, financial modeling, and stock pitches',
  },
  {
    id: 'quant',
    label: 'Quant',
    description: 'Quant education materials and interview prep books',
  },
];

const SECTION_ORDER: Record<ResourceTabId, string[]> = {
  general: ['Networking', 'Career Prep'],
  value: [
    'Value Education',
    'IB Technicals',
    'Financial Modeling',
    'Stock Pitches',
  ],
  quant: ['Education', 'Interview Prep'],
};

const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  folder: Folder,
  link: Link2,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  sheet: 'text-green-500',
  folder: 'text-yellow-600',
  link: 'text-purple-500',
};

const TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  sheet: 'Spreadsheet',
  folder: 'Folder',
  link: 'External Link',
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ============================================================================
// Resource Detail Panel Content
// ============================================================================

function ResourceDetail({
  resource,
  sectionLabel,
  isMobile,
  onPreview,
}: {
  resource: CmsResource;
  sectionLabel: string;
  isMobile: boolean;
  onPreview: () => void;
}) {
  const Icon = TYPE_ICONS[resource.type] || FileText;
  const color = TYPE_COLORS[resource.type] || 'text-gray-500';
  const hasUrl = Boolean(resource.url);
  const hasLink = Boolean(resource.link_url);
  const canPreview =
    hasUrl && (resource.type === 'pdf' || resource.type === 'sheet');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 ${color}`}
        >
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
        {resource.description && (
          <div className="py-2.5 border-b border-gray-100">
            <span className="text-gray-500 block mb-1">Description</span>
            <span className="text-gray-900">{resource.description}</span>
          </div>
        )}
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Section</span>
          <span className="text-gray-900 font-medium">{sectionLabel}</span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Type</span>
          <span className="text-gray-900 font-medium">
            {TYPE_LABELS[resource.type] || resource.type}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
          <span className="text-gray-500">Status</span>
          {hasUrl || hasLink ? (
            <span className="text-green-700 font-medium">Available</span>
          ) : (
            <span className="text-gray-500 font-medium">Coming soon</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {hasUrl &&
          (isMobile && canPreview ? (
            <>
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
            </>
          ) : (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="navy" className="w-full justify-center gap-2">
                Open Resource
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          ))}

        {hasLink && (
          <a
            href={resource.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant={hasUrl ? 'outline' : 'navy'}
              className="w-full justify-center gap-2"
            >
              Open Link
              <Link2 className="h-3 w-3" />
            </Button>
          </a>
        )}

        {!hasUrl && !hasLink && (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500">
              This resource is not yet available.
            </p>
          </div>
        )}
      </div>
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
  resource: CmsResource;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[resource.type] || FileText;
  const color = TYPE_COLORS[resource.type] || 'text-gray-500';
  const hasUrl = Boolean(resource.url) || Boolean(resource.link_url);

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
        <ExternalLink className="text-gray-400 h-3 w-3 flex-shrink-0" />
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
  const [activeTab, setActiveTab] = useState<ResourceTabId>('general');
  const [selectedResource, setSelectedResource] = useState<CmsResource | null>(
    null
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: resources = [] } = useSWR<CmsResource[]>(
    '/api/resources',
    fetcher,
    { refreshInterval: 10000 }
  );

  // Realtime updates from Supabase
  const handleRealtimeUpdate = useCallback(() => {
    mutate('/api/resources');
  }, []);
  useRealtimeTable('resources', handleRealtimeUpdate);

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  // Group resources by section within the active tab
  const sectionGroups = useMemo(() => {
    const tabResources = resources.filter(r => r.tab_id === activeTab);
    const groups: Record<string, CmsResource[]> = {};

    for (const r of tabResources) {
      if (!groups[r.section]) groups[r.section] = [];
      groups[r.section].push(r);
    }

    // Sort within each section by sort_order
    for (const section of Object.keys(groups)) {
      groups[section].sort((a, b) => a.sort_order - b.sort_order);
    }

    // Return sections in defined order, then any extras
    const order = SECTION_ORDER[activeTab] || [];
    const ordered: { section: string; items: CmsResource[] }[] = [];

    for (const section of order) {
      if (groups[section]) {
        ordered.push({ section, items: groups[section] });
        delete groups[section];
      }
    }
    // Append any sections not in the predefined order
    for (const [section, items] of Object.entries(groups)) {
      ordered.push({ section, items });
    }

    return ordered;
  }, [resources, activeTab]);

  const isPreviewable = (r: CmsResource) =>
    Boolean(r.url) && (r.type === 'pdf' || r.type === 'sheet');

  const openPanel = (resource: CmsResource) => {
    setSelectedResource(resource);
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Resources"
        description="General resources, value track materials, and quant prep"
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Category description */}
      <p className="text-sm text-gray-600">{activeTabConfig.description}</p>

      {/* Collapsible sections */}
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
        className="space-y-4"
      >
        {sectionGroups.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500">
            <p className="text-lg font-medium mb-2">No resources yet</p>
            <p>Resources for this tab will appear here once added.</p>
          </div>
        ) : (
          sectionGroups.map(({ section, items }) => (
            <CollapsibleSection
              key={section}
              title={section}
              count={items.length}
              defaultOpen
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isSelected={
                      selectedResource?.id === resource.id && isPanelOpen
                    }
                    onClick={() => openPanel(resource)}
                  />
                ))}
              </div>
            </CollapsibleSection>
          ))
        )}
      </motion.div>

      {/* Resource Detail Panel */}
      <DetailPanel isOpen={isPanelOpen} onClose={closePanel}>
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            sectionLabel={selectedResource.section}
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

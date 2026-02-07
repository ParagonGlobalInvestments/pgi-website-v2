'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Folder,
  Link2,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  Check,
  Minus,
} from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import ResourceForm from './ResourceForm';
import type { CmsResource, ResourceTabId } from '@/lib/cms/types';

// ============================================================================
// Constants
// ============================================================================

const TAB_ORDER: { id: ResourceTabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'value', label: 'Value' },
  { id: 'quant', label: 'Quant' },
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
  pdf: 'text-red-400',
  doc: 'text-blue-400',
  sheet: 'text-green-400',
  folder: 'text-yellow-500',
  link: 'text-purple-400',
};

// ============================================================================
// Tree structure types
// ============================================================================

interface TreeSection {
  tabId: ResourceTabId;
  section: string;
  items: CmsResource[];
}

interface TreeTab {
  id: ResourceTabId;
  label: string;
  sections: TreeSection[];
  totalCount: number;
}

// ============================================================================
// Sortable resource row within a section
// ============================================================================

function SortableResourceItem({
  resource,
  onEdit,
  onDelete,
}: {
  resource: CmsResource;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const Icon = TYPE_ICONS[resource.type] || FileText;
  const color = TYPE_COLORS[resource.type] || 'text-gray-400';
  const hasFile = Boolean(resource.url) || Boolean(resource.link_url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-gray-50 transition-colors relative"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="p-0.5 cursor-grab active:cursor-grabbing text-gray-200 group-hover:text-gray-400 transition-colors touch-none hidden sm:block flex-shrink-0"
        aria-label="Drag to reorder"
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Icon */}
      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${color}`} />

      {/* Title */}
      <span className="text-sm sm:text-[15px] text-gray-700 truncate flex-1 min-w-0">
        {resource.title}
      </span>

      {/* Status indicator */}
      {hasFile ? (
        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
      ) : (
        <Minus className="h-3 w-3 text-gray-300 flex-shrink-0" />
      )}

      {/* Actions — visible on hover (desktop) or always (mobile) */}
      <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={`Edit ${resource.title}`}
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Delete ${resource.title}`}
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Section node (collapsible, contains sortable resources)
// ============================================================================

function SectionNode({
  treeSection,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  sensors,
}: {
  treeSection: TreeSection;
  onEdit: (r: CmsResource) => void;
  onDelete: (r: CmsResource) => void;
  onAdd: (tabId: ResourceTabId, section: string) => void;
  onReorder: (
    sectionItems: CmsResource[],
    oldIndex: number,
    newIndex: number
  ) => void;
  sensors: ReturnType<typeof useSensors>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = treeSection.items.findIndex(i => i.id === active.id);
    const newIndex = treeSection.items.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(treeSection.items, oldIndex, newIndex);
  };

  return (
    <div className="ml-4 sm:ml-6">
      <div className="flex items-center gap-1 group/section">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1 sm:px-1.5 rounded hover:bg-gray-100 transition-colors flex-1 min-w-0"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-150 flex-shrink-0 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
          <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
          <span className="text-sm sm:text-[15px] font-medium text-gray-600 truncate">
            {treeSection.section}
          </span>
          <span className="text-xs tabular-nums text-gray-300 flex-shrink-0">
            {treeSection.items.length}
          </span>
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-500 sm:opacity-0 sm:group-hover/section:opacity-100 transition-all flex-shrink-0"
          aria-label={`Add resource to ${treeSection.section}`}
          onClick={() => onAdd(treeSection.tabId, treeSection.section)}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-3 sm:ml-5 border-l border-gray-100 pl-2 sm:pl-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={treeSection.items.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {treeSection.items.map(resource => (
                    <SortableResourceItem
                      key={resource.id}
                      resource={resource}
                      onEdit={() => onEdit(resource)}
                      onDelete={() => onDelete(resource)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Tab node (top-level collapsible)
// ============================================================================

function TabNode({
  treeTab,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  sensors,
}: {
  treeTab: TreeTab;
  onEdit: (r: CmsResource) => void;
  onDelete: (r: CmsResource) => void;
  onAdd: (tabId: ResourceTabId, section: string) => void;
  onReorder: (
    sectionItems: CmsResource[],
    oldIndex: number,
    newIndex: number
  ) => void;
  sensors: ReturnType<typeof useSensors>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md hover:bg-gray-50 transition-colors w-full"
      >
        <ChevronRight
          className={`h-4 w-4 sm:h-[18px] sm:w-[18px] text-gray-400 transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
        <Folder className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-blue-500 flex-shrink-0" />
        <span className="text-sm sm:text-base font-semibold text-gray-800">
          {treeTab.label}
        </span>
        <span className="text-xs sm:text-sm tabular-nums text-gray-400 flex-shrink-0">
          {treeTab.totalCount}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {treeTab.sections.map(section => (
              <SectionNode
                key={section.section}
                treeSection={section}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdd={onAdd}
                onReorder={onReorder}
                sensors={sensors}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ResourcesTab — main component
// ============================================================================

export default function ResourcesTab() {
  const [items, setItems] = useState<CmsResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<
    CmsResource | undefined
  >(undefined);
  const [defaultTabId, setDefaultTabId] = useState<ResourceTabId | undefined>(
    undefined
  );
  const [defaultSection, setDefaultSection] = useState<string | undefined>(
    undefined
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const undoRef = useRef<{ id: string; undone: boolean } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/resources');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: CmsResource[] = await res.json();
      data.sort((a, b) => a.sort_order - b.sort_order);
      setItems(data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useState(() => {
    fetchAll();
  });

  // Build tree structure
  const tree: TreeTab[] = useMemo(() => TAB_ORDER.map(tab => {
      const tabItems = items.filter(r => r.tab_id === tab.id);
      const sectionOrder = SECTION_ORDER[tab.id] || [];

      const sectionMap: Record<string, CmsResource[]> = {};
      for (const r of tabItems) {
        if (!sectionMap[r.section]) sectionMap[r.section] = [];
        sectionMap[r.section].push(r);
      }

      // Sort within each section
      for (const section of Object.keys(sectionMap)) {
        sectionMap[section].sort((a, b) => a.sort_order - b.sort_order);
      }

      // Ordered sections
      const sections: TreeSection[] = [];
      for (const s of sectionOrder) {
        if (sectionMap[s]) {
          sections.push({ tabId: tab.id, section: s, items: sectionMap[s] });
          delete sectionMap[s];
        }
      }
      // Extras
      for (const [s, resources] of Object.entries(sectionMap)) {
        sections.push({ tabId: tab.id, section: s, items: resources });
      }

      return {
        id: tab.id,
        label: tab.label,
        sections,
        totalCount: tabItems.length,
      };
    }), [items]);

  const handleReorder = useCallback(
    async (sectionItems: CmsResource[], oldIndex: number, newIndex: number) => {
      const reordered = arrayMove(sectionItems, oldIndex, newIndex);

      // Optimistic update
      setItems(prev => {
        const next = [...prev];
        for (let i = 0; i < reordered.length; i++) {
          const idx = next.findIndex(r => r.id === reordered[i].id);
          if (idx !== -1) {
            next[idx] = { ...next[idx], sort_order: i };
          }
        }
        return next;
      });

      const reorderPayload = reordered.map((item, idx) => ({
        id: item.id,
        sort_order: idx,
      }));

      try {
        const res = await fetch('/api/cms/resources/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reorderPayload }),
        });
        if (!res.ok) throw new Error('Failed to reorder');
      } catch {
        toast.error('Failed to reorder');
        fetchAll();
      }
    },
    [fetchAll]
  );

  const handleDelete = useCallback(
    (resource: CmsResource) => {
      const snapshot = [...items];
      setItems(prev => prev.filter(r => r.id !== resource.id));

      const undo = { id: resource.id, undone: false };
      undoRef.current = undo;

      const commitDelete = async () => {
        if (undo.undone) return;
        try {
          const res = await fetch(`/api/cms/resources/${resource.id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete');
        } catch {
          toast.error('Failed to delete — restoring');
          setItems(snapshot);
        }
      };

      toast(`Deleted "${resource.title}"`, {
        action: {
          label: 'Undo',
          onClick: () => {
            undo.undone = true;
            setItems(snapshot);
          },
        },
        duration: 5000,
        onAutoClose: commitDelete,
        onDismiss: commitDelete,
      });
    },
    [items]
  );

  const handleAdd = useCallback((tabId: ResourceTabId, section: string) => {
    setEditingResource(undefined);
    setDefaultTabId(tabId);
    setDefaultSection(section);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((resource: CmsResource) => {
    setEditingResource(resource);
    setDefaultTabId(undefined);
    setDefaultSection(undefined);
    setFormOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 py-8 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs tabular-nums text-gray-400">
          {items.length} {items.length === 1 ? 'resource' : 'resources'}
        </span>
        <Button
          size="sm"
          className="h-8 text-sm flex-shrink-0"
          onClick={() => {
            setEditingResource(undefined);
            setDefaultTabId(undefined);
            setDefaultSection(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Tree */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">No resources yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4 space-y-1 sm:space-y-2">
          {tree.map(tab => (
            <TabNode
              key={tab.id}
              treeTab={tab}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              onReorder={handleReorder}
              sensors={sensors}
            />
          ))}
        </div>
      )}

      <ResourceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        resource={editingResource}
        defaultTabId={defaultTabId}
        defaultSection={defaultSection}
        onSaved={() => {
          setFormOpen(false);
          fetchAll();
        }}
      />
    </div>
  );
}

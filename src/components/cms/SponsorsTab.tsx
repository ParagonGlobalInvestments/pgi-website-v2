'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import SponsorForm from './SponsorForm';
import { SortableRow } from './SortableRow';
import type { CmsSponsor, SponsorType } from '@/lib/cms/types';

export default function SponsorsTab() {
  const [sponsors, setSponsors] = useState<CmsSponsor[]>([]);
  const [partners, setPartners] = useState<CmsSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<SponsorType>('sponsor');
  const [editingItem, setEditingItem] = useState<CmsSponsor | undefined>(
    undefined
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/sponsors');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: CmsSponsor[] = await res.json();
      setSponsors(
        data
          .filter(s => s.type === 'sponsor')
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      setPartners(
        data
          .filter(s => s.type === 'partner')
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch {
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDragEnd = async (
    event: DragEndEvent,
    items: CmsSponsor[],
    setItems: React.Dispatch<React.SetStateAction<CmsSponsor[]>>
  ) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(s => s.id === active.id);
    const newIndex = items.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const reorderItems = reordered.map((item, idx) => ({
      id: item.id,
      sort_order: idx,
    }));

    try {
      const res = await fetch('/api/cms/sponsors/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderItems }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
    } catch {
      toast.error('Failed to reorder');
      fetchAll();
    }
  };

  const undoRef = useRef<{ id: string; undone: boolean } | null>(null);

  const handleDelete = (item: CmsSponsor) => {
    const list = item.type === 'sponsor' ? sponsors : partners;
    const setList = item.type === 'sponsor' ? setSponsors : setPartners;
    const snapshot = [...list];
    setList(prev => prev.filter(s => s.id !== item.id));

    const undo = { id: item.id, undone: false };
    undoRef.current = undo;

    toast(`Deleted "${item.display_name}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          undo.undone = true;
          setList(snapshot);
        },
      },
      duration: 5000,
      onAutoClose: () => commitDelete(item.id, undo, snapshot, setList),
      onDismiss: () => commitDelete(item.id, undo, snapshot, setList),
    });
  };

  const commitDelete = async (
    id: string,
    undo: { undone: boolean },
    snapshot: CmsSponsor[],
    setList: React.Dispatch<React.SetStateAction<CmsSponsor[]>>
  ) => {
    if (undo.undone) return;
    try {
      const res = await fetch(`/api/cms/sponsors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      toast.error('Failed to delete — restoring');
      setList(snapshot);
    }
  };

  const handleEdit = (item: CmsSponsor) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormOpen(true);
  };

  const handleAdd = (type: SponsorType) => {
    setEditingItem(undefined);
    setFormType(type);
    setFormOpen(true);
  };

  const renderTable = (
    items: CmsSponsor[],
    setItems: React.Dispatch<React.SetStateAction<CmsSponsor[]>>,
    type: SponsorType
  ) => {
    const label = type === 'sponsor' ? 'Sponsors' : 'Partners';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{label}</h3>
          <Button size="sm" onClick={() => handleAdd(type)}>
            <Plus className="h-4 w-4 mr-1" />
            Add {type === 'sponsor' ? 'Sponsor' : 'Partner'}
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 py-4 text-center border rounded-lg">
            No {label.toLowerCase()} yet.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={e => handleDragEnd(e, items, setItems)}
              modifiers={[restrictToVerticalAxis]}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Website
                    </TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContext
                  items={items.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {items.map((item, idx) => (
                      <SortableRow key={item.id} id={item.id}>
                        <TableCell className="text-gray-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {item.display_name}
                          </span>
                          {item.website && (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block sm:hidden text-xs text-blue-600 hover:underline mt-0.5 truncate max-w-[180px]"
                            >
                              {item.website
                                .replace(/^https?:\/\//, '')
                                .slice(0, 30)}
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600 hidden sm:table-cell">
                          {item.website ? (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {item.website
                                .replace(/^https?:\/\//, '')
                                .slice(0, 40)}
                            </a>
                          ) : (
                            '--'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </SortableRow>
                    ))}
                  </TableBody>
                </SortableContext>
              </Table>
            </DndContext>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 py-8 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      {renderTable(sponsors, setSponsors, 'sponsor')}
      {renderTable(partners, setPartners, 'partner')}

      <SponsorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        type={formType}
        sponsor={editingItem}
        onSaved={() => {
          setFormOpen(false);
          fetchAll();
        }}
      />
    </div>
  );
}

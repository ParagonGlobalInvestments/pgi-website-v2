'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';
import SponsorForm from './SponsorForm';
import { CmsTabLayout, type CmsColumn } from './CmsTabLayout';
import type { CmsSponsor, SponsorType } from '@/lib/cms/types';

/**
 * SponsorsTab uses a single API endpoint that returns both sponsors and
 * partners, then splits them into two independent sortable lists. Because
 * of this dual-list pattern, it manages its own fetch/reorder/delete
 * rather than using useCmsData (which assumes one list per hook).
 */
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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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

  const makeDragHandler =
    (
      items: CmsSponsor[],
      setItems: React.Dispatch<React.SetStateAction<CmsSponsor[]>>
    ) =>
    async (event: DragEndEvent) => {
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

  const handleDelete = useCallback(
    (item: CmsSponsor) => {
      const setList = item.type === 'sponsor' ? setSponsors : setPartners;
      const list = item.type === 'sponsor' ? sponsors : partners;
      const snapshot = [...list];
      setList(prev => prev.filter(s => s.id !== item.id));

      const undo = { id: item.id, undone: false };
      undoRef.current = undo;

      const commitDelete = async () => {
        if (undo.undone) return;
        try {
          const res = await fetch(`/api/cms/sponsors/${item.id}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete');
        } catch {
          toast.error('Failed to delete \u2014 restoring');
          setList(snapshot);
        }
      };

      toast(`Deleted "${item.display_name}"`, {
        action: {
          label: 'Undo',
          onClick: () => {
            undo.undone = true;
            setList(snapshot);
          },
        },
        duration: 5000,
        onAutoClose: commitDelete,
        onDismiss: commitDelete,
      });
    },
    [sponsors, partners]
  );

  const columns: CmsColumn<CmsSponsor>[] = useMemo(
    () => [
      {
        header: 'Name',
        render: (item: CmsSponsor) => (
          <>
            <span className="font-medium">{item.display_name}</span>
            {item.website && (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block sm:hidden text-xs text-blue-600 hover:underline mt-0.5 truncate max-w-[180px]"
              >
                {item.website.replace(/^https?:\/\//, '').slice(0, 30)}
              </a>
            )}
          </>
        ),
      },
      {
        header: 'Website',
        className: 'hidden sm:table-cell',
        render: (item: CmsSponsor) =>
          item.website ? (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.website.replace(/^https?:\/\//, '').slice(0, 40)}
            </a>
          ) : (
            <span className="text-gray-600">--</span>
          ),
      },
    ],
    []
  );

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
      <CmsTabLayout
        items={sponsors}
        loading={false}
        count={sponsors.length}
        noun={['sponsor', 'sponsors']}
        columns={columns}
        onAdd={() => {
          setEditingItem(undefined);
          setFormType('sponsor');
          setFormOpen(true);
        }}
        onEdit={item => {
          setEditingItem(item);
          setFormType(item.type);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
        onDragEnd={makeDragHandler(sponsors, setSponsors)}
        sensors={sensors}
        emptyMessage="No sponsors yet."
        itemLabel={item => item.display_name}
      />

      <div className="border-t border-gray-100 pt-6" />

      <CmsTabLayout
        items={partners}
        loading={false}
        count={partners.length}
        noun={['partner', 'partners']}
        columns={columns}
        onAdd={() => {
          setEditingItem(undefined);
          setFormType('partner');
          setFormOpen(true);
        }}
        onEdit={item => {
          setEditingItem(item);
          setFormType(item.type);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
        onDragEnd={makeDragHandler(partners, setPartners)}
        sensors={sensors}
        emptyMessage="No partners yet."
        itemLabel={item => item.display_name}
      />

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

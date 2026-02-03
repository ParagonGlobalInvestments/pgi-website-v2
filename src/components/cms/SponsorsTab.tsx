'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import SponsorForm from './SponsorForm';
import type { CmsSponsor, SponsorType } from '@/lib/cms/types';

export default function SponsorsTab() {
  const [sponsors, setSponsors] = useState<CmsSponsor[]>([]);
  const [partners, setPartners] = useState<CmsSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<SponsorType>('sponsor');
  const [editingItem, setEditingItem] = useState<CmsSponsor | undefined>(undefined);
  const [reordering, setReordering] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/sponsors');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: CmsSponsor[] = await res.json();
      const sortedSponsors = data
        .filter(s => s.type === 'sponsor')
        .sort((a, b) => a.sort_order - b.sort_order);
      const sortedPartners = data
        .filter(s => s.type === 'partner')
        .sort((a, b) => a.sort_order - b.sort_order);
      setSponsors(sortedSponsors);
      setPartners(sortedPartners);
    } catch {
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleReorder = async (
    items: CmsSponsor[],
    setItems: React.Dispatch<React.SetStateAction<CmsSponsor[]>>,
    index: number,
    direction: 'up' | 'down'
  ) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const itemA = items[index];
    const itemB = items[swapIndex];
    const key = `${itemA.id}-${direction}`;
    setReordering(key);

    // Optimistic update
    const updated = [...items];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setItems(updated);

    try {
      const res = await fetch('/api/cms/sponsors/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: itemA.id, sort_order: itemB.sort_order },
            { id: itemB.id, sort_order: itemA.sort_order },
          ],
        }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
    } catch {
      toast.error('Failed to reorder');
      fetchAll();
    } finally {
      setReordering(null);
    }
  };

  const handleDelete = async (item: CmsSponsor) => {
    if (!confirm(`Delete "${item.display_name}"?`)) return;
    try {
      const res = await fetch(`/api/cms/sponsors/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.display_name}</TableCell>
                  <TableCell className="text-gray-600">
                    {item.website ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.website.replace(/^https?:\/\//, '').slice(0, 40)}
                      </a>
                    ) : (
                      '--'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={idx === 0 || reordering !== null}
                        onClick={() => handleReorder(items, setItems, idx, 'up')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={idx === items.length - 1 || reordering !== null}
                        onClick={() => handleReorder(items, setItems, idx, 'down')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

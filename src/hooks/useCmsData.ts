'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { deleteWithUndo } from '@/lib/cms/deleteWithUndo';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UseCmsDataOptions<T> {
  endpoint: string;
  sortBy?: keyof T;
  query?: string;
}

interface UseCmsDataReturn<T extends { id: string }> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  refetch: () => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  handleDelete: (item: T, displayName: string) => void;
  sensors: ReturnType<typeof useSensors>;
}

export function useCmsData<T extends { id: string }>({
  endpoint,
  sortBy,
  query,
}: UseCmsDataOptions<T>): UseCmsDataReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const url = query ? `${endpoint}?${query}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: T[] = await res.json();
      if (sortBy) {
        data.sort((a, b) => (a[sortBy] as number) - (b[sortBy] as number));
      }
      setItems(data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoint, sortBy, query]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(prev, oldIndex, newIndex);

        const reorderItems = reordered.map((item, idx) => ({
          id: item.id,
          sort_order: idx,
        }));

        fetch(`${endpoint}/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reorderItems }),
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to reorder');
          })
          .catch(() => {
            toast.error('Failed to reorder');
            refetch();
          });

        return reordered;
      });
    },
    [endpoint, refetch]
  );

  const handleDelete = useCallback(
    (item: T, displayName: string) => {
      const index = items.findIndex(i => i.id === item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));

      deleteWithUndo(`${endpoint}/${item.id}`, displayName, () => {
        setItems(prev => {
          if (prev.some(i => i.id === item.id)) return prev;
          const restored = [...prev];
          restored.splice(Math.max(0, index), 0, item);
          return restored;
        });
      });
    },
    [endpoint, items]
  );

  return {
    items,
    setItems,
    loading,
    refetch,
    handleDragEnd,
    handleDelete,
    sensors,
  };
}

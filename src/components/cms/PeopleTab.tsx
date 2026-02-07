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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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
import Image from 'next/image';
import PersonForm from './PersonForm';
import { SortableRow } from './SortableRow';
import type { CmsPerson, PeopleGroupSlug } from '@/lib/cms/types';
import { PEOPLE_GROUPS } from '@/lib/cms/types';

export default function PeopleTab() {
  const [groupSlug, setGroupSlug] = useState<PeopleGroupSlug>('officers');
  const [people, setPeople] = useState<CmsPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CmsPerson | undefined>(
    undefined
  );

  const groupConfig = PEOPLE_GROUPS.find(g => g.slug === groupSlug);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/people?group=${groupSlug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPeople(data);
    } catch {
      toast.error('Failed to load people');
    } finally {
      setLoading(false);
    }
  }, [groupSlug]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = people.findIndex(p => p.id === active.id);
    const newIndex = people.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const reordered = arrayMove(people, oldIndex, newIndex);
    setPeople(reordered);

    // Build sort_order updates — assign sequential order
    const items = reordered.map((person, idx) => ({
      id: person.id,
      sort_order: idx,
    }));

    try {
      const res = await fetch('/api/cms/people/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
    } catch {
      toast.error('Failed to reorder');
      fetchPeople();
    }
  };

  const undoRef = useRef<{ id: string; undone: boolean } | null>(null);

  const handleDelete = (person: CmsPerson) => {
    const snapshot = [...people];
    setPeople(prev => prev.filter(p => p.id !== person.id));

    const undo = { id: person.id, undone: false };
    undoRef.current = undo;

    toast(`Deleted "${person.name}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          undo.undone = true;
          setPeople(snapshot);
        },
      },
      duration: 5000,
      onAutoClose: () => commitDelete(person.id, undo, snapshot),
      onDismiss: () => commitDelete(person.id, undo, snapshot),
    });
  };

  const commitDelete = async (
    id: string,
    undo: { undone: boolean },
    snapshot: CmsPerson[]
  ) => {
    if (undo.undone) return;
    try {
      const res = await fetch(`/api/cms/people/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    } catch {
      toast.error('Failed to delete — restoring');
      setPeople(snapshot);
    }
  };

  const handleEdit = (person: CmsPerson) => {
    setEditingPerson(person);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingPerson(undefined);
    setFormOpen(true);
  };

  const IMAGE_FIELDS = ['headshot_url', 'banner_url'];

  const getDetailValue = (person: CmsPerson): string => {
    if (!groupConfig) return '';
    const fields = groupConfig.fields.filter(
      f => f !== 'linkedin' && !IMAGE_FIELDS.includes(f)
    );
    const parts: string[] = [];
    for (const f of fields) {
      const val = person[f];
      if (val) parts.push(val);
    }
    return parts.join(' / ') || '--';
  };

  const getDetailHeader = (): string => {
    if (!groupConfig) return 'Details';
    const fields = groupConfig.fields.filter(
      f => f !== 'linkedin' && !IMAGE_FIELDS.includes(f)
    );
    if (fields.length === 0) return 'Details';
    const labels: Record<string, string> = {
      title: 'Title',
      school: 'School',
      company: 'Company',
    };
    return fields.map(f => labels[f] || f).join(' / ');
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select
          value={groupSlug}
          onValueChange={v => setGroupSlug(v as PeopleGroupSlug)}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PEOPLE_GROUPS.map(g => (
              <SelectItem key={g.slug} value={g.slug}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Person
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : people.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">
          No people in this group yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {getDetailHeader()}
                  </TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={people.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {people.map((person, idx) => (
                    <SortableRow key={person.id} id={person.id}>
                      <TableCell className="text-gray-500">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {person.headshot_url ? (
                            <Image
                              src={person.headshot_url}
                              alt=""
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-medium flex items-center justify-center flex-shrink-0">
                              {person.name
                                .split(' ')
                                .map(w => w[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <span className="font-medium">{person.name}</span>
                            <span className="block sm:hidden text-xs text-gray-500 mt-0.5">
                              {getDetailValue(person)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 hidden sm:table-cell">
                        {getDetailValue(person)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => handleEdit(person)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(person)}
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

      <PersonForm
        key={editingPerson?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        groupSlug={groupSlug}
        person={editingPerson}
        onSaved={() => {
          setFormOpen(false);
          fetchPeople();
        }}
      />
    </div>
  );
}

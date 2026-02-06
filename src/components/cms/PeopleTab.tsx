'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
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
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import PersonForm from './PersonForm';
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
  const [reordering, setReordering] = useState<string | null>(null);

  const groupConfig = PEOPLE_GROUPS.find(g => g.slug === groupSlug);

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

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= people.length) return;

    const itemA = people[index];
    const itemB = people[swapIndex];
    const key = `${itemA.id}-${direction}`;
    setReordering(key);

    // Optimistic update
    const updated = [...people];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setPeople(updated);

    try {
      const res = await fetch('/api/cms/people/reorder', {
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
      fetchPeople();
    } finally {
      setReordering(null);
    }
  };

  const handleDelete = async (person: CmsPerson) => {
    if (!confirm(`Delete "${person.name}"?`)) return;
    try {
      const res = await fetch(`/api/cms/people/${person.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted');
      fetchPeople();
    } catch {
      toast.error('Failed to delete');
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

  /** Return the contextual detail column value based on which fields the group uses */
  const getDetailValue = (person: CmsPerson): string => {
    if (!groupConfig) return '';
    const fields = groupConfig.fields.filter(f => f !== 'linkedin');
    const parts: string[] = [];
    for (const f of fields) {
      const val = person[f];
      if (val) parts.push(val);
    }
    return parts.join(' / ') || '--';
  };

  const getDetailHeader = (): string => {
    if (!groupConfig) return 'Details';
    const fields = groupConfig.fields.filter(f => f !== 'linkedin');
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {getDetailHeader()}
                </TableHead>
                <TableHead className="w-28 sm:w-32 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person, idx) => (
                <TableRow key={person.id}>
                  <TableCell className="text-gray-500">{idx + 1}</TableCell>
                  <TableCell>
                    <span className="font-medium">{person.name}</span>
                    <span className="block sm:hidden text-xs text-gray-500 mt-0.5">
                      {getDetailValue(person)}
                    </span>
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
                        disabled={idx === 0 || reordering !== null}
                        onClick={() => handleReorder(idx, 'up')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8"
                        disabled={
                          idx === people.length - 1 || reordering !== null
                        }
                        onClick={() => handleReorder(idx, 'down')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PersonForm
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

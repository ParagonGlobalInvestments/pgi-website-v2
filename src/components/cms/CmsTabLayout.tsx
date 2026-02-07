'use client';

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
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
import { SortableRow } from './SortableRow';

export interface CmsColumn<T> {
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface CmsTabLayoutProps<T extends { id: string }> {
  items: T[];
  loading: boolean;
  count: number;
  noun: [string, string];
  columns: CmsColumn<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  emptyMessage?: string;
  /** Extra element rendered before the Add button (e.g. group selector) */
  headerLeft?: React.ReactNode;
  /** Section heading (e.g. "Sponsors") */
  sectionTitle?: string;
  /** Accessible name getter for edit/delete buttons */
  itemLabel?: (item: T) => string;
}

export function CmsTabLayout<T extends { id: string }>({
  items,
  loading,
  count,
  noun,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onDragEnd,
  sensors,
  emptyMessage,
  headerLeft,
  sectionTitle,
  itemLabel,
}: CmsTabLayoutProps<T>) {
  const countLabel = `${count} ${count === 1 ? noun[0] : noun[1]}`;
  const empty = emptyMessage ?? `No ${noun[1]} yet.`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {headerLeft}
          {sectionTitle && (
            <h3 className="text-sm font-semibold text-gray-700">
              {sectionTitle}
            </h3>
          )}
          <span className="text-xs tabular-nums text-gray-400">
            {countLabel}
          </span>
        </div>
        <Button size="sm" className="h-8 text-sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">{empty}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="w-8" />
                  {columns.map(col => (
                    <TableHead key={col.header} className={col.className}>
                      {col.header}
                    </TableHead>
                  ))}
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {items.map(item => (
                    <SortableRow key={item.id} id={item.id}>
                      {columns.map(col => (
                        <TableCell key={col.header} className={col.className}>
                          {col.render(item)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={
                              itemLabel ? `Edit ${itemLabel(item)}` : 'Edit'
                            }
                            onClick={() => onEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            aria-label={
                              itemLabel ? `Delete ${itemLabel(item)}` : 'Delete'
                            }
                            onClick={() => onDelete(item)}
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
}

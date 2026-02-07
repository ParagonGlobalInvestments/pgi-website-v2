'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow, TableCell } from '@/components/ui/table';
import { GripVertical } from 'lucide-react';

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SortableRow({ id, children, disabled }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group hover:bg-gray-50/60 transition-colors"
    >
      <TableCell className="w-8 px-1 hidden sm:table-cell">
        <button
          type="button"
          className="p-1 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 transition-colors touch-none"
          aria-label="Drag to reorder"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/utils';

interface ProgressTrackerProps {
  storageKey: string;
  items: { id: string; title: string }[];
  className?: string;
}

export function ProgressTracker({
  storageKey,
  items,
  className,
}: ProgressTrackerProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedItems(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }
  }, [storageKey]);

  const progress = (completedItems.size / items.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {completedItems.size} / {items.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#003E6B] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2">
        {items.map(item => {
          const isCompleted = completedItems.has(item.id);
          return (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={cn(
                  isCompleted ? 'text-gray-900 font-medium' : 'text-gray-600'
                )}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for managing completion
export function useProgressTracker(storageKey: string) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedItems(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }
  }, [storageKey]);

  const markComplete = (itemId: string) => {
    const updated = new Set(completedItems);
    updated.add(itemId);
    setCompletedItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(updated)));
  };

  const markIncomplete = (itemId: string) => {
    const updated = new Set(completedItems);
    updated.delete(itemId);
    setCompletedItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(updated)));
  };

  const toggleComplete = (itemId: string) => {
    if (completedItems.has(itemId)) {
      markIncomplete(itemId);
    } else {
      markComplete(itemId);
    }
  };

  return {
    completedItems,
    markComplete,
    markIncomplete,
    toggleComplete,
    isCompleted: (itemId: string) => completedItems.has(itemId),
  };
}

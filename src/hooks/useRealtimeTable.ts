'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Calls `onUpdate` whenever any INSERT, UPDATE, or DELETE occurs.
 * Auto-cleans up the subscription on unmount.
 */
export function useRealtimeTable(table: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);
}

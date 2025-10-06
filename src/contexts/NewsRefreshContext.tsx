'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface NewsRefreshContextType {
  // Trigger refresh for all news feeds
  triggerRefresh: () => void;
  // Register a news component's refresh function
  registerRefreshCallback: (id: string, callback: () => Promise<void>) => void;
  // Unregister when component unmounts
  unregisterRefreshCallback: (id: string) => void;
  // Time until next auto-refresh (in seconds)
  timeUntilRefresh: number;
  // Last refresh timestamp
  lastRefreshed: Date | null;
  // Whether a refresh is currently in progress
  isRefreshing: boolean;
}

const NewsRefreshContext = createContext<NewsRefreshContextType | undefined>(
  undefined
);

const AUTO_REFRESH_INTERVAL = 600000; // 10 minutes in milliseconds
const COUNTDOWN_INTERVAL = 1000; // 1 second

export function NewsRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshCallbacks, setRefreshCallbacks] = useState<
    Map<string, () => Promise<void>>
  >(new Map());
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(600); // 10 minutes in seconds
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Register a news component's refresh function
  const registerRefreshCallback = useCallback(
    (id: string, callback: () => Promise<void>) => {
      setRefreshCallbacks(prev => {
        const newMap = new Map(prev);
        newMap.set(id, callback);
        return newMap;
      });
    },
    []
  );

  // Unregister when component unmounts
  const unregisterRefreshCallback = useCallback((id: string) => {
    setRefreshCallbacks(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Trigger refresh for all registered news feeds
  const triggerRefresh = useCallback(async () => {
    if (isRefreshing || refreshCallbacks.size === 0) return;

    setIsRefreshing(true);
    try {
      // Call all registered refresh callbacks in parallel
      await Promise.all(
        Array.from(refreshCallbacks.values()).map(callback => callback())
      );
      setLastRefreshed(new Date());
      setTimeUntilRefresh(600); // Reset countdown
    } catch (error) {
      console.error('Error refreshing news feeds:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCallbacks, isRefreshing]);

  // Countdown timer (updates every second)
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          return 600; // Reset to 10 minutes
        }
        return prev - 1;
      });
    }, COUNTDOWN_INTERVAL);

    return () => clearInterval(countdownInterval);
  }, []);

  // Auto-refresh interval (triggers every 10 minutes)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      triggerRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(autoRefreshInterval);
  }, [triggerRefresh]);

  // Initial refresh on mount (after components register)
  useEffect(() => {
    // Wait a bit for components to register their callbacks
    const initialRefreshTimer = setTimeout(() => {
      if (refreshCallbacks.size > 0) {
        triggerRefresh();
      }
    }, 1000);

    return () => clearTimeout(initialRefreshTimer);
  }, [refreshCallbacks.size]); // Only trigger when first component registers

  // Handle page visibility changes (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && refreshCallbacks.size > 0) {
        // When tab becomes visible again, check if it's been > 5 minutes
        if (lastRefreshed) {
          const timeSinceLastRefresh = Date.now() - lastRefreshed.getTime();
          const fiveMinutes = 300000; // 5 minutes in milliseconds

          if (timeSinceLastRefresh > fiveMinutes) {
            console.log(
              'Tab became active after 5+ minutes, triggering refresh'
            );
            triggerRefresh();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastRefreshed, refreshCallbacks.size, triggerRefresh]);

  return (
    <NewsRefreshContext.Provider
      value={{
        triggerRefresh,
        registerRefreshCallback,
        unregisterRefreshCallback,
        timeUntilRefresh,
        lastRefreshed,
        isRefreshing,
      }}
    >
      {children}
    </NewsRefreshContext.Provider>
  );
}

// Custom hook to use the news refresh context
export function useNewsRefresh() {
  const context = useContext(NewsRefreshContext);
  if (context === undefined) {
    throw new Error('useNewsRefresh must be used within a NewsRefreshProvider');
  }
  return context;
}

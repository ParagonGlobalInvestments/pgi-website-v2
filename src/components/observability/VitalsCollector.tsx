'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface QueuedVital {
  metricType: string;
  value: number;
  rating: string;
  path: string;
  deviceType: string;
  browser: string;
  os: string;
  deploymentId?: string;
}

// Batching configuration
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000;

// Generate a session ID for tracking unique sessions
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('obs_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('obs_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getBrowserInfo(): { browser: string; os: string } {
  if (typeof navigator === 'undefined') return { browser: 'unknown', os: 'unknown' };

  const ua = navigator.userAgent;
  let browser = 'unknown';
  let os = 'unknown';

  // Browser detection
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  // OS detection
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

  return { browser, os };
}

// Module-level queue (persists across re-renders)
let vitalsQueue: QueuedVital[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

async function flushQueue() {
  if (vitalsQueue.length === 0) return;

  const batch = [...vitalsQueue];
  vitalsQueue = [];

  try {
    await fetch('/api/observability/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
      keepalive: true,
    });
  } catch {
    // Re-queue failed items (with limit)
    vitalsQueue = [...batch.slice(-BATCH_SIZE), ...vitalsQueue].slice(0, BATCH_SIZE * 2);
  }
}

function queueVital(vital: WebVitalMetric, path: string) {
  const { browser, os } = getBrowserInfo();

  vitalsQueue.push({
    metricType: vital.name,
    value: vital.value,
    rating: vital.rating,
    path,
    deviceType: getDeviceType(),
    browser,
    os,
    deploymentId: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  });

  if (vitalsQueue.length >= BATCH_SIZE) {
    flushQueue();
  }
}

async function trackPageview(path: string) {
  const { browser, os } = getBrowserInfo();

  try {
    await fetch('/api/observability/pageviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'pageview',
        path,
        referrer: document.referrer || null,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
        browser,
        os,
        deploymentId: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
      }),
      keepalive: true,
    });
  } catch {
    // Silently fail - observability should never break the app
  }
}

export function VitalsCollector() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Track pageview on path change
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      trackPageview(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;
    isInitialized = true;

    // Set up periodic flush
    flushTimer = setInterval(flushQueue, FLUSH_INTERVAL);

    // Flush on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushQueue();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up global error handler
    const handleError = (event: ErrorEvent) => {
      const { browser, os } = getBrowserInfo();

      fetch('/api/observability/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'javascript',
          message: event.message || 'Unknown error',
          stack: event.error?.stack?.slice(0, 5000),
          path: window.location.pathname,
          browser,
          os,
          userAgent: navigator.userAgent,
          deploymentId: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
        }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('error', handleError);

    // Set up unhandled rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      const { browser, os } = getBrowserInfo();
      const message = event.reason?.message || String(event.reason) || 'Unhandled promise rejection';

      fetch('/api/observability/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'promise',
          message: message.slice(0, 2000),
          stack: event.reason?.stack?.slice(0, 5000),
          path: window.location.pathname,
          browser,
          os,
          userAgent: navigator.userAgent,
          deploymentId: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
        }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('unhandledrejection', handleRejection);

    // Dynamic import of web-vitals
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const reportVital = (metric: WebVitalMetric) => {
        queueVital(metric, window.location.pathname);
      };

      onCLS(reportVital);
      onFCP(reportVital);
      onLCP(reportVital);
      onTTFB(reportVital);
      onINP(reportVital);
    }).catch(() => {
      // web-vitals failed to load - gracefully degrade
    });

    return () => {
      if (flushTimer) clearInterval(flushTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      flushQueue();
      isInitialized = false;
    };
  }, []);

  return null;
}

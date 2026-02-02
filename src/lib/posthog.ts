'use client';
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    person_profiles: 'identified_only',
    disable_session_recording: true,
    capture_performance: false,
    disable_scroll_properties: false,
    scroll_root_selector: 'body',
  });
}

// Utility functions for consistent tracking
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, {
      ...properties,
      $current_url: window.location.href,
      page_title: document.title,
      timestamp: new Date().toISOString(),
    });
  }
};

export const trackPageSection = (pathname: string): string => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/about') || pathname === '/who-we-are')
    return 'about';
  if (pathname.startsWith('/members')) return 'members';
  if (pathname.startsWith('/national-committee')) return 'leadership';
  if (pathname.startsWith('/placements')) return 'placements';
  if (pathname.startsWith('/apply')) return 'recruitment';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/education')) return 'education';
  if (pathname.startsWith('/investment-strategy')) return 'strategy';
  if (pathname.startsWith('/sponsors')) return 'sponsors';
  return 'other';
};

export const trackPageType = (pathname: string): string => {
  if (pathname === '/') return 'landing';
  if (pathname === '/apply') return 'conversion';
  if (pathname === '/contact') return 'conversion';
  if (pathname.includes('/team')) return 'team_profile';
  return 'informational';
};

export default posthog;

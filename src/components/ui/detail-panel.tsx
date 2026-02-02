'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Responsive detail panel rendered via React Portal (document.body).
 * - Desktop (sm+): slides in from the right as a sidebar panel
 * - Mobile: slides up from the bottom as a sheet
 *
 * Portal rendering guarantees no parent CSS (space-y, margin, padding)
 * can leak into the fixed-position overlay.
 */
export function DetailPanel({ isOpen, onClose, children }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Only render portal after client-side hydration
  useEffect(() => setMounted(true), []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-[90] bg-black/20 transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, right sidebar on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`
          fixed z-[95] bg-white overflow-y-auto overscroll-contain
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]

          /* Mobile: bottom sheet */
          inset-x-0 bottom-0 top-auto
          max-h-[85vh] rounded-t-2xl
          shadow-[0_-4px_24px_rgba(0,0,0,0.12)]

          /* Desktop: right sidebar */
          sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0
          sm:w-[420px] sm:max-h-full sm:rounded-t-none
          sm:border-l sm:border-gray-200
          sm:shadow-[-4px_0_24px_rgba(0,0,0,0.08)]

          ${isOpen
            ? 'translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
          }
        `}
      >
        {/* Mobile: drag handle + close in one row */}
        <div className="sm:hidden flex items-center px-2 pt-2 pb-1">
          <div className="flex-1" />
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close panel"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop: absolute close button */}
        <button
          onClick={onClose}
          className="hidden sm:flex absolute top-4 right-4 z-10 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
          aria-label="Close panel"
        >
          <FaTimes className="h-4 w-4" />
        </button>

        {/* Content — symmetric padding on mobile, right clearance on desktop */}
        <div className="p-4 sm:p-5 sm:pr-14 pb-safe text-gray-900">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

/**
 * Runtime Configuration - Single Source of Truth
 *
 * Centralized runtime configuration for portal availability and feature flags.
 * This module provides a single decision point for whether the portal is enabled.
 *
 * IMPORTANT: Do not check process.env.NODE_ENV directly for portal gating elsewhere.
 * Use the exported constants from this module instead.
 */

import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

/**
 * Whether the application is running in production mode
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Whether we're on a Vercel preview deployment (preview or development)
 * Vercel sets VERCEL_ENV to 'preview', 'development', or 'production'
 */
const isVercelPreview =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.VERCEL_ENV === 'development';

/**
 * Whether the portal is enabled.
 * Enabled in:
 * - Local development (NODE_ENV !== 'production')
 * - Vercel preview deployments (VERCEL_ENV === 'preview' or 'development')
 * Disabled in:
 * - Production deployments (NODE_ENV === 'production' AND VERCEL_ENV === 'production')
 * 
 * This is the SINGLE SOURCE OF TRUTH for portal availability
 */
export const portalEnabled = !isProd || isVercelPreview;

/**
 * Whether QA/test routes are enabled (dev-only)
 */
export const qaRoutesEnabled = !isProd;

/**
 * Assert that the portal is enabled, or call notFound()
 * Use this in server components and route handlers (not middleware)
 *
 * @throws {never} - Calls notFound() which throws internally
 */
export function assertPortalEnabledOrNotFound(): void {
  if (!portalEnabled) {
    notFound();
  }
}

/**
 * Require portal enabled for API routes, or return 404 JSON response
 * Use this in API route handlers
 *
 * @returns NextResponse with 404 status if portal is disabled, null if enabled
 */
export function requirePortalEnabledOr404(): NextResponse | null {
  if (!portalEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}


/**
 * Runtime Configuration - Single Source of Truth
 *
 * Centralized runtime configuration for portal availability.
 * Portal is enabled only when NEXT_PUBLIC_PORTAL_ENABLED is explicitly set to 'true'.
 *
 * IMPORTANT: Do not check process.env directly for portal gating elsewhere.
 * Use the exported constants from this module instead.
 */

import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

/**
 * Whether the portal is enabled.
 * Must be explicitly set to 'true' via NEXT_PUBLIC_PORTAL_ENABLED.
 *
 * This is the SINGLE SOURCE OF TRUTH for portal availability.
 */
export const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === 'true';

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

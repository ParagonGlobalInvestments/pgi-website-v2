import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values into a single Tailwind-optimized className string
 *
 * This utility combines clsx (for conditional classes) with twMerge
 * (for proper handling of Tailwind utility conflicts).
 *
 * @param inputs - Class values to be combined
 * @returns A merged className string
 *
 * @example
 * ```tsx
 * // Use conditionals and merge properly
 * <div className={cn(
 *   "base-class",
 *   isActive && "active-class",
 *   "p-4 rounded", // Will be properly merged with any other padding/rounded utilities
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a readable format
 *
 * @param dateString - ISO date string to format
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate("2023-05-15T00:00:00.000Z") // Returns "May 15, 2023"
 * ```
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
) {
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Truncates text to a specified length and adds ellipsis
 *
 * @param text - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText("This is a very long string", 10) // Returns "This is a..."
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get image source URL - handles both local paths and Supabase Storage URLs.
 * Local paths like "/sponsors/logo.png" work as-is (Next.js public folder).
 * Supabase URLs are used directly.
 */
export function getImageSrc(imagePath: string | null): string | null {
  if (!imagePath) return null;
  // Already a full URL (Supabase Storage or other)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Local path in public folder
  return imagePath;
}

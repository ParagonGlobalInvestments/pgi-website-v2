import StandaloneLayout from '@/components/layout/StandaloneLayout';

/**
 * Shared layout for all public site pages.
 * Wraps with Header/Footer via StandaloneLayout.
 *
 * Metadata is defined in each page.tsx file, not here.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

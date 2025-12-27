'use client';

// Client component wrapper - just passes through children
// The server layout handles portal availability check
export default function PortalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


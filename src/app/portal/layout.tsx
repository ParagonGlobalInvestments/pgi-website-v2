'use client';

// import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans } from 'geist/font/sans';
import '@/tailwind.css';
import '@/app/globals.css';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
    <div className={`${GeistSans.variable} antialiased`}>{children}</div>
    // </ClerkProvider>
  );
}

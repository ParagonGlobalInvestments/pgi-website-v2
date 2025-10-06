'use client';

import { GeistSans } from 'geist/font/sans';
import '@/tailwind.css';
import '@/app/globals.css';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${GeistSans.variable} antialiased`}>{children}</div>;
}

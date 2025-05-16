import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import '../tailwind.css';
import './globals.css';

// TODO: Replace with the identified font from original Paragon website
// Current placeholder fonts
// const geistSans = GeistSans({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
//   display: 'swap',
// });

// const geistMono = GeistMono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: 'Paragon Global Investments',
  description:
    'Student-run intercollegiate investment fund focused on value investing and algorithmic trading',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

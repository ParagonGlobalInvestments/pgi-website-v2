import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
// import '../tailwind.css'; // Removed this import
import './globals.css';

// Montserrat font configuration
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'PGI',
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
        <body className={`${montserrat.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

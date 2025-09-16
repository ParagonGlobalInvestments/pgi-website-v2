import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { ClerkProvider } from '@clerk/nextjs';
import { PHProvider } from '@/components/providers/PostHogProvider';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://paragoninvestments.org'),
  title: {
    default: 'Paragon Global Investments',
    template: '%s | Paragon Global Investments',
  },
  description:
    'Student-run intercollegiate investment fund combining value and systematic strategies across 8 top universities.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://paragoninvestments.org/',
    siteName: 'Paragon Global Investments',
    title: 'Paragon Global Investments',
    description:
      'Student-run intercollegiate investment fund with value + algorithmic strategies.',
    images: [
      {
        url: '/logos/pgiLogo.jpg',
        width: 1200,
        height: 630,
        alt: 'Paragon Global Investments Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paragon Global Investments',
    description:
      'Student-run intercollegiate investment fund with value + algorithmic strategies.',
    images: ['/logos/pgiLogo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'finance',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [{ rel: 'mask-icon', url: '/icons/icon-192.png', color: '#00172B' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.className}>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link
            rel="icon"
            href="/icons/icon-192.png"
            type="image/png"
            sizes="192x192"
          />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#00172B" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Legacy route redirect - runs immediately on page load
                (function() {
                  const path = window.location.pathname;
                  const isLegacyRoute = /\\.(html?|php|asp|aspx|jsp|cfm)$/i.test(path);
                  
                  if (isLegacyRoute) {
                    console.log('Client-side redirecting legacy route:', path, '-> /');
                    window.location.replace('/');
                  }
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <PHProvider>
            {children}
            <Toaster />
          </PHProvider>
          <Script
            id="org-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Paragon Global Investments',
                url: 'https://paragoninvestments.org/',
                logo: 'https://paragoninvestments.org/logos/pgiLogo.jpg',
                sameAs: [
                  'https://www.linkedin.com/company/paragon-global-investments/',
                  'https://www.instagram.com/paragoninvestmentsglobal/',
                ],
              }),
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

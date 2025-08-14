import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { ClerkProvider } from '@clerk/nextjs';
import { PHProvider } from '@/components/providers/PostHogProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paragon Global Investments',
  description:
    'Paragon Global Investments is the premier undergraduate finance organization, empowering students with investment knowledge and career opportunities.',
  keywords: [
    'finance',
    'investment',
    'undergraduate',
    'career',
    'opportunities',
    'education',
    'Paragon Global Investments',
    'PGI',
  ],
  authors: [{ name: 'Paragon Global Investments' }],
  creator: 'Paragon Global Investments',
  publisher: 'Paragon Global Investments',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://paragoninvestments.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Paragon Global Investments',
    description:
      'The premier undergraduate finance organization, empowering students with investment knowledge and career opportunities.',
    url: 'https://paragoninvestments.org',
    siteName: 'Paragon Global Investments',
    images: [
      {
        url: '/logos/pgiLogoTransparent.png',
        width: 1200,
        height: 630,
        alt: 'Paragon Global Investments Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paragon Global Investments',
    description:
      'The premier undergraduate finance organization, empowering students with investment knowledge and career opportunities.',
    images: ['/logos/pgiLogoTransparent.png'],
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
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icons/favicon.ico" type="image/x-icon" />
          <link rel="apple-touch-icon" href="/icons/favicon.ico" />
          <meta name="theme-color" content="#ffffff" />
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
        </body>
      </html>
    </ClerkProvider>
  );
}

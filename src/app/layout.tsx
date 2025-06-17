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
  metadataBase: new URL('https://pgi-website-v2.vercel.app'),
  title: 'PGI',
  description:
    'Student-run intercollegiate investment fund with 8 chapters at top universities. We utilize fundamental and systematic trading strategies with $40,000 AUM.',
  keywords: [
    'investment fund',
    'student finance',
    'quantitative trading',
    'value investing',
    'algorithmic trading',
    'university investment club',
  ],
  authors: [{ name: 'Paragon Global Investments' }],
  creator: 'Paragon Global Investments',
  publisher: 'Paragon Global Investments',

  // Open Graph tags for social sharing
  openGraph: {
    title: 'PGI',
    description:
      'Student-run intercollegiate investment fund with 8 chapters at top universities. $40,000 AUM focused on value investing and algorithmic trading.',
    url: 'https://pgi-website-v2.vercel.app',
    siteName: 'Paragon Global Investments',
    type: 'website',
    images: [
      {
        url: '/logos/pgiLogoTransparent.png',
        width: 1200,
        height: 630,
        alt: 'Paragon Global Investments Logo',
      },
    ],
    locale: 'en_US',
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'PGI',
    description:
      'Student-run intercollegiate investment fund with 8 chapters at top universities.',
    images: ['/logos/pgiLogoTransparent.png'],
    creator: '@paragonglobal',
  },

  // Apple and mobile specific
  appleWebApp: {
    capable: true,
    title: 'PGI',
    statusBarStyle: 'black-translucent',
  },

  // Additional meta tags
  other: {
    'theme-color': '#00172B',
    'msapplication-TileColor': '#00172B',
    'msapplication-config': '/browserconfig.xml',
  },

  // Icons configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.ico', sizes: '16x16' },
    ],
    apple: [
      { url: '/favicon.ico', sizes: '180x180' },
      { url: '/favicon.ico', sizes: '152x152' },
      { url: '/favicon.ico', sizes: '144x144' },
      { url: '/favicon.ico', sizes: '120x120' },
      { url: '/favicon.ico', sizes: '114x114' },
      { url: '/favicon.ico', sizes: '76x76' },
      { url: '/favicon.ico', sizes: '72x72' },
      { url: '/favicon.ico', sizes: '60x60' },
      { url: '/favicon.ico', sizes: '57x57' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        url: '/favicon.ico',
      },
      {
        rel: 'shortcut icon',
        url: '/favicon.ico',
      },
    ],
  },

  // Web app manifest
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Additional meta tags for better compatibility */}
          <meta name="theme-color" content="#00172B" />
          <meta name="msapplication-TileColor" content="#00172B" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="PGI" />

          {/* Favicon links for maximum compatibility */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body className={`${montserrat.variable} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

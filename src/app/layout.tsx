import type { Metadata } from 'next';
import Script from 'next/script';
import { Montserrat } from 'next/font/google';
import { PHProvider } from '@/components/providers/PostHogProvider';
import { VitalsCollector } from '@/components/observability/VitalsCollector';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  PortalTransitionProvider,
  NavyOverlay,
} from '@/lib/portal-transitions';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'https://paragoninvestments.org';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Paragon Global Investments',
    template: '%s | Paragon Global Investments',
  },
  description:
    'Student-run intercollegiate investment fund combining value and systematic strategies across 8 top universities.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: appUrl,
    siteName: 'Paragon Global Investments',
    title: 'Paragon Global Investments',
    description:
      'Student-run intercollegiate investment fund with value + algorithmic strategies.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Paragon Global Investments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paragon Global Investments',
    description:
      'Student-run intercollegiate investment fund with value + algorithmic strategies.',
    images: ['/api/og'],
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
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <meta name="theme-color" content="#0a1628" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
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
      <body className="min-h-screen font-sans antialiased">
        <PHProvider>
          <PortalTransitionProvider>
            <NavyOverlay />
            {children}
            <Toaster />
            <Sonner position="top-center" richColors closeButton />
            <VitalsCollector />
          </PortalTransitionProvider>
        </PHProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Paragon Global Investments',
              url: appUrl,
              logo: `${appUrl}/logos/pgiLogoTransparentDark.png`,
              sameAs: [
                'https://www.linkedin.com/company/paragon-global-investments/',
                'https://www.instagram.com/paragoninvestmentsglobal/',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

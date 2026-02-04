import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - PGI Member Portal',
  description:
    'Log in to access the PGI Member Portal and exclusive resources.',
  alternates: { canonical: '/portal/login' },
};

/**
 * Layout for the /login redirect page.
 *
 * This is a minimal layout since the page just redirects to /portal/login.
 * The actual login UI is rendered by the portal layout.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

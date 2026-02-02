import Image from 'next/image';
import Link from 'next/link';

/**
 * Portal-style shell for auth pages (sign-in, sign-up).
 * Mirrors the DashboardLayout visually — navy sidebar / top bar,
 * white content area — but without auth checks or navigation.
 */
export default function AuthShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b border-[#003E6B] shadow-lg">
        <div className="flex items-center px-4 py-3">
          <Image
            src="/logos/pgiLogoTransparent.png"
            alt="PGI"
            width={120}
            height={24}
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 flex-col h-screen sticky top-0 w-[14rem] bg-[#00172B]">
        {/* Logo */}
        <div className="px-4 py-4">
          <div className="flex w-full items-center mt-2">
            <Image
              src="/logos/pgiLogoFull.jpg"
              alt="PGI"
              width={250}
              height={40}
              className="w-auto"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[#003E6B]/50">
          <Link
            href="/"
            className="block px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md"
          >
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 min-w-0 bg-white">
        <div className="lg:p-8 p-4 pt-24 lg:pt-8 flex items-center justify-center min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

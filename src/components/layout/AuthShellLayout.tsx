import Image from 'next/image';

/**
 * Portal-style shell for the login page.
 * Mirrors the PortalLayout visually — navy sidebar / top bar,
 * white content area — but without auth checks or navigation.
 */
export default function AuthShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Override body background so iOS safe-area inset shows white, not navy */}
      <style>{`html, body { background-color: #ffffff; }`}</style>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b border-[#003E6B] shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/logos/pgiLogoTransparent.png"
            alt="PGI"
            width={120}
            height={24}
            className="h-8 w-auto"
          />
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Back to Website
          </a>
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
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
            className="block px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md"
          >
            Back to Website
          </a>
        </div>
      </aside>
      {/* Content Area */}
      <div className="flex-1 min-w-0 bg-white">
        <div className="lg:px-12 lg:py-16 px-6 pt-24 pb-8 lg:pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}

import Image from 'next/image';

/**
 * Split-screen auth layout inspired by Midday.
 * Left panel: Navy background with testimonial/value prop
 * Right panel: Clean white sign-in area
 */
export default function AuthShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Override body background for iOS safe-area */}
      <style>{`html, body { background-color: #00172B; }`}</style>

      {/* Left Panel - Branding & Testimonial (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00172B] relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00172B] via-[#001a30] to-[#002040]" />

        {/* Decorative radial gradient (like Midday's subtle sphere) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(74, 107, 177, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full w-full p-8 lg:p-12">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="Paragon Global Investments"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Testimonial - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md">
              <blockquote className="text-gray-300 text-lg leading-relaxed">
                <span className="text-gray-400">&quot;</span>
                The portal keeps our team connected with real-time access to
                member directory, resources, and event updates.{' '}
                <span className="text-white font-medium">
                  It&apos;s where collaboration happens.
                </span>
                <span className="text-gray-400">&quot;</span>
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4A6BB1]/30 flex items-center justify-center">
                  <span className="text-[#4A6BB1] text-sm font-semibold">
                    PGI
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    PGI Member Portal
                  </p>
                  <p className="text-gray-500 text-sm">
                    Exclusive member access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div>
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to Website
            </a>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 bg-white flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#00172B] px-6 py-4">
          <div className="flex items-center justify-between">
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

        {/* Sign In Content - Centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-center lg:text-left lg:px-12">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#4A6BB1] hover:underline">
              Terms of Service
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-[#4A6BB1] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

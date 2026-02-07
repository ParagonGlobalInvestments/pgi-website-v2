'use client';

import { portalEnabled } from '@/lib/runtime';
import { createClient } from '@/lib/supabase/browser';

interface HeaderAuthButtonsProps {
  variant: 'desktop' | 'mobile';
  loading: boolean;
  user: { id: string } | null;
  isPGIMember: boolean;
  handleLoginClick: (e: React.MouseEvent) => void;
  handlePortalClick: (e: React.MouseEvent) => void;
  prefetchPortalLogin: () => void;
  prefetchPortal: () => void;
}

export default function HeaderAuthButtons({
  variant,
  loading,
  user,
  isPGIMember,
  handleLoginClick,
  handlePortalClick,
  prefetchPortalLogin,
  prefetchPortal,
}: HeaderAuthButtonsProps) {
  if (variant === 'desktop') {
    return (
      <DesktopAuth
        {...{
          loading,
          user,
          isPGIMember,
          handleLoginClick,
          handlePortalClick,
          prefetchPortalLogin,
          prefetchPortal,
        }}
      />
    );
  }
  return (
    <MobileAuth
      {...{
        loading,
        user,
        isPGIMember,
        handleLoginClick,
        handlePortalClick,
        prefetchPortalLogin,
        prefetchPortal,
      }}
    />
  );
}

function DesktopAuth({
  loading,
  user,
  isPGIMember,
  handleLoginClick,
  handlePortalClick,
  prefetchPortalLogin,
  prefetchPortal,
}: Omit<HeaderAuthButtonsProps, 'variant'>) {
  if (loading) {
    return (
      <div className="py-2 px-4 rounded bg-gray-600 text-gray-300 font-bold">
        Loading...
      </div>
    );
  }

  if (user && isPGIMember && portalEnabled) {
    return (
      <div className="flex items-center pl-1 lg:pl-0">
        <button
          onClick={handlePortalClick}
          onMouseEnter={prefetchPortal}
          className="py-2 px-4 rounded-l-lg hover:bg-opacity-90 transition-colors font-bold bg-white text-black"
        >
          Portal
        </button>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="text-white lg:py-2 lg:px-4 px-2 py-1 border-2 border-white border-l-0 whitespace-nowrap rounded-r-lg text-sm hover:text-gray-300 transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }

  if (portalEnabled) {
    return (
      <button
        onClick={handleLoginClick}
        onMouseEnter={prefetchPortalLogin}
        className="lg:py-2 lg:px-4 px-3 py-1.5 rounded hover:bg-opacity-90 transition-colors font-bold bg-white text-black"
      >
        Log In
      </button>
    );
  }

  return null;
}

function MobileAuth({
  loading,
  user,
  isPGIMember,
  handleLoginClick,
  handlePortalClick,
  prefetchPortalLogin,
  prefetchPortal,
}: Omit<HeaderAuthButtonsProps, 'variant'>) {
  if (loading) {
    return (
      <div className="block py-3 px-4 bg-gray-600 text-gray-300 font-semibold rounded-lg text-center">
        Loading...
      </div>
    );
  }

  if (user && isPGIMember && portalEnabled) {
    return (
      <div className="space-y-2">
        <button
          onClick={handlePortalClick}
          onTouchStart={prefetchPortal}
          className="block w-full py-3 px-4 bg-white text-navy font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
        >
          Portal
        </button>
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.reload();
          }}
          className="block w-full py-2 px-4 text-gray-300 text-sm hover:text-white underline transition-colors text-center"
        >
          Log out
        </button>
      </div>
    );
  }

  if (portalEnabled) {
    return (
      <button
        onClick={handleLoginClick}
        onTouchStart={prefetchPortalLogin}
        className="block w-full py-3 px-4 bg-white text-navy font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
      >
        Log In
      </button>
    );
  }

  return null;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await supabase.auth.signOut();
        // Redirect to login page (middleware rewrites to /portal/login on subdomain)
        router.push('/login');
      } catch (error) {
        console.error('Error logging out:', error);
        router.push('/login');
      }
    };

    // Fallback timeout in case signOut hangs
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    performLogout();

    return () => clearTimeout(timer);
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-gray-400">Logging out</span>
      </div>
    </div>
  );
}

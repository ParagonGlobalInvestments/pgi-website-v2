"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NationalCommitteePage() {
  const router = useRouter();

  // This will automatically redirect to the Officers page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/national-committee/officers");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-navy text-white min-h-screen flex flex-col items-center justify-center px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        National Committee
      </motion.h1>

      <motion.div
        className="flex flex-col md:flex-row gap-6 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Link href="/national-committee/officers">
          <motion.div
            className="bg-navy-light border-2 border-secondary hover:bg-gray-800 transition-colors rounded-lg p-8 text-center min-w-[200px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-2xl font-bold mb-4">Officers</h2>
            <p className="text-gray-300">
              Meet the current leadership team and alumni board.
            </p>
          </motion.div>
        </Link>

        <Link href="/national-committee/founders">
          <motion.div
            className="bg-navy-light border border-gray-700 hover:border-secondary hover:bg-gray-800 transition-colors rounded-lg p-8 text-center min-w-[200px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-2xl font-bold mb-4">Founders</h2>
            <p className="text-gray-300">
              Learn about our organization's founders and chapter founders.
            </p>
          </motion.div>
        </Link>
      </motion.div>

      <motion.p
        className="text-gray-400 text-center max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Redirecting to Officers page in a moment...
      </motion.p>
    </div>
  );
}

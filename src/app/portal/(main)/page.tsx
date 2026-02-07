'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

export default function Home() {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  // TODO: Replace with a dedicated count endpoint (e.g. /api/users/count) or
  // derive from existing cached data to avoid fetching ALL users just for a count.
  useEffect(() => {
    fetch('/api/users')
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setMemberCount(data.users?.length || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PortalPageHeader
          title="Welcome back"
          description={
            memberCount !== null
              ? `${memberCount} members across 8 schools`
              : 'Loading...'
          }
        />
      </motion.div>

      {/* Feature cards — clean, no decorative icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <Link href="/portal/directory" className="block group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Member Directory
              </h2>
              <p className="text-gray-500 text-sm">
                Browse all PGI members. Search by name, filter by school,
                program, or role.
              </p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <Link href="/portal/resources" className="block group">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Resources
              </h2>
              <p className="text-gray-500 text-sm">
                Education materials, recruitment guides, and investment pitch
                reports.
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

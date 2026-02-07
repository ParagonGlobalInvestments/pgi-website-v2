'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalUser } from '@/hooks/usePortalUser';
import {
  SCHOOL_LABELS,
  ROLE_LABELS,
  PROGRAM_LABELS,
} from '@/components/portal/constants';

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

interface QuickCard {
  title: string;
  description: string;
  href: string;
}

function getCardsForRole(
  role: string | undefined,
  program: string | null | undefined
): QuickCard[] {
  const programName = program ? PROGRAM_LABELS[program] : null;

  const cards: QuickCard[] = [
    {
      title: 'Member Directory',
      description: 'Browse all PGI members. Search by name, school, or role.',
      href: '/portal/directory',
    },
    {
      title: 'Resources',
      description: programName
        ? `${programName} program materials, guides, and reports.`
        : 'Education materials, recruitment guides, and reports.',
      href: '/portal/resources',
    },
  ];

  if (role === 'admin') {
    cards.push(
      {
        title: 'Content Management',
        description: 'Edit public site content. Changes go live immediately.',
        href: '/portal/content',
      },
      {
        title: 'Analytics',
        description: 'Traffic, performance, and engagement metrics.',
        href: '/portal/observability',
      }
    );
  }

  return cards;
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = usePortalUser();

  if (isLoading) return <HomeSkeleton />;

  const firstName = user?.name?.split(' ')[0] || '';
  const metaParts = [
    user?.role ? ROLE_LABELS[user.role] : null,
    user?.program ? PROGRAM_LABELS[user.program] : null,
    user?.school ? SCHOOL_LABELS[user.school] : null,
  ].filter(Boolean);

  const cards = getCardsForRole(user?.role, user?.program);

  return (
    <div className="space-y-6">
      {/* Identity header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {firstName}
        </h1>
        {metaParts.length > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            {metaParts.join(' \u00b7 ')}
          </p>
        )}
      </motion.div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.href}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Link href={card.href} className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h2>
                <p className="text-gray-500 text-sm">{card.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

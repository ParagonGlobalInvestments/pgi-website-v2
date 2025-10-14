'use client';

import { useState, useEffect } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/browser';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { FaNewspaper, FaChartLine, FaGlobeAmericas } from 'react-icons/fa';
import MarketWatchNews from '@/components/dashboard/MarketWatchNews';
import NasdaqNews from '@/components/dashboard/NasdaqNews';
import SeekingAlphaNews from '@/components/dashboard/SeekingAlphaNews';
import MarketIndicatorsExpanded from '@/components/dashboard/MarketIndicatorsExpanded';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// Define news source interfaces and array for easy addition of new sources
interface NewsSource {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  description: string;
}

export default function NewsPage() {
  const { isLoading } = useSupabaseUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);
  const [activeTab, setActiveTab] = useState('all');

  // Define all news sources - add new sources here
  const newsSources: NewsSource[] = [
    {
      id: 'marketwatch',
      name: 'MarketWatch',
      shortName: 'MW',
      icon: <FaNewspaper className="text-green-500" />,
      component: <MarketWatchNews />,
      description: 'Top financial stories from MarketWatch',
    },
    {
      id: 'seekingalpha',
      name: 'Seeking Alpha',
      shortName: 'SA',
      icon: <FaGlobeAmericas className="text-orange-500" />,
      component: <SeekingAlphaNews />,
      description: 'Investment insights from Seeking Alpha',
    },
    {
      id: 'nasdaq',
      name: 'NASDAQ',
      shortName: 'NQ',
      icon: <FaChartLine className="text-blue-500" />,
      component: <NasdaqNews />,
      description: 'Latest news from NASDAQ',
    },
  ];

  if (isLoading || !supabaseUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-20 lg:pt-0 text-pgi-dark-blue"
      >
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className="mb-4 w-full justify-between lg:w-auto lg:justify-start">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FaNewspaper />
                All Sources
              </TabsTrigger>
              {newsSources.map(source => (
                <TabsTrigger
                  key={source.id}
                  value={source.id}
                  className="flex items-center gap-2"
                >
                  {source.icon}
                  <span className="hidden sm:inline">{source.name}</span>
                  <span className="sm:hidden">{source.shortName}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* All feeds combined */}
          <TabsContent value="all">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {newsSources.map(source => (
                <motion.div
                  key={source.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  {source.component}
                </motion.div>
              ))}
            </motion.div>

            {/* Market Indicators - Desktop only, below the news feeds */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hidden lg:block mt-6"
            >
              <MarketIndicatorsExpanded />
            </motion.div>
          </TabsContent>

          {/* Individual feed tabs */}
          {newsSources.map(source => (
            <TabsContent key={source.id} value={source.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {source.component}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </SmoothTransition>
    </ProtectedPage>
  );
}

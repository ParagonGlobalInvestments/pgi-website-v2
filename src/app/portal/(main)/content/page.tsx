'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PeopleTab from '@/components/cms/PeopleTab';
import RecruitmentTab from '@/components/cms/RecruitmentTab';
import StatisticsTab from '@/components/cms/StatisticsTab';
import TimelineTab from '@/components/cms/TimelineTab';
import SponsorsTab from '@/components/cms/SponsorsTab';
import type { User } from '@/types';

export default function ContentPage() {
  const [portalUser, setPortalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setPortalUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!portalUser || portalUser.role !== 'admin')
    return (
      <div className="p-8 text-red-600 font-medium">
        Not authorized. Admin access required.
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Content Management</h1>
      <p className="text-sm text-gray-500 mb-6">
        Edit public site content. Changes go live immediately.
      </p>
      <Tabs defaultValue="people" className="w-full">
        <TabsList>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>
        <TabsContent value="people">
          <PeopleTab />
        </TabsContent>
        <TabsContent value="recruitment">
          <RecruitmentTab />
        </TabsContent>
        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab />
        </TabsContent>
        <TabsContent value="sponsors">
          <SponsorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

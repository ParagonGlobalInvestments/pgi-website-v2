'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PeopleTab from '@/components/cms/PeopleTab';
import RecruitmentTab from '@/components/cms/RecruitmentTab';
import StatisticsTab from '@/components/cms/StatisticsTab';
import TimelineTab from '@/components/cms/TimelineTab';
import SponsorsTab from '@/components/cms/SponsorsTab';
import type { User } from '@/types';

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-52 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

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

  if (loading) return <ContentSkeleton />;
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
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          </TabsList>
        </div>
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

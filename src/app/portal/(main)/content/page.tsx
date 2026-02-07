'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PeopleTab from '@/components/cms/PeopleTab';
import RecruitmentTab from '@/components/cms/RecruitmentTab';
import StatisticsTab from '@/components/cms/StatisticsTab';
import TimelineTab from '@/components/cms/TimelineTab';
import SponsorsTab from '@/components/cms/SponsorsTab';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { usePortalUser } from '@/hooks/usePortalUser';

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
  const { user: portalUser, isLoading } = usePortalUser();

  if (isLoading) return <ContentSkeleton />;
  if (!portalUser || portalUser.role !== 'admin')
    return (
      <div className="p-8 text-red-600 font-medium">
        Not authorized. Admin access required.
      </div>
    );

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Content Management"
        description="Edit public site content. Changes go live immediately."
      />
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

'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PeopleTab from '@/components/cms/PeopleTab';
import RecruitmentTab from '@/components/cms/RecruitmentTab';
import StatisticsTab from '@/components/cms/StatisticsTab';
import TimelineTab from '@/components/cms/TimelineTab';
import SponsorsTab from '@/components/cms/SponsorsTab';
import ResourcesTab from '@/components/cms/ResourcesTab';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { usePortalUser } from '@/hooks/usePortalUser';

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-52 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1 min-w-[60px] rounded-md" />
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
    <div className="space-y-6 min-w-0">
      <PortalPageHeader
        title="Content Management"
        description="Edit public site content. Changes go live immediately."
      />
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="people" className="flex-1 min-w-0 px-2 sm:px-3">
            People
          </TabsTrigger>
          <TabsTrigger
            value="recruitment"
            className="flex-1 min-w-0 px-2 sm:px-3"
          >
            Recruit
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="flex-1 min-w-0 px-2 sm:px-3"
          >
            Stats
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1 min-w-0 px-2 sm:px-3">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="flex-1 min-w-0 px-2 sm:px-3">
            Sponsors
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="flex-1 min-w-0 px-2 sm:px-3"
          >
            Resources
          </TabsTrigger>
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
        <TabsContent value="resources">
          <ResourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

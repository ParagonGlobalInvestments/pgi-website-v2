import { Skeleton } from '@/components/ui/skeleton';

export default function ResourcesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-36 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

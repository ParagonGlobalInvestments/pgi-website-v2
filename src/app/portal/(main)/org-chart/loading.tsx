import { Skeleton } from '@/components/ui/skeleton';

export default function OrgChartLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex flex-col items-center gap-6">
        <Skeleton className="h-16 w-44 rounded-xl" />
        <div className="flex flex-wrap justify-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-44 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

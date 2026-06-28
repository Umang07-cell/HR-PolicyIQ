export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-surface-border p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-3 w-52" />
    <Skeleton className="h-3 w-40" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
    <div className="bg-slate-50 border-b border-surface-border px-4 py-3 flex gap-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-20 ml-auto" />
    </div>
    <div className="divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-surface-border p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex items-start gap-3">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <div className="space-y-2 flex-1 max-w-xs">
      <Skeleton className="h-4 w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4 rounded-2xl" />
      <Skeleton className="h-4 w-1/2 rounded-2xl" />
    </div>
  </div>
);

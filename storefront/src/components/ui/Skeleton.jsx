export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-cream-200/80 ${className}`}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-cream-300 bg-cream-50 p-3 shadow-2xs">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2 border-t border-cream-200">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function PlanCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-cream-300 bg-cream-50 p-3 shadow-2xs">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-2 border-t border-cream-200">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default Skeleton

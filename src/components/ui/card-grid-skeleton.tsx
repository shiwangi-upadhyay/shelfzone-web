export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="h-4 w-24 animate-pulse rounded bg-muted mb-2" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for table/list views. Reduces layout shift while data loads.
 * Use when loading state is true and table structure is known.
 */
interface TableSkeletonProps {
  /** Number of rows to show */
  rows?: number;
  /** Number of columns (for grid) */
  cols?: number;
  /** Optional class for container */
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`animate-pulse space-y-3 ${className}`}
      role="status"
      aria-label="Carregando tabela"
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-white/5"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-white/5"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

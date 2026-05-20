import { cn } from '../../lib/utils';

export function Progress({
  value,
  total,
  className,
  showLabel = true,
}: {
  value: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-success transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {value}/{total}
        </span>
      )}
    </div>
  );
}

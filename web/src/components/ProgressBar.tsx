export default function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress" aria-label={`${completed} of ${total} tasks complete`}>
      <div className="progress-bar" style={{ width: `${pct}%` }} />
      <span className="progress-label">
        {completed}/{total} ({pct}%)
      </span>
    </div>
  );
}

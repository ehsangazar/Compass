import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDot, CheckCircle2, Circle } from 'lucide-react';
import { api, ChangeSummary } from '../api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

const FILTERS = ['all', 'active', 'draft', 'archived'] as const;
type Filter = (typeof FILTERS)[number];

export default function ChangesList() {
  const [changes, setChanges] = useState<ChangeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    api.changes()
      .then((res) => setChanges(res.changes))
      .catch((err) => setError(String(err)));
  }, []);

  const counts = useMemo(() => {
    const c = changes ?? [];
    return {
      all: c.length,
      active: c.filter((x) => x.status === 'active').length,
      draft: c.filter((x) => x.status === 'draft').length,
      archived: c.filter((x) => x.status === 'archived').length,
    };
  }, [changes]);

  const filtered = useMemo(() => {
    if (!changes) return null;
    return filter === 'all' ? changes : changes.filter((c) => c.status === filter);
  }, [changes, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Changes"
        description="Every change proposal in this compass workspace."
      />

      {error ? (
        <Card className="p-4 text-destructive">{error}</Card>
      ) : (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="capitalize">
                {f}
                <span className="ml-1.5 rounded bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                  {counts[f]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter}>
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th className="px-4 py-2.5 text-left font-medium">Progress</th>
                    <th className="px-4 py-2.5 text-right font-medium">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No changes in this category.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <ChangeRow key={c.name} change={c} />
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ChangeRow({ change }: { change: ChangeSummary }) {
  const Icon =
    change.status === 'active' ? CircleDot : change.status === 'archived' ? CheckCircle2 : Circle;
  const iconColor =
    change.status === 'active'
      ? 'text-warning'
      : change.status === 'archived'
        ? 'text-success'
        : 'text-muted-foreground';
  const badgeVariant =
    change.status === 'active' ? 'warning' : change.status === 'archived' ? 'success' : 'muted';

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-accent/50">
      <td className="px-4 py-3">
        <Link to={`/changes/${change.name}`} className="flex items-center gap-2 font-medium">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          {change.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge variant={badgeVariant as 'warning' | 'success' | 'muted'}>{change.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <Progress value={change.progress.completed} total={change.progress.total} />
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
        {new Date(change.lastModified).toLocaleDateString()}
      </td>
    </tr>
  );
}

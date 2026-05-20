import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDot, CheckCircle2, Circle, FileText, ArrowRight } from 'lucide-react';
import { api, ChangeSummary, Overview as OverviewData, SpecSummary } from '../api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [changes, setChanges] = useState<ChangeSummary[]>([]);
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.overview(), api.changes(), api.specs()])
      .then(([overview, c, s]) => {
        setData(overview);
        setChanges(c.changes);
        setSpecs(s.specs);
      })
      .catch((err) => setError(String(err)));
  }, []);

  if (error)
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-destructive">{error}</CardContent>
      </Card>
    );

  const stats = data
    ? [
        { label: 'Active', value: data.counts.activeChanges, icon: CircleDot, accent: 'text-warning' },
        { label: 'Archived', value: data.counts.archivedChanges, icon: CheckCircle2, accent: 'text-success' },
        { label: 'Draft', value: data.counts.draftChanges, icon: Circle, accent: 'text-muted-foreground' },
        { label: 'Specs', value: data.counts.specs, icon: FileText, accent: 'text-primary' },
      ]
    : null;

  const active = changes.filter((c) => c.status === 'active');
  const recentArchived = changes
    .filter((c) => c.status === 'archived')
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Live snapshot of your compass workspace."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats
          ? stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="rounded-md bg-muted p-2">
                    <s.icon className={`h-4 w-4 ${s.accent}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold leading-tight">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active changes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/changes">
              All changes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {active.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No active changes. Create one with{' '}
              <code className="rounded bg-muted px-1.5 py-0.5">compass new change &lt;name&gt;</code>.
            </div>
          ) : (
            active.map((c) => (
              <Link
                key={c.name}
                to={`/changes/${c.name}`}
                className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
              >
                <CircleDot className="h-4 w-4 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                </div>
                <div className="w-44">
                  <Progress value={c.progress.completed} total={c.progress.total} />
                </div>
                <Badge variant="warning">active</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently archived</CardTitle>
          </CardHeader>
          <CardContent>
            {recentArchived.length === 0 ? (
              <div className="text-sm text-muted-foreground">No archived changes yet.</div>
            ) : (
              <ul className="flex flex-col gap-1">
                {recentArchived.map((c) => (
                  <li key={c.name}>
                    <Link
                      to={`/changes/${c.name}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        {c.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.lastModified).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specs</CardTitle>
          </CardHeader>
          <CardContent>
            {specs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No specs yet. Archive a change without <code className="rounded bg-muted px-1 py-0.5">--skip-specs</code> to populate this list.
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {specs.slice(0, 8).map((s) => (
                  <li key={s.name}>
                    <Link
                      to={`/specs/${s.name}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

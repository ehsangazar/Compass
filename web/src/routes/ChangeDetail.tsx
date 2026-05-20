import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useApi } from '../lib/useApi';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import Markdown from '../components/Markdown';

const ARTIFACTS = ['proposal', 'design', 'specs', 'tasks'] as const;

export default function ChangeDetail() {
  const { name } = useParams<{ name: string }>();
  const { data, error } = useApi(() => api.change(name ?? ''), [name]);

  if (error)
    return (
      <Card className="border-destructive p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="mt-6 h-9 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const statusVariant =
    data.status === 'active' ? 'warning' : data.status === 'archived' ? 'success' : 'muted';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 gap-1.5 text-muted-foreground">
        <Link to="/changes">
          <ArrowLeft className="h-3.5 w-3.5" /> Changes
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {data.name}
            <Badge variant={statusVariant as 'warning' | 'success' | 'muted'}>{data.status}</Badge>
            {data.archivedAs && (
              <span className="text-xs font-normal text-muted-foreground">
                archived as <code className="rounded bg-muted px-1.5 py-0.5">{data.archivedAs}</code>
              </span>
            )}
          </span>
        }
        description={data.description || undefined}
      />

      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Task progress
            </div>
            <Progress value={data.progress.completed} total={data.progress.total} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="proposal">
        <TabsList>
          {ARTIFACTS.map((a) => {
            const present =
              a === 'specs'
                ? data.specFiles.length > 0
                : data.artifacts.find((x) => x.artifact === a)?.exists;
            return (
              <TabsTrigger key={a} value={a} className="capitalize">
                {a}
                {!present && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
                    empty
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ARTIFACTS.map((a) => (
          <TabsContent key={a} value={a}>
            <Card>
              <CardContent className="px-6 py-5">
                {a === 'specs' ? (
                  data.specFiles.length === 0 ? (
                    <EmptyArtifact label="spec files" />
                  ) : (
                    <div className="space-y-8">
                      {data.specFiles.map((s) => (
                        <section key={s.name} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {s.name}
                          </h3>
                          <Markdown source={s.markdown} />
                        </section>
                      ))}
                    </div>
                  )
                ) : (
                  (() => {
                    const art = data.artifacts.find((x) => x.artifact === a);
                    return art && art.exists ? (
                      <Markdown source={art.markdown} />
                    ) : (
                      <EmptyArtifact label={`${a}.md`} />
                    );
                  })()
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmptyArtifact({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No <code className="rounded bg-muted px-1.5 py-0.5">{label}</code> in this change.
    </div>
  );
}

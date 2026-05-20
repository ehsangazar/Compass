import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { api } from '../api';
import { useApi } from '../lib/useApi';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

export default function SpecsList() {
  const { data, error } = useApi(() => api.specs());
  const specs = data?.specs ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Specs"
        description="Living source-of-truth for what your codebase actually does."
      />

      {error ? (
        <Card className="border-destructive p-4 text-destructive">{error}</Card>
      ) : !specs ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : specs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No specs yet. Archive a change with deltas (drop the{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">--skip-specs</code> flag) to populate this list.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {specs.map((s) => (
            <Link key={s.name} to={`/specs/${s.name}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="rounded-md bg-muted p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      modified {new Date(s.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

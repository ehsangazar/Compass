import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { useApi } from '../lib/useApi';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import Markdown from '../components/Markdown';

export default function SpecDetail() {
  const { name } = useParams<{ name: string }>();
  const { data, error } = useApi(() => api.spec(name ?? ''), [name]);

  if (error)
    return (
      <Card className="border-destructive p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 gap-1.5 text-muted-foreground">
        <Link to="/specs">
          <ArrowLeft className="h-3.5 w-3.5" /> Specs
        </Link>
      </Button>

      {!data ? (
        <>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-64 w-full" />
        </>
      ) : (
        <>
          <PageHeader
            title={data.name}
            description={`modified ${new Date(data.lastModified).toLocaleDateString()}`}
          />
          <Card>
            <CardContent className="px-6 py-5">
              <Markdown source={data.markdown} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

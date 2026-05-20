export interface Overview {
  counts: {
    activeChanges: number;
    archivedChanges: number;
    draftChanges: number;
    specs: number;
  };
}

export interface ChangeSummary {
  name: string;
  status: 'draft' | 'active' | 'archived';
  progress: { completed: number; total: number };
  lastModified: string;
  archivedAs?: string;
}

export interface SpecSummary {
  name: string;
  lastModified: string;
}

export interface ArtifactContent {
  artifact: 'proposal' | 'design' | 'tasks' | 'specs';
  exists: boolean;
  markdown: string;
}

export interface ChangeDetail extends ChangeSummary {
  description: string;
  artifacts: ArtifactContent[];
  specFiles: { name: string; markdown: string }[];
}

export interface SpecDetail extends SpecSummary {
  markdown: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json() as Promise<T>;
}

export const api = {
  overview: () => get<Overview>('/api/overview'),
  changes: () => get<{ changes: ChangeSummary[] }>('/api/changes'),
  change: (name: string) => get<ChangeDetail>(`/api/changes/${encodeURIComponent(name)}`),
  specs: () => get<{ specs: SpecSummary[] }>('/api/specs'),
  spec: (name: string) => get<SpecDetail>(`/api/specs/${encodeURIComponent(name)}`),
};

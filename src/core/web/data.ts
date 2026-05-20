import { promises as fs } from 'fs';
import path from 'path';
import { getTaskProgressForChange, TaskProgress } from '../../utils/task-progress.js';

export interface ChangeSummary {
  name: string;
  status: 'draft' | 'active' | 'archived';
  progress: TaskProgress;
  lastModified: string;
  archivedAs?: string;
}

export interface ArtifactContent {
  artifact: 'proposal' | 'design' | 'tasks';
  exists: boolean;
  markdown: string;
}

export interface SpecFile {
  name: string;
  markdown: string;
}

export interface ChangeDetail extends ChangeSummary {
  description: string;
  artifacts: ArtifactContent[];
  specFiles: SpecFile[];
}

export interface SpecSummary {
  name: string;
  lastModified: string;
}

export interface SpecDetail extends SpecSummary {
  markdown: string;
}

function isValidName(name: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== '.' && name !== '..';
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function mtime(p: string): Promise<Date> {
  const s = await fs.stat(p);
  return s.mtime;
}

async function readFileOrEmpty(p: string): Promise<{ exists: boolean; markdown: string }> {
  try {
    const markdown = await fs.readFile(p, 'utf-8');
    return { exists: true, markdown };
  } catch {
    return { exists: false, markdown: '' };
  }
}

function compassDir(repoPath: string): string {
  return path.join(repoPath, 'compass');
}

async function listChangeDirs(
  base: string,
  archived: boolean
): Promise<{ name: string; dir: string; archivedAs?: string }[]> {
  if (!(await pathExists(base))) return [];
  const out: { name: string; dir: string; archivedAs?: string }[] = [];
  const entries = await fs.readdir(base, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (!archived && e.name === 'archive') continue;
    const dir = path.join(base, e.name);
    if (archived) {
      out.push({ name: e.name.replace(/^\d{4}-\d{2}-\d{2}-/, ''), dir, archivedAs: e.name });
    } else {
      out.push({ name: e.name, dir });
    }
  }
  return out;
}

export async function loadChanges(repoPath: string): Promise<ChangeSummary[]> {
  const changesBase = path.join(compassDir(repoPath), 'changes');
  const archiveBase = path.join(changesBase, 'archive');

  const active = await listChangeDirs(changesBase, false);
  const archived = await listChangeDirs(archiveBase, true);

  const summaries: ChangeSummary[] = [];

  for (const { name, dir } of active) {
    const progress = await getTaskProgressForChange(changesBase, name);
    const status: ChangeSummary['status'] = progress.total === 0 ? 'draft' : 'active';
    summaries.push({
      name,
      status,
      progress,
      lastModified: (await mtime(dir)).toISOString(),
    });
  }

  for (const { name, dir, archivedAs } of archived) {
    const tasksPath = path.join(dir, 'tasks.md');
    let progress: TaskProgress = { total: 0, completed: 0 };
    if (await pathExists(tasksPath)) {
      const content = await fs.readFile(tasksPath, 'utf-8');
      const { countTasksFromContent } = await import('../../utils/task-progress.js');
      progress = countTasksFromContent(content);
    }
    summaries.push({
      name,
      status: 'archived',
      progress,
      lastModified: (await mtime(dir)).toISOString(),
      archivedAs,
    });
  }

  summaries.sort((a, b) => a.name.localeCompare(b.name));
  return summaries;
}

async function findChangeDir(
  repoPath: string,
  name: string
): Promise<{ dir: string; archivedAs?: string } | null> {
  if (!isValidName(name)) return null;
  const changesBase = path.join(compassDir(repoPath), 'changes');
  const direct = path.join(changesBase, name);
  if (await pathExists(direct)) {
    return { dir: direct };
  }
  const archiveBase = path.join(changesBase, 'archive');
  if (await pathExists(archiveBase)) {
    const entries = await fs.readdir(archiveBase, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const stripped = e.name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      if (stripped === name || e.name === name) {
        return { dir: path.join(archiveBase, e.name), archivedAs: e.name };
      }
    }
  }
  return null;
}

export async function loadChange(
  repoPath: string,
  name: string
): Promise<ChangeDetail | null> {
  const found = await findChangeDir(repoPath, name);
  if (!found) return null;

  const { dir, archivedAs } = found;
  const changesBase = path.join(compassDir(repoPath), 'changes');

  // README.md inside the change carries the original description as body.
  let description = '';
  const readmePath = path.join(dir, 'README.md');
  if (await pathExists(readmePath)) {
    const md = await fs.readFile(readmePath, 'utf-8');
    description = md
      .split('\n')
      .filter((l) => !l.startsWith('# '))
      .join('\n')
      .trim();
  }

  const artifactNames: ArtifactContent['artifact'][] = ['proposal', 'design', 'tasks'];
  const artifacts: ArtifactContent[] = [];
  for (const a of artifactNames) {
    const r = await readFileOrEmpty(path.join(dir, `${a}.md`));
    artifacts.push({ artifact: a, ...r });
  }

  const specFiles: SpecFile[] = [];
  const specsDir = path.join(dir, 'specs');
  if (await pathExists(specsDir)) {
    const top = await fs.readdir(specsDir, { withFileTypes: true });
    for (const e of top) {
      if (e.isDirectory()) {
        const specMd = path.join(specsDir, e.name, 'spec.md');
        if (await pathExists(specMd)) {
          specFiles.push({
            name: e.name,
            markdown: await fs.readFile(specMd, 'utf-8'),
          });
        }
      } else if (e.isFile() && e.name.endsWith('.md')) {
        specFiles.push({
          name: e.name.replace(/\.md$/, ''),
          markdown: await fs.readFile(path.join(specsDir, e.name), 'utf-8'),
        });
      }
    }
  }

  let progress = await getTaskProgressForChange(changesBase, name);
  if (progress.total === 0) {
    const tasksPath = path.join(dir, 'tasks.md');
    if (await pathExists(tasksPath)) {
      const { countTasksFromContent } = await import('../../utils/task-progress.js');
      progress = countTasksFromContent(await fs.readFile(tasksPath, 'utf-8'));
    }
  }

  const status: ChangeSummary['status'] = archivedAs
    ? 'archived'
    : progress.total === 0
      ? 'draft'
      : 'active';

  return {
    name,
    status,
    progress,
    lastModified: (await mtime(dir)).toISOString(),
    archivedAs,
    description,
    artifacts,
    specFiles,
  };
}

export async function loadSpecs(repoPath: string): Promise<SpecSummary[]> {
  const specsDir = path.join(compassDir(repoPath), 'specs');
  if (!(await pathExists(specsDir))) return [];

  const out: SpecSummary[] = [];
  const entries = await fs.readdir(specsDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const specMd = path.join(specsDir, e.name, 'spec.md');
    if (await pathExists(specMd)) {
      out.push({
        name: e.name,
        lastModified: (await mtime(specMd)).toISOString(),
      });
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export async function loadSpec(
  repoPath: string,
  name: string
): Promise<SpecDetail | null> {
  if (!isValidName(name)) return null;
  const specsDir = path.join(compassDir(repoPath), 'specs');
  const specMd = path.join(specsDir, name, 'spec.md');
  if (!(await pathExists(specMd))) return null;
  return {
    name,
    lastModified: (await mtime(specMd)).toISOString(),
    markdown: await fs.readFile(specMd, 'utf-8'),
  };
}

export interface Overview {
  counts: {
    activeChanges: number;
    archivedChanges: number;
    draftChanges: number;
    specs: number;
  };
}

export async function loadOverview(repoPath: string): Promise<Overview> {
  const [changes, specs] = await Promise.all([loadChanges(repoPath), loadSpecs(repoPath)]);
  return {
    counts: {
      activeChanges: changes.filter((c) => c.status === 'active').length,
      archivedChanges: changes.filter((c) => c.status === 'archived').length,
      draftChanges: changes.filter((c) => c.status === 'draft').length,
      specs: specs.length,
    },
  };
}

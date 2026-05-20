import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { AddressInfo } from 'net';
import type { Server } from 'http';
import { createWebServer } from '../../../src/core/web/server.js';

interface Fixture {
  root: string;
  server: Server;
  baseUrl: string;
}

let fixture: Fixture;

async function setupFixture(): Promise<Fixture> {
  const root = await mkdtemp(path.join(tmpdir(), 'compass-web-test-'));
  const changes = path.join(root, 'compass', 'changes');
  const archive = path.join(changes, 'archive', '2026-01-01-done-thing');
  const active = path.join(changes, 'active-thing');
  const draft = path.join(changes, 'draft-thing');
  const specs = path.join(root, 'compass', 'specs', 'sample-cap');

  await mkdir(archive, { recursive: true });
  await mkdir(active, { recursive: true });
  await mkdir(draft, { recursive: true });
  await mkdir(specs, { recursive: true });

  await writeFile(path.join(active, 'README.md'), '# active-thing\n\nDoing a thing');
  await writeFile(path.join(active, 'proposal.md'), '## Why\n\nBecause.');
  await writeFile(path.join(active, 'tasks.md'), '- [x] 1.1 done\n- [ ] 1.2 todo\n');

  await writeFile(path.join(draft, 'README.md'), '# draft-thing\n');

  await writeFile(path.join(archive, 'proposal.md'), '## Why\n\nArchived reason.');
  await writeFile(path.join(archive, 'tasks.md'), '- [x] 1.1 done\n- [x] 1.2 also done\n');

  await writeFile(
    path.join(specs, 'spec.md'),
    '# sample-cap\n\n## Requirements\n\nThings should happen.\n'
  );

  const server = createWebServer(root);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return { root, server, baseUrl: `http://127.0.0.1:${port}` };
}

async function getJson<T>(url: string): Promise<{ status: number; body: T }> {
  const res = await fetch(url);
  return { status: res.status, body: (await res.json()) as T };
}

beforeAll(async () => {
  fixture = await setupFixture();
});

afterAll(async () => {
  if (fixture) {
    await new Promise<void>((resolve) => fixture.server.close(() => resolve()));
    await rm(fixture.root, { recursive: true, force: true });
  }
});

describe('compass web API', () => {
  it('GET /api/overview returns counts', async () => {
    const { status, body } = await getJson<{
      counts: { activeChanges: number; archivedChanges: number; draftChanges: number; specs: number };
    }>(`${fixture.baseUrl}/api/overview`);
    expect(status).toBe(200);
    expect(body.counts).toEqual({
      activeChanges: 1,
      archivedChanges: 1,
      draftChanges: 1,
      specs: 1,
    });
  });

  it('GET /api/changes lists active, draft, and archived', async () => {
    const { status, body } = await getJson<{
      changes: Array<{ name: string; status: string; progress: { total: number; completed: number }; archivedAs?: string }>;
    }>(`${fixture.baseUrl}/api/changes`);
    expect(status).toBe(200);
    const byName = Object.fromEntries(body.changes.map((c) => [c.name, c]));
    expect(byName['active-thing'].status).toBe('active');
    expect(byName['active-thing'].progress).toEqual({ total: 2, completed: 1 });
    expect(byName['draft-thing'].status).toBe('draft');
    expect(byName['done-thing'].status).toBe('archived');
    expect(byName['done-thing'].archivedAs).toBe('2026-01-01-done-thing');
    expect(byName['done-thing'].progress).toEqual({ total: 2, completed: 2 });
  });

  it('GET /api/changes/:name returns full detail with markdown bodies', async () => {
    const { status, body } = await getJson<{
      name: string;
      description: string;
      artifacts: Array<{ artifact: string; exists: boolean; markdown: string }>;
    }>(`${fixture.baseUrl}/api/changes/active-thing`);
    expect(status).toBe(200);
    expect(body.name).toBe('active-thing');
    expect(body.description).toContain('Doing a thing');
    const proposal = body.artifacts.find((a) => a.artifact === 'proposal');
    expect(proposal?.exists).toBe(true);
    expect(proposal?.markdown).toContain('Because.');
    const design = body.artifacts.find((a) => a.artifact === 'design');
    expect(design?.exists).toBe(false);
  });

  it('GET /api/changes/:name resolves archived changes by their non-prefixed name', async () => {
    const { status, body } = await getJson<{ name: string; status: string; archivedAs?: string }>(
      `${fixture.baseUrl}/api/changes/done-thing`
    );
    expect(status).toBe(200);
    expect(body.status).toBe('archived');
    expect(body.archivedAs).toBe('2026-01-01-done-thing');
  });

  it('GET /api/changes/:name returns 404 for missing change', async () => {
    const { status, body } = await getJson<{ error: string }>(
      `${fixture.baseUrl}/api/changes/does-not-exist`
    );
    expect(status).toBe(404);
    expect(body.error).toBe('change not found');
  });

  it('rejects path-traversal in :name', async () => {
    const { status } = await getJson<{ error: string }>(
      `${fixture.baseUrl}/api/changes/..%2F..%2Fetc`
    );
    expect(status).toBe(404);
  });

  it('GET /api/specs and /api/specs/:name return the sample spec', async () => {
    const list = await getJson<{ specs: Array<{ name: string }> }>(
      `${fixture.baseUrl}/api/specs`
    );
    expect(list.status).toBe(200);
    expect(list.body.specs.map((s) => s.name)).toEqual(['sample-cap']);

    const detail = await getJson<{ name: string; markdown: string }>(
      `${fixture.baseUrl}/api/specs/sample-cap`
    );
    expect(detail.status).toBe(200);
    expect(detail.body.markdown).toContain('Things should happen.');
  });

  it('GET /api/specs/:name 404s for unknown spec', async () => {
    const res = await getJson<{ error: string }>(`${fixture.baseUrl}/api/specs/missing`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('spec not found');
  });

  it('returns 404 JSON for unknown API routes', async () => {
    const res = await getJson<{ error: string }>(`${fixture.baseUrl}/api/something/else`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('unknown api route');
  });
});

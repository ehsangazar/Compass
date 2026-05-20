import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadChange,
  loadChanges,
  loadOverview,
  loadSpec,
  loadSpecs,
} from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIC_ROOT = path.resolve(__dirname, '../../web');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res: ServerResponse, status: number, body: string | Buffer, type: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

async function serveStatic(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const urlPath = (req.url ?? '/').split('?')[0];
  let rel = decodeURIComponent(urlPath).replace(/^\/+/, '');

  // SPA fallback: any non-file request gets index.html
  let filePath = path.join(STATIC_ROOT, rel || 'index.html');

  // Block path traversal
  if (!filePath.startsWith(STATIC_ROOT)) {
    send(res, 403, 'Forbidden', 'text/plain');
    return;
  }

  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    // Fall back to SPA shell.
    filePath = path.join(STATIC_ROOT, 'index.html');
    try {
      stat = await fs.stat(filePath);
    } catch {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
  }

  if (stat.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  try {
    const body = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, body, MIME[ext] ?? 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found', 'text/plain');
  }
}

interface RouteContext {
  repoPath: string;
}

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext
): Promise<boolean> {
  const url = req.url ?? '/';
  const apiMatch = url.match(/^\/api(\/.*)?$/);
  if (!apiMatch) return false;

  const pathname = (apiMatch[1] ?? '/').split('?')[0];

  try {
    if (pathname === '/overview') {
      const data = await loadOverview(ctx.repoPath);
      sendJson(res, 200, data);
      return true;
    }
    if (pathname === '/changes') {
      const changes = await loadChanges(ctx.repoPath);
      sendJson(res, 200, { changes });
      return true;
    }
    const changeMatch = pathname.match(/^\/changes\/([^/]+)$/);
    if (changeMatch) {
      const name = decodeURIComponent(changeMatch[1]);
      const change = await loadChange(ctx.repoPath, name);
      if (!change) {
        sendJson(res, 404, { error: 'change not found', name });
        return true;
      }
      sendJson(res, 200, change);
      return true;
    }
    if (pathname === '/specs') {
      const specs = await loadSpecs(ctx.repoPath);
      sendJson(res, 200, { specs });
      return true;
    }
    const specMatch = pathname.match(/^\/specs\/([^/]+)$/);
    if (specMatch) {
      const name = decodeURIComponent(specMatch[1]);
      const spec = await loadSpec(ctx.repoPath, name);
      if (!spec) {
        sendJson(res, 404, { error: 'spec not found', name });
        return true;
      }
      sendJson(res, 200, spec);
      return true;
    }
    sendJson(res, 404, { error: 'unknown api route', path: pathname });
    return true;
  } catch (err) {
    sendJson(res, 500, { error: (err as Error).message });
    return true;
  }
}

export function createWebServer(repoPath: string): Server {
  return createServer(async (req, res) => {
    try {
      const handled = await handleApi(req, res, { repoPath });
      if (!handled) await serveStatic(req, res);
    } catch (err) {
      send(res, 500, `Server error: ${(err as Error).message}`, 'text/plain');
    }
  });
}

export interface StartOptions {
  port: number;
  host: string;
  repoPath: string;
}

export function startWebServer(opts: StartOptions): Promise<{ server: Server; url: string }> {
  return new Promise((resolve, reject) => {
    const server = createWebServer(opts.repoPath);
    server.once('error', reject);
    server.listen(opts.port, opts.host, () => {
      const url = `http://${opts.host}:${opts.port}`;
      resolve({ server, url });
    });
  });
}

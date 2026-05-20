import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { startWebServer } from '../core/web/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WebOptions {
  port?: string;
  host?: string;
  open?: boolean;
}

function openInBrowser(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '""', url] : [url];
  const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
  child.unref();
}

export async function runWebCommand(opts: WebOptions): Promise<void> {
  const port = opts.port ? Number(opts.port) : 51234;
  const host = opts.host ?? '127.0.0.1';
  const shouldOpen = opts.open !== false;

  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid --port: ${opts.port}`);
  }

  const repoPath = process.cwd();
  const compassDir = path.join(repoPath, 'compass');
  if (!existsSync(compassDir)) {
    throw new Error(
      `No compass/ directory found in ${repoPath}. Run "compass init" first.`
    );
  }

  // Confirm we have a built SPA before promising to serve it.
  // After build: dist/commands/web.js -> dist/web/index.html
  const staticIndex = path.resolve(__dirname, '../web', 'index.html');
  if (!existsSync(staticIndex)) {
    throw new Error(
      `Compass web assets missing at ${staticIndex}. Reinstall @gazarr/compass, or run "pnpm web:build" if you are developing.`
    );
  }

  const { server, url } = await startWebServer({ port, host, repoPath });

  console.log(`\n${chalk.bold('Compass web')} ready at ${chalk.cyan(url)}`);
  console.log(chalk.dim(`Serving compass/ from ${repoPath}`));
  console.log(chalk.dim('Ctrl+C to stop.\n'));

  if (shouldOpen) openInBrowser(url);

  const shutdown = (): void => {
    console.log('\nShutting down…');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

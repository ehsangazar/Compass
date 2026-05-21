import { execFileSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { createRequire } from 'module';
import chalk from 'chalk';
import { findAvailablePort, isPortAvailable } from '../utils/port.js';

const require = createRequire(import.meta.url);

const CONTAINER_NAME = 'compass-web';
// 51234 sits in the IANA dynamic range (49152-65535); no registered service
// uses it, so we dodge clashes with common dev defaults like Vite's 5173.
const DEFAULT_PORT = 51234;
const INTERNAL_PORT = 5173;

function compassVersion(): string {
  return require('../../package.json').version as string;
}

function imageTag(version: string): string {
  return `compass-web:${version}`;
}

function dockerExists(): boolean {
  try {
    execFileSync('docker', ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function ensureDocker(): void {
  if (!dockerExists()) {
    throw new Error(
      'docker is not installed or not in PATH. Install Docker Desktop (https://docker.com) or OrbStack and try again.'
    );
  }
}

function ensureCompassDir(repoPath: string): void {
  if (!existsSync(path.join(repoPath, 'compass'))) {
    throw new Error(`No compass/ directory in ${repoPath}. Run "compass init" first.`);
  }
}

function containerState(): 'running' | 'stopped' | 'absent' {
  try {
    const out = execFileSync(
      'docker',
      ['ps', '-a', '--filter', `name=^${CONTAINER_NAME}$`, '--format', '{{.State}}'],
      { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }
    ).trim();
    if (!out) return 'absent';
    return out === 'running' ? 'running' : 'stopped';
  } catch {
    return 'absent';
  }
}

function imageExists(tag: string): boolean {
  try {
    execFileSync('docker', ['image', 'inspect', tag], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function dockerfileFor(version: string): string {
  return [
    'FROM node:20-alpine',
    `RUN npm install -g @gazarr/compass@${version}`,
    'WORKDIR /work',
    `EXPOSE ${INTERNAL_PORT}`,
    `CMD ["compass", "web", "--no-open", "--host", "0.0.0.0", "--port", "${INTERNAL_PORT}"]`,
    '',
  ].join('\n');
}

async function buildImageIfMissing(version: string): Promise<void> {
  const tag = imageTag(version);
  if (imageExists(tag)) return;

  console.log(`Building image ${chalk.cyan(tag)} (one-time, ~30s)...`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn('docker', ['build', '-t', tag, '-'], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    child.stdin.write(dockerfileFor(version));
    child.stdin.end();
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`docker build failed (exit ${code})`))
    );
  });
}

function removeContainerIfPresent(): void {
  try {
    execFileSync('docker', ['rm', '-f', CONTAINER_NAME], { stdio: 'pipe' });
  } catch {
    /* no container, fine */
  }
}

export interface UpOptions {
  port?: string;
}

export async function up(opts: UpOptions = {}): Promise<void> {
  ensureDocker();
  const repoPath = process.cwd();
  ensureCompassDir(repoPath);

  const portRequestedExplicitly = opts.port !== undefined;
  const requestedPort = opts.port ? Number(opts.port) : DEFAULT_PORT;
  if (Number.isNaN(requestedPort) || requestedPort <= 0 || requestedPort > 65535) {
    throw new Error(`Invalid --port: ${opts.port}`);
  }

  let port = requestedPort;
  if (portRequestedExplicitly) {
    if (!(await isPortAvailable(requestedPort))) {
      throw new Error(`Port ${requestedPort} is already in use. Pick another with --port, or omit --port to auto-pick.`);
    }
  } else {
    port = await findAvailablePort(requestedPort);
    if (port !== requestedPort) {
      console.log(chalk.dim(`Port ${requestedPort} in use; using ${port} instead.`));
    }
  }

  const version = compassVersion();
  await buildImageIfMissing(version);

  removeContainerIfPresent();

  execFileSync(
    'docker',
    [
      'run',
      '-d',
      '--name', CONTAINER_NAME,
      '-p', `${port}:${INTERNAL_PORT}`,
      '-v', `${path.join(repoPath, 'compass')}:/work/compass:ro`,
      imageTag(version),
    ],
    { stdio: 'pipe' }
  );

  const url = `http://localhost:${port}`;
  console.log(`\n${chalk.bold('Compass web')} running at ${chalk.cyan(url)}`);
  console.log(chalk.dim(`Container: ${CONTAINER_NAME} (image ${imageTag(version)})`));
  console.log(chalk.dim(`Edits to compass/ are picked up on the next API request.`));
  console.log(chalk.dim(`Stop with: compass docker down`));
}

export function down(): void {
  ensureDocker();
  removeContainerIfPresent();
  console.log(`${chalk.bold('Compass web')} stopped.`);
}

export function logs(follow: boolean): void {
  ensureDocker();
  const args = ['logs'];
  if (follow) args.push('-f');
  args.push(CONTAINER_NAME);
  // Inherit stdio so logs stream directly to the user's terminal.
  const child = spawn('docker', args, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
}

export function status(): void {
  ensureDocker();
  const state = containerState();
  if (state === 'absent') {
    console.log(`${chalk.bold('Compass web')}: not running. Start with ${chalk.cyan('compass docker up')}.`);
    return;
  }
  if (state === 'stopped') {
    console.log(`${chalk.bold('Compass web')}: stopped. Start with ${chalk.cyan('compass docker up')}.`);
    return;
  }

  // Look up the published port.
  try {
    const portOut = execFileSync(
      'docker',
      ['port', CONTAINER_NAME, String(INTERNAL_PORT)],
      { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }
    ).trim();
    // Format: "0.0.0.0:5173" possibly with a trailing IPv6 line; take the first.
    const first = portOut.split('\n')[0] ?? '';
    const hostPort = first.split(':').pop() ?? String(DEFAULT_PORT);
    console.log(`${chalk.bold('Compass web')}: running at ${chalk.cyan(`http://localhost:${hostPort}`)}`);
  } catch {
    console.log(`${chalk.bold('Compass web')}: running.`);
  }
}

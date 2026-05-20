import { execFileSync } from 'child_process';
import { lstatSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chalk from 'chalk';

const require = createRequire(import.meta.url);

const PACKAGE_NAME = '@gazarr/compass';
const REGISTRY_URL = `https://registry.npmjs.org/${encodeURIComponent(PACKAGE_NAME)}/latest`;

export interface UpgradeOptions {
  check?: boolean;
}

type InstallMethod = 'link' | 'pnpm' | 'npm';

export function currentVersion(): string {
  return require('../../package.json').version as string;
}

export async function latestVersion(): Promise<string> {
  const res = await fetch(REGISTRY_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`registry.npmjs.org returned ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { version?: string };
  if (!body.version) throw new Error('npm registry response missing version field');
  return body.version;
}

/**
 * Resolve the package install root.
 * The compiled CLI lives at <root>/dist/commands/upgrade.js, so two parents up
 * from this file is the install root.
 */
export function installRoot(metaUrl: string = import.meta.url): string {
  const file = fileURLToPath(metaUrl);
  // file = <root>/dist/commands/upgrade.js -> root = <root>
  return path.resolve(path.dirname(file), '..', '..');
}

export function detectInstallMethod(rootOverride?: string): InstallMethod {
  const root = rootOverride ?? installRoot();
  // npm link sets up <node_modules>/<scope>/<pkg> as a symlink to the source.
  // The install root is that symlink target's parent in the resolution chain,
  // so lstat on the link itself tells us.
  try {
    const stat = lstatSync(root);
    if (stat.isSymbolicLink()) return 'link';
  } catch {
    /* path missing? Fall through to manager detection. */
  }

  // pnpm stores global installs under a pnpm-flavored directory.
  if (root.includes(`${path.sep}pnpm${path.sep}`)) return 'pnpm';

  return 'npm';
}

function managerCommand(method: InstallMethod, version: string): { cmd: string; args: string[] } {
  if (method === 'pnpm') {
    return { cmd: 'pnpm', args: ['add', '-g', `${PACKAGE_NAME}@${version}`] };
  }
  return { cmd: 'npm', args: ['install', '-g', `${PACKAGE_NAME}@${version}`] };
}

function runInstall(method: InstallMethod, version: string): void {
  const { cmd, args } = managerCommand(method, version);
  console.log(chalk.dim(`Running: ${cmd} ${args.join(' ')}`));
  // Use execFileSync so stdio inherits and the user sees the install progress.
  execFileSync(cmd, args, { stdio: 'inherit' });
}

export async function upgrade(opts: UpgradeOptions = {}): Promise<void> {
  const current = currentVersion();
  const latest = await latestVersion();

  if (opts.check) {
    if (current === latest) {
      console.log(`${chalk.bold('compass')} ${current} (up to date)`);
      return;
    }
    console.log(
      `${chalk.bold('compass')} ${current} → ${chalk.cyan(latest)} available. Upgrade with ${chalk.cyan(
        'compass upgrade'
      )}.`
    );
    // Non-zero so scripts can branch on a pending upgrade.
    process.exit(1);
  }

  if (current === latest) {
    console.log(`Already on the latest ${chalk.bold('compass')} (${current}).`);
    return;
  }

  const method = detectInstallMethod();

  if (method === 'link') {
    throw new Error(
      [
        'This compass install is linked to a source checkout (e.g. `npm link`).',
        `Refusing to overwrite the link with an npm download.`,
        `If you really want a published install, run \`npm unlink -g ${PACKAGE_NAME}\` first.`,
        `Otherwise, pull the latest source and rebuild instead:`,
        `  cd <compass source> && git pull && pnpm build`,
      ].join('\n')
    );
  }

  console.log(`Upgrading ${chalk.bold('compass')} ${current} → ${chalk.cyan(latest)}...`);
  runInstall(method, latest);
  console.log(`\n✓ Upgraded to ${chalk.bold(latest)}. Run ${chalk.cyan('compass --version')} to confirm.`);
}

// Exported for tests.
export const _internals = { managerCommand, runInstall };

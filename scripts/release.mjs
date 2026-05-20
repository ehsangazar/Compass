#!/usr/bin/env node
// Cut a release: bump version, update CHANGELOG, commit, tag, push.
//
//   pnpm release <patch|minor|major>
//
// The git tag push triggers .github/workflows/release.yml, which builds
// and publishes to npm.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');
const PKG_PATH = path.join(ROOT, 'package.json');

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  die('usage: pnpm release <patch|minor|major>');
}

if (run('git rev-parse --abbrev-ref HEAD') !== 'main') {
  die('release from main only');
}

if (run('git status --porcelain')) {
  die('working tree must be clean');
}

run('git fetch origin --tags');
if (run('git rev-list HEAD..origin/main --count') !== '0') {
  die('local main is behind origin; pull first');
}

const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const prevVersion = pkg.version;

const [major, minor, patch] = prevVersion.split('.').map(Number);
const nextVersion =
  bump === 'major' ? `${major + 1}.0.0`
  : bump === 'minor' ? `${major}.${minor + 1}.0`
  : `${major}.${minor}.${patch + 1}`;

const lastTag = (() => {
  try { return run('git describe --tags --abbrev=0'); }
  catch { return ''; }
})();

const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
const commits = run(`git log ${range} --pretty=format:%s`)
  .split('\n')
  .filter(line => line && !line.startsWith('chore(release):'));

if (commits.length === 0) {
  die('no commits since last release');
}

const date = new Date().toISOString().slice(0, 10);
const entry = [
  `## ${nextVersion} (${date})`,
  '',
  ...commits.map(c => `- ${c}`),
  '',
  '',
].join('\n');

const existing = existsSync(CHANGELOG_PATH)
  ? readFileSync(CHANGELOG_PATH, 'utf8')
  : '# Changelog\n\n';

const [header, ...rest] = existing.split('\n\n');
const body = rest.join('\n\n');
const newContent = `${header}\n\n${entry}${body}`.replace(/\n+$/, '\n');

writeFileSync(CHANGELOG_PATH, newContent);

pkg.version = nextVersion;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');

run('pnpm install --lockfile-only');

run('git add CHANGELOG.md package.json pnpm-lock.yaml');
run(`git commit -m "chore(release): v${nextVersion}"`);
run(`git tag -a v${nextVersion} -m "v${nextVersion}"`);

console.log(`\n✓ Tagged v${nextVersion}\n`);
console.log(`Preview commit + tag:`);
console.log(`  git show v${nextVersion}\n`);
console.log(`Push to ship:`);
console.log(`  git push origin main --follow-tags\n`);
console.log(`To abort:`);
console.log(`  git tag -d v${nextVersion}`);
console.log(`  git reset --hard HEAD~1`);

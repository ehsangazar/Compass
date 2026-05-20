#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const runTsc = (args = []) => {
  const tscPath = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tscPath, ...args], { stdio: 'inherit' });
};

const runVite = (args = []) => {
  // Vite's "exports" field blocks require.resolve('vite/bin/vite.js'), so use
  // the pnpm-linked binary directly. It's a symlink into the actual package.
  const vitePath = new URL('./node_modules/vite/bin/vite.js', import.meta.url).pathname;
  execFileSync(process.execPath, [vitePath, ...args], { stdio: 'inherit', cwd: 'web' });
};

console.log('🔨 Building Compass...\n');

// Clean dist directory
if (existsSync('dist')) {
  console.log('Cleaning dist directory...');
  rmSync('dist', { recursive: true, force: true });
}

try {
  console.log('Building web SPA (vite)...');
  runVite(['build']);

  console.log('\nCompiling TypeScript...');
  runTsc(['--version']);
  runTsc();
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'child_process';
import { lstatSync } from 'fs';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return { ...actual, lstatSync: vi.fn() };
});

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;
const mockLstatSync = lstatSync as unknown as ReturnType<typeof vi.fn>;

function setLatest(version: string): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('registry.npmjs.org')) {
        return new Response(JSON.stringify({ version }), { status: 200 });
      }
      throw new Error(`unexpected fetch ${url}`);
    })
  );
}

function notSymlink(): void {
  mockLstatSync.mockReturnValue({ isSymbolicLink: () => false } as ReturnType<typeof lstatSync>);
}

function isSymlink(): void {
  mockLstatSync.mockReturnValue({ isSymbolicLink: () => true } as ReturnType<typeof lstatSync>);
}

describe('upgrade command', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('no-ops when already on latest', async () => {
    notSymlink();
    const { currentVersion, upgrade } = await import('../../src/commands/upgrade.js');
    setLatest(currentVersion());
    await upgrade({});
    expect(mockExecFileSync).not.toHaveBeenCalled();
    const printed = consoleLogSpy.mock.calls.flat().join(' ');
    expect(printed).toMatch(/already on the latest/i);
  });

  it('refuses to upgrade a linked install', async () => {
    isSymlink();
    const { upgrade } = await import('../../src/commands/upgrade.js');
    setLatest('999.999.999');
    await expect(upgrade({})).rejects.toThrow(/linked to a source checkout/i);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('runs install with the detected manager when an upgrade is available', async () => {
    notSymlink();
    const { upgrade } = await import('../../src/commands/upgrade.js');
    setLatest('999.999.999');
    await upgrade({});
    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
    const [cmd, args, opts] = mockExecFileSync.mock.calls[0] as [string, string[], object];
    expect(['npm', 'pnpm']).toContain(cmd);
    expect(args).toContain('-g');
    expect(args).toContain('@gazarr/compass@999.999.999');
    expect(opts).toMatchObject({ stdio: 'inherit' });
  });

  it('managerCommand emits the right argv for each manager', async () => {
    const { _internals } = await import('../../src/commands/upgrade.js');
    expect(_internals.managerCommand('npm', '1.2.3')).toEqual({
      cmd: 'npm',
      args: ['install', '-g', '@gazarr/compass@1.2.3'],
    });
    expect(_internals.managerCommand('pnpm', '1.2.3')).toEqual({
      cmd: 'pnpm',
      args: ['add', '-g', '@gazarr/compass@1.2.3'],
    });
  });

  describe('--check', () => {
    it('reports up-to-date and exits 0', async () => {
      notSymlink();
      const { currentVersion, upgrade } = await import('../../src/commands/upgrade.js');
      setLatest(currentVersion());
      await upgrade({ check: true });
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.flat().join(' ')).toMatch(/up to date/i);
    });

    it('reports new version available and exits non-zero', async () => {
      notSymlink();
      const { upgrade } = await import('../../src/commands/upgrade.js');
      setLatest('999.999.999');
      await expect(upgrade({ check: true })).rejects.toThrow(/process\.exit\(1\)/);
      expect(consoleLogSpy.mock.calls.flat().join(' ')).toMatch(/available/i);
      expect(mockExecFileSync).not.toHaveBeenCalled();
    });
  });

  describe('detectInstallMethod heuristics', () => {
    it('reads path containing /pnpm/ as pnpm', async () => {
      notSymlink();
      const { detectInstallMethod } = await import('../../src/commands/upgrade.js');
      expect(detectInstallMethod('/Users/x/Library/pnpm/global/5/node_modules/@gazarr/compass')).toBe('pnpm');
    });

    it('defaults to npm for everything else', async () => {
      notSymlink();
      const { detectInstallMethod } = await import('../../src/commands/upgrade.js');
      expect(detectInstallMethod('/opt/homebrew/lib/node_modules/@gazarr/compass')).toBe('npm');
    });
  });
});

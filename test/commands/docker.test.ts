import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync, spawn } from 'child_process';
import { dockerfileFor } from '../../src/commands/docker.js';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
  spawn: vi.fn(),
}));

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;
const mockSpawn = spawn as unknown as ReturnType<typeof vi.fn>;

function configureSpawnExit(exitCode: number): { stdinWrites: string[] } {
  const stdinWrites: string[] = [];
  const stdin = {
    write: (chunk: string) => stdinWrites.push(chunk),
    end: () => {},
  };
  const handlers: Record<string, (code: number) => void> = {};
  const child = {
    stdin,
    on(event: string, cb: (code: number) => void) {
      handlers[event] = cb;
      if (event === 'exit') {
        // Fire async to mimic real spawn.
        setImmediate(() => cb(exitCode));
      }
      return child;
    },
  };
  mockSpawn.mockReturnValue(child);
  return { stdinWrites };
}

describe('dockerfileFor', () => {
  it('pins @gazarr/compass to the given version', () => {
    const dockerfile = dockerfileFor('9.9.9');
    expect(dockerfile).toContain('FROM node:20-alpine');
    expect(dockerfile).toContain('RUN npm install -g @gazarr/compass@9.9.9');
    expect(dockerfile).toContain('WORKDIR /work');
    expect(dockerfile).toContain('EXPOSE 5173');
    expect(dockerfile).toContain('CMD ["compass", "web", "--no-open", "--host", "0.0.0.0", "--port", "5173"]');
  });
});

describe('docker command', () => {
  let originalCwd: () => string;

  beforeEach(() => {
    vi.resetAllMocks();
    originalCwd = process.cwd;
    process.cwd = () => '/fake/project';
  });

  afterEach(() => {
    process.cwd = originalCwd;
    vi.resetModules();
  });

  describe('ensureDocker precheck', () => {
    it('up throws a friendly error when docker is missing', async () => {
      mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
        if (cmd === 'docker' && args[0] === '--version') {
          throw new Error('command not found');
        }
        return '';
      });
      const { up } = await import('../../src/commands/docker.js');
      await expect(up({})).rejects.toThrow(/docker is not installed/i);
    });
  });

  describe('up', () => {
    it('builds the image when missing, removes any prior container, and runs the new one', async () => {
      // Simulate fs check.
      vi.doMock('fs', async (importOriginal) => {
        const actual = await importOriginal<typeof import('fs')>();
        return { ...actual, existsSync: () => true };
      });

      mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
        if (args[0] === '--version') return Buffer.from('Docker version 99\n');
        if (args[0] === 'image' && args[1] === 'inspect') {
          throw new Error('not found'); // image missing -> trigger build
        }
        if (args[0] === 'rm' && args[1] === '-f') return Buffer.from('');
        if (args[0] === 'run') return Buffer.from('container-id\n');
        return Buffer.from('');
      });

      configureSpawnExit(0);

      const { up } = await import('../../src/commands/docker.js');
      await up({});

      // Verify docker run was called with the expected argv.
      const runCall = mockExecFileSync.mock.calls.find((c) => c[1]?.[0] === 'run');
      expect(runCall).toBeDefined();
      const runArgs = runCall![1] as string[];
      expect(runArgs).toContain('--name');
      expect(runArgs).toContain('compass-web');
      expect(runArgs).toContain('-p');
      expect(runArgs).toContain('5173:5173');
      expect(runArgs).toContain('-v');
      expect(runArgs.some((a) => a.includes('/fake/project/compass:/work/compass:ro'))).toBe(true);

      // Verify spawn was called for docker build with stdin piping.
      expect(mockSpawn).toHaveBeenCalledWith(
        'docker',
        expect.arrayContaining(['build', '-t', expect.stringContaining('compass-web:'), '-']),
        expect.objectContaining({ stdio: ['pipe', 'inherit', 'inherit'] })
      );

      // Verify rm -f was attempted before run.
      const removeCall = mockExecFileSync.mock.calls.find(
        (c) => c[1]?.[0] === 'rm' && c[1]?.[1] === '-f'
      );
      expect(removeCall).toBeDefined();
    });

    it('skips build when image already exists', async () => {
      vi.doMock('fs', async (importOriginal) => {
        const actual = await importOriginal<typeof import('fs')>();
        return { ...actual, existsSync: () => true };
      });

      mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
        if (args[0] === '--version') return Buffer.from('Docker version 99\n');
        if (args[0] === 'image' && args[1] === 'inspect') return Buffer.from(''); // exists
        if (args[0] === 'rm') return Buffer.from('');
        if (args[0] === 'run') return Buffer.from('id\n');
        return Buffer.from('');
      });

      const { up } = await import('../../src/commands/docker.js');
      await up({});

      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('respects --port option', async () => {
      vi.doMock('fs', async (importOriginal) => {
        const actual = await importOriginal<typeof import('fs')>();
        return { ...actual, existsSync: () => true };
      });

      mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
        if (args[0] === '--version') return Buffer.from('Docker 99\n');
        if (args[0] === 'image' && args[1] === 'inspect') return Buffer.from('');
        if (args[0] === 'rm') return Buffer.from('');
        if (args[0] === 'run') return Buffer.from('id\n');
        return Buffer.from('');
      });

      const { up } = await import('../../src/commands/docker.js');
      await up({ port: '8080' });
      const runCall = mockExecFileSync.mock.calls.find((c) => c[1]?.[0] === 'run');
      expect((runCall![1] as string[])).toContain('8080:5173');
    });
  });

  describe('down', () => {
    it('runs docker rm -f compass-web', async () => {
      mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
        if (args[0] === '--version') return Buffer.from('Docker 99\n');
        return Buffer.from('');
      });

      const { down } = await import('../../src/commands/docker.js');
      down();

      const removeCall = mockExecFileSync.mock.calls.find(
        (c) => c[1]?.[0] === 'rm' && c[1]?.[1] === '-f' && c[1]?.[2] === 'compass-web'
      );
      expect(removeCall).toBeDefined();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import net from 'net';
import { isPortAvailable, findAvailablePort } from '../../src/utils/port.js';

function listen(port: number): Promise<net.Server> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function pickFreePort(): Promise<number> {
  const probe = net.createServer();
  await new Promise<void>((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = probe.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  return port;
}

describe('port utility', () => {
  let busyServer: net.Server | null = null;

  afterEach(async () => {
    if (busyServer) {
      await new Promise<void>((resolve) => busyServer!.close(() => resolve()));
      busyServer = null;
    }
  });

  it('isPortAvailable returns true for a free port', async () => {
    const port = await pickFreePort();
    expect(await isPortAvailable(port)).toBe(true);
  });

  it('isPortAvailable returns false for a bound port', async () => {
    const port = await pickFreePort();
    busyServer = await listen(port);
    expect(await isPortAvailable(port)).toBe(false);
  });

  it('findAvailablePort skips a bound port and returns the next free one', async () => {
    const start = await pickFreePort();
    busyServer = await listen(start);
    const next = await findAvailablePort(start);
    expect(next).toBeGreaterThan(start);
    expect(await isPortAvailable(next)).toBe(true);
  });

  it('findAvailablePort returns the start port when it is free', async () => {
    const start = await pickFreePort();
    expect(await findAvailablePort(start)).toBe(start);
  });

  it('findAvailablePort throws when no ports are available in range', async () => {
    const start = await pickFreePort();
    busyServer = await listen(start);
    await expect(findAvailablePort(start, { attempts: 1 })).rejects.toThrow(/no available port/i);
  });
});

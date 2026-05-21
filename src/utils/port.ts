import net from 'net';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_ATTEMPTS = 100;

/**
 * Resolve true if a TCP listener can be created on the given port, false
 * otherwise. Never throws; bind errors are interpreted as "not available."
 */
export function isPortAvailable(port: number, host: string = DEFAULT_HOST): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    let settled = false;
    const settle = (ok: boolean): void => {
      if (settled) return;
      settled = true;
      server.close(() => resolve(ok));
    };
    server.once('error', () => settle(false));
    server.once('listening', () => settle(true));
    try {
      server.listen(port, host);
    } catch {
      settle(false);
    }
  });
}

export interface FindPortOptions {
  host?: string;
  attempts?: number;
}

/**
 * Scan upward from `start` and return the first port that's free.
 * Throws if no port in [start, start + attempts) is available.
 */
export async function findAvailablePort(
  start: number,
  opts: FindPortOptions = {}
): Promise<number> {
  const host = opts.host ?? DEFAULT_HOST;
  const attempts = opts.attempts ?? DEFAULT_ATTEMPTS;
  for (let i = 0; i < attempts; i++) {
    const port = start + i;
    if (port > 65535) break;
    if (await isPortAvailable(port, host)) return port;
  }
  throw new Error(`No available port found in ${start}..${start + attempts - 1} on ${host}`);
}

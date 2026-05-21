## Why

Right now `compass web` and `compass docker up` both error out if the default port (51234) is already in use. The user has to read the error, pick a new port, and pass `--port`. That's a paper cut every time and especially annoying because the docker container can outlive the user's memory of having started one.

## What Changes

- New helper `findAvailablePort(start, attempts)` in `src/utils/port.ts`. Tries to bind a TCP socket on `127.0.0.1` for each port `start, start+1, ...` and returns the first that succeeds.
- `compass web` (in `src/commands/web.ts`): when `--port` is **not** explicitly passed, scan from 51234 upward. When `--port` **is** passed, honor it exactly and fail loudly on conflict.
- `compass docker up` (in `src/commands/docker.ts`): same behavior. Same default. When auto-picking we print "port 51234 in use, using 51237 instead" so the user knows what changed.
- Explicit `--port` keeps the old failure-on-conflict semantics — explicit beats convenient.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- New file: `src/utils/port.ts` (~20 lines).
- Modified: `src/commands/web.ts`, `src/commands/docker.ts`.
- Tests: `test/utils/port.test.ts` for the scan helper (binds a server on a fixed port, asserts the scanner skips it).
- No new deps (uses Node's built-in `net`).
- Minor release (1.10.0) since this changes default behavior.

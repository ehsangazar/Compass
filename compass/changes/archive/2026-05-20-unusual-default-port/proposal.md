## Why

5173 is Vite's default dev port. Anyone using Vite on the same machine (very common for anyone doing React/Vue/Svelte work) hits a port clash the moment they run `compass docker up` or `compass web`. The user asked for a default port that "no one ever usually uses."

## What Changes

- Default port for both `compass web` and `compass docker up` becomes **51234**.
  - In the IANA dynamic / private range (49152-65535) reserved for ephemeral use.
  - Not registered to any service.
  - Easy to remember (5-1-2-3-4 ascending).
- `--port` option still works the same way; only the default changes.
- Internal container port stays 5173 (it's the server's own bind inside the container; not user-visible).
- Tests for the docker command updated to expect 51234.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- Files touched: `src/commands/web.ts`, `src/commands/docker.ts`, `src/cli/index.ts`, `test/commands/docker.test.ts`.
- Anyone scripting `compass web` with no `--port` will see the URL change; explicit `--port` flags continue to work.
- Patch release (1.8.1) since this is a default value tweak, not new behavior.

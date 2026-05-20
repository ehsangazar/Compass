## Why

Running `compass web` requires Node 20+ globally installed and the `@gazarr/compass` CLI on PATH. For someone who wants to spin up the web UI without touching their local Node setup, that's friction. Docker is the standard answer.

The user also wants edits to compass/ markdown to show up immediately in the running web UI, with start/stop being trivial.

## What Changes

### New subcommand: `compass docker`

- `compass docker up [--port 5173]` — builds a small local image (one-time) and starts a container named `compass-web` with the project's `compass/` directory bind-mounted read-only. Prints `http://localhost:<port>` when ready.
- `compass docker down` — stops and removes the `compass-web` container. Idempotent.
- `compass docker logs [-f]` — tails container logs.
- `compass docker status` — shows running/stopped + the URL.

### Image strategy

- Tag `compass-web:<version>` built locally on first `up`. Dockerfile is generated inline and piped to `docker build -t … -` (no files written to the user's repo).
- Base: `node:20-alpine`; one `RUN npm install -g @gazarr/compass@<version>` step; `CMD` runs `compass web --no-open --host 0.0.0.0`.
- Subsequent `up` reuses the cached image; only takes ~1 second to start.

### Bind mount = live data

- `-v <repo>/compass:/work/compass:ro` means any markdown edit on the host is visible inside the container immediately.
- The server already reads files on every API request, so manual browser refresh shows fresh content.

### Frontend focus refetch (bundled)

- Each route's data fetch also fires on `window.focus` and `document.visibilitychange → visible`. Removes the need to hit cmd-R after editing.
- Implemented as a small helper in `web/src/lib/useApi.ts` and applied in all five routes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- New file: `src/commands/docker.ts`.
- CLI registration: `src/cli/index.ts` gets a `docker` parent command with four subcommands.
- Frontend: small `useApi` hook in `web/src/lib/` + minor route refactors. No new deps.
- Tests: limited; the docker calls are mocked since CI doesn't run docker. The most valuable test is that the inline Dockerfile string is correct for a given version.
- Bump: minor (1.8.0).

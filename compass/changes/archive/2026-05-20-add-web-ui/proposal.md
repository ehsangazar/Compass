## Why

Compass artifacts live as nested markdown files under `compass/changes/` and `compass/specs/`. Today you can list them with `compass list`, see a terminal dashboard with `compass view`, or open the files in an editor; none of those let you browse the system the way you'd browse documentation. As compass grows past a handful of changes, navigating the raw filesystem becomes a tax, and the workflow's value (proposal → specs → design → tasks linked together) gets lost in folder noise.

A local web UI makes the structure tangible: open one URL, see active changes with progress, click into a change, jump between its proposal/design/specs/tasks tabs, follow links to the specs they touch. This is the same data `compass view` already loads, just rendered in a browser instead of ANSI codes.

## What Changes

- **New command** `compass web [--port 5173] [--host 127.0.0.1] [--no-open]` that:
  - Spins up an embedded HTTP server using Node's built-in `http` module (no runtime web framework dep).
  - Serves a built React SPA from `dist/web/` at `/`.
  - Serves a JSON API at `/api/*` backed by the existing `compass/` data loaders.
  - Opens the default browser unless `--no-open`.
- **New `web/` directory** in the repo with a Vite + React + TypeScript app:
  - Two views for v0: overview/list (changes and specs) and detail (single change or spec with rendered markdown).
  - `react-markdown` + `remark-gfm` for markdown; no CSS framework, hand-rolled minimal styling.
  - Built into `dist/web/` and included in the npm tarball.
- **Build pipeline**: `build.js` runs `vite build` before `tsc`, producing `dist/web/index.html` and bundled assets.
- **Dev workflow**: `pnpm web:dev` runs Vite with HMR pointing at a running `compass web --no-open --port 4000` for the API.
- **package.json `files`** array extended to include `dist/web/`.

Not in v0 (explicit non-goals):

- Live reload of compass changes (browser refresh required after editing a markdown file).
- Search or filter UI.
- Editing artifacts from the browser (read-only).
- Static export for GitHub Pages (future change).

## Capabilities

### New Capabilities

None at the spec level. The capability "browse compass artifacts" already exists via `compass view`; this is a second presentation of the same model. Spec-driven schema doesn't model presentation layers as separate capabilities.

### Modified Capabilities

None.

> Same caveat as `[[fix-repo-slug]]`: the spec-driven schema doesn't have a clean home for tooling features. Tracking as a recurring pattern.

## Impact

- New runtime command, no breaking changes.
- npm tarball size: adds ~200-400KB for the bundled React SPA (single chunk, minified). Acceptable for a dev tool.
- Adds devDependencies: `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `react-router-dom`, `react-markdown`, `remark-gfm`, `@types/react`, `@types/react-dom`. No new runtime deps.
- New top-level directory: `web/`.
- Tests: new vitest suite for the API handlers (server-side), no UI tests in v0.
- Version bump: minor (1.5.0).

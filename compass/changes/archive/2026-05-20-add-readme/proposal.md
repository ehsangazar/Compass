## Why

Compass shipped to npm as `@gazarr/compass@1.4.0` with no `README.md` at the repo root. The npm package page and the GitHub repo landing tab both render blank, despite a 19-command CLI surface. This blocks discovery, self-onboarding, and any meaningful adoption beyond the author. The repo also just rebranded from OpenSpec and renamed (capital `Compass` to lowercase `compass`), so this is the right moment to set the public-facing story before anyone external lands on it.

## What Changes

- Add `README.md` at the repo root containing: one-line tagline, install command, 30-second quickstart, command-surface map, links to `PUBLISHING.md` and source.
- `README.md` becomes the auto-rendered content on both the npm package page and the GitHub repo landing tab; no extra publish wiring needed (npm already includes top-level `README.md` by default).
- No code changes, no API surface change, no version bump required by itself. The next `pnpm release patch` ships it.

## Capabilities

### New Capabilities

None. This is a documentation-only change; no new compass spec/capability is introduced.

### Modified Capabilities

None. No existing requirement changes.

> Note: this change does not fit the `spec-driven` schema cleanly. A future `docs` schema (proposal → tasks, no specs/design) would be a better tool. Captured as a dogfooding observation.

## Impact

- New file: `/Users/gaz/Projects/merge/compass/README.md`.
- Auto-rendered surfaces: npm `@gazarr/compass` page; GitHub `ehsangazar/compass` landing tab.
- No code, tests, build, or CI changes.
- No dependencies added.

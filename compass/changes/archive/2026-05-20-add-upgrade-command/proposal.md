## Why

Every time we ship a release the user has to remember `npm i -g @gazarr/compass@latest`. That's an awkward off-tool incantation for something the tool itself knows how to do. A first-class `compass upgrade` removes the friction.

## What Changes

New command `compass upgrade [--check]`:

- Resolves the currently running install root from `import.meta.url` (the compiled CLI sits inside the package directory).
- Hits `https://registry.npmjs.org/@gazarr/compass/latest` to read the published latest version. No npm CLI dependency for the version check.
- If `--check`: prints current and latest and exits non-zero if there's a newer one.
- If current equals latest: prints "already up to date" and exits 0.
- Otherwise:
  - Detects install method:
    - **link / dev**: the package dir is a symlink, e.g. when `npm link` was used. We refuse with a clear message and tell them to `git pull` instead.
    - **pnpm**: install root contains `/pnpm/` (covers most pnpm global layouts).
    - **npm** (default): everything else.
  - Runs the corresponding `<pm> install -g @gazarr/compass@<latest>` with stdio inherited so the user sees progress.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- New file: `src/commands/upgrade.ts`.
- CLI registration: `src/cli/index.ts` gains a `upgrade` command.
- Tests: `test/commands/upgrade.test.ts` mocks fetch + child_process. Cover: same-version no-op, refusal of linked installs, npm path, pnpm path, `--check` behavior.
- No new deps. Uses Node's built-in `fetch` (available in Node 20+, matches `engines.node`).
- Minor release (1.9.0).

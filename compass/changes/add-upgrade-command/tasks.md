## 1. Implementation

- [x] 1.1 `src/commands/upgrade.ts` with `upgrade({ check })` + helpers `currentVersion`, `latestVersion`, `installRoot`, `detectInstallMethod`, `runInstall`
- [x] 1.2 Register `compass upgrade --check` in `src/cli/index.ts`

## 2. Tests

- [x] 2.1 `test/commands/upgrade.test.ts`: stub global fetch + child_process
  - same version (no-op)
  - --check with newer version
  - refusal when package dir is a symlink
  - pnpm path detection
  - npm path detection (default)

## 3. Ship

- [x] 3.1 Build + run new tests + smoke `compass upgrade --check` locally
- [x] 3.2 `pnpm release minor` → 1.9.0, push --follow-tags
- [x] 3.3 Archive change

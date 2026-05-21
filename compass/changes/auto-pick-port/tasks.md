## 1. Implementation

- [x] 1.1 `src/utils/port.ts` exports `isPortAvailable(port, host)` and `findAvailablePort(start, opts)`
- [x] 1.2 `compass web`: distinguish "user passed --port" vs default; auto-scan only on default
- [x] 1.3 `compass docker up`: same logic; print "<default> in use, using <new>" message when auto-shifting

## 2. Tests

- [x] 2.1 `test/utils/port.test.ts`: bind a server on port X, assert findAvailablePort(X) returns X+1
- [x] 2.2 Update `test/commands/docker.test.ts` to expect a free port in the `-p` arg

## 3. Ship

- [x] 3.1 Build + test
- [x] 3.2 Commit, `pnpm release minor` (1.10.0), push --follow-tags, workflow green
- [x] 3.3 `compass archive auto-pick-port --skip-specs --yes` + push rename

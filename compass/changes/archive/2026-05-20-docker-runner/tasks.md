## 1. Docker subcommand

- [x] 1.1 `src/commands/docker.ts` with `up`, `down`, `logs`, `status` handlers
- [x] 1.2 `ensureDocker()` precheck (clear error if docker is missing)
- [x] 1.3 `buildImage(version)` writes Dockerfile to stdin of `docker build -t compass-web:<version> -`
- [x] 1.4 `up`: idempotent `docker rm -f compass-web` before `docker run -d`
- [x] 1.5 `down`: `docker rm -f compass-web` (idempotent)
- [x] 1.6 `logs -f` option (follow), `status` prints state + URL

## 2. CLI wiring

- [x] 2.1 Register `compass docker` parent + 4 subcommands in `src/cli/index.ts`
- [x] 2.2 `--port` option on `up` for when 5173 is taken

## 3. Frontend focus-refetch

- [x] 3.1 `web/src/lib/useApi.ts` exports `useFocusRefetch(callback)` hook
- [x] 3.2 Apply in `Overview.tsx`, `ChangesList.tsx`, `ChangeDetail.tsx`, `SpecsList.tsx`, `SpecDetail.tsx`
- [x] 3.3 Cleanup on unmount

## 4. Tests

- [x] 4.1 `test/commands/docker.test.ts`: mock child_process, assert correct argv for up/down/logs/status, assert Dockerfile contents include the right version pin

## 5. Verify

- [x] 5.1 `pnpm build` clean
- [x] 5.2 `compass docker up --port 5191` against this repo, curl `/api/overview`, edit a markdown file, curl again, confirm new content
- [x] 5.3 `compass docker down` cleans up

## 6. Ship

- [x] 6.1 Commit + `pnpm release minor` (1.8.0) + push --follow-tags + workflow green
- [x] 6.2 `compass archive docker-runner --skip-specs --yes` + push rename

## 1. Code

- [x] 1.1 `src/commands/docker.ts`: `DEFAULT_PORT = 51234` (host side); `INTERNAL_PORT` stays 5173
- [x] 1.2 `src/commands/web.ts`: default port 51234 when `--port` is omitted
- [x] 1.3 `src/cli/index.ts`: update commander option defaults to "51234"

## 2. Tests

- [x] 2.1 `test/commands/docker.test.ts`: expect `51234:5173` in argv

## 3. Ship

- [x] 3.1 `pnpm build` clean, `pnpm test` for docker tests
- [x] 3.2 Commit, `pnpm release patch` → 1.8.1, push --follow-tags, workflow green
- [x] 3.3 `compass archive unusual-default-port --skip-specs --yes` + push rename

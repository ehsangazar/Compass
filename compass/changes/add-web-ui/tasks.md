## 1. Dependencies

- [x] 1.1 Add devDeps: `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `react-router-dom`, `react-markdown`, `remark-gfm`, `@types/react`, `@types/react-dom`
- [x] 1.2 Run `pnpm install`, confirm lockfile updates cleanly

## 2. SPA scaffold (`web/`)

- [x] 2.1 `web/index.html`, `web/vite.config.ts` (root=web, outDir=../dist/web, base=/)
- [x] 2.2 `web/src/main.tsx`, `web/src/App.tsx` with React Router v6
- [x] 2.3 `web/src/api.ts` with typed fetch wrappers
- [x] 2.4 Overview route: counts + active/archived changes list + specs list
- [x] 2.5 Change detail route with tabs (proposal/design/specs/tasks) using react-markdown
- [x] 2.6 Spec detail route with same markdown renderer
- [x] 2.7 `web/src/styles.css`: minimal CSS, system font, two-column layout

## 3. Embedded server (`src/core/web/`)

- [x] 3.1 `data.ts`: extract change/spec loaders reused from `core/view.ts` + `core/list.ts` (don't duplicate; refactor common helpers into shared module if needed)
- [x] 3.2 `server.ts`: Node `http` server with route table for `/api/overview`, `/api/changes`, `/api/changes/:name`, `/api/specs`, `/api/specs/:name`, and static fallback to `dist/web/`
- [x] 3.3 Proper Content-Type, 404 JSON for missing artifacts, no shell-injection surface

## 4. CLI wiring

- [x] 4.1 Register `compass web [--port 5173] [--host 127.0.0.1] [--no-open]` in `src/cli/index.ts`
- [x] 4.2 Default behavior: opens browser via the platform's `open` (macOS), `xdg-open` (Linux), `start` (Windows)
- [x] 4.3 Graceful shutdown on SIGINT

## 5. Build + package

- [x] 5.1 `build.js` runs `vite build` (cwd=web) before `tsc`
- [x] 5.2 `package.json` scripts: `web:dev` (vite), `web:build` (vite build)
- [x] 5.3 `package.json` files array includes `dist/web/`

## 6. Verify

- [x] 6.1 `pnpm build` clean
- [x] 6.2 `compass web --no-open` starts; `curl http://127.0.0.1:5173/api/overview` returns JSON
- [x] 6.3 `compass web` opens the browser, renders the compass repo's own changes (dogfood)
- [x] 6.4 `npm pack --dry-run` lists `dist/web/index.html` and at least one asset

## 7. Tests

- [x] 7.1 `test/core/web/server.test.ts` covers all 5 API endpoints against a fixture `compass/` directory

## 8. Ship

- [x] 8.1 Commit src + web + tests + compass artifacts
- [x] 8.2 `pnpm release minor` → 1.5.0
- [x] 8.3 Push with `--follow-tags`; verify workflow green and `npm view @gazarr/compass version` = 1.5.0
- [x] 8.4 `compass archive add-web-ui --skip-specs --yes` + commit rename

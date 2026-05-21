## 1. Implement

- [x] 1.1 Create `web/public/favicon.svg` (navy square + white Compass + red needle)
- [x] 1.2 Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` to `web/index.html`

## 2. Verify

- [x] 2.1 `pnpm build` clean; confirm `dist/web/favicon.svg` exists
- [x] 2.2 `compass web --no-open` + curl `/favicon.svg` returns 200 with image/svg+xml

## 3. Ship

- [x] 3.1 Commit, `pnpm release patch` (1.9.1), push --follow-tags, workflow green
- [x] 3.2 `compass archive add-favicon --skip-specs --yes` + push rename

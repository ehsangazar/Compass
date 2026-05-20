## 1. Theme provider + toggle

- [x] 1.1 Narrow `Theme` type to `'light' | 'dark'` in `web/src/components/theme-provider.tsx`
- [x] 1.2 Coerce legacy `'system'` localStorage values on read
- [x] 1.3 Drop the `matchMedia` change listener (no auto-follow after first paint)
- [x] 1.4 Sidebar ThemeToggle becomes a binary Sun ↔ Moon button

## 2. Tommy Hilfiger palette

- [x] 2.1 Rewrite `:root` (light) HSL vars in `web/src/globals.css` around TH navy + white
- [x] 2.2 Rewrite `.dark` HSL vars around deep navy + white + TH red
- [x] 2.3 Verify sidebar contrast in both themes (foreground on sidebar bg)

## 3. Ship

- [x] 3.1 `pnpm build` clean
- [x] 3.2 `compass web --no-open` smoke; eyeball overview + change detail + tabs
- [x] 3.3 Commit, `pnpm release minor` → 1.7.0, push with `--follow-tags`
- [x] 3.4 `compass archive simplify-theme-toggle --skip-specs --yes` + commit rename

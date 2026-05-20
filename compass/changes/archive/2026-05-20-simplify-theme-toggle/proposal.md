## Why

Two theme adjustments stacked from user feedback after 1.6.0 shipped:

1. The three-state toggle (System / Light / Dark) is more surface than a CLI dev tool needs. A binary light/dark switch is plenty; first visit follows the OS, after that the user's choice sticks.
2. The default shadcn palette (cool gray with blue accents) doesn't feel branded. Switch the design tokens to a Tommy Hilfiger-inspired palette: classic navy, signature red, white.

Both touch the same files (theme tokens + theme provider + theme toggle), so they ship together rather than in two patches.

## What Changes

### Theme toggle

- `Theme` type becomes `'light' | 'dark'`.
- `ThemeProvider` initial state: read `localStorage`; if absent, use `prefers-color-scheme` once as the starting value (no listener after that, no auto-follow).
- Old `'system'` entries in `localStorage` coerce to `'light' | 'dark'` on first read.
- `ThemeToggle` becomes a single-tap button (Sun ↔ Moon).

### Tommy Hilfiger palette

- Light theme:
  - background: white
  - foreground: TH navy
  - primary: TH navy
  - destructive / accent stripe: TH red
  - sidebar: pale tinted-navy panel, navy text, red active highlights
  - borders: light gray
- Dark theme:
  - background: deep TH navy
  - foreground: white
  - primary: white (inverted for contrast on navy)
  - accent stripe / destructive: TH red
  - sidebar: deeper navy
  - borders: navy-tinted gray
- Tokens defined as HSL CSS vars in `globals.css`; no component code changes (components consume `bg-primary`, `text-foreground`, etc.).
- Brand colors: TH Navy `#001f5f` → `hsl(220, 100%, 19%)`. TH Red `#c8102e` → `hsl(351, 86%, 42%)`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- Files touched: `web/src/globals.css`, `web/src/components/theme-provider.tsx`, `web/src/components/layout/Sidebar.tsx`.
- No new deps. No API changes. No test changes.
- Visual shift is significant enough that I'll bump 1.7.0 (minor) instead of patch, so anyone hitting npm with a screenshot can tell the version apart.

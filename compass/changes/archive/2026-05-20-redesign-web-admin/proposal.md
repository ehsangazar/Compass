## Why

v0 of `compass web` shipped a hand-rolled CSS UI that works but feels handmade. The header is a thin top bar, content sits in a single column, no real visual hierarchy, and there's no theme switcher (only `prefers-color-scheme`). For a tool meant to make compass artifacts feel like a first-class system of record, the UI needs to look like a real admin tool, not a static doc dump.

This change rebuilds the web UI on Tailwind v4 with shadcn-style components, an explicit admin-panel layout (persistent left sidebar + main content area), and a proper theme system (light + dark, system default, manual toggle). It also replaces ad-hoc styles with a coherent token-based design system.

## What Changes

- **Layout**: replace top-nav-only shell with `AppShell` (left sidebar 240-260px, main content area). Sidebar holds brand, primary nav (Overview / Changes / Specs), quick-jump lists for changes and specs, and a theme toggle.
- **Design system**: Tailwind v4 (CSS-first config via `@theme` + `@tailwindcss/vite`). shadcn-style HSL CSS variables for `:root` and `.dark`. Hand-built primitives in `web/src/components/ui/`: `Button`, `Card`, `Badge`, `Tabs` (Radix-backed), `Separator`, `Skeleton`, `ScrollArea`-lite.
- **Theme**: `ThemeProvider` reads `prefers-color-scheme`, allows `light | dark | system` override stored in `localStorage`, toggles `.dark` on `<html>`. Icon-button toggle in the sidebar footer.
- **Icons**: `lucide-react`. Consistent small icons across nav, badges, empty states.
- **Markdown**: react-markdown wrapper styled with hand-tuned Tailwind classes so headings/lists/code/blockquote read the same in both themes.
- **Removed**: existing `web/src/styles.css` in favor of `globals.css` with `@import "tailwindcss"` plus token block.

## Capabilities

### New Capabilities

None at the spec level.

### Modified Capabilities

None.

## Impact

- New devDependencies: `tailwindcss`, `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`. No new runtime deps.
- All existing routes rewritten; same React Router routes, same `/api/*` endpoints.
- Bundle size: Tailwind v4 + lucide tree-shake aggressively; expect 1.6.0 JS bundle to land within 15-20% of 1.5.0's 394 KB despite many more components.
- No breaking changes for end users; `compass web` still launches the same way.
- Version bump: minor (1.6.0).

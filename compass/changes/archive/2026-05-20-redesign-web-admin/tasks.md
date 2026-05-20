## 1. Dependencies + tooling

- [x] 1.1 `pnpm add -D tailwindcss @tailwindcss/vite clsx tailwind-merge class-variance-authority lucide-react @radix-ui/react-tabs @radix-ui/react-slot`
- [x] 1.2 Wire `@tailwindcss/vite` plugin in `web/vite.config.ts`
- [x] 1.3 Replace `web/src/styles.css` with `web/src/globals.css` (`@import "tailwindcss"` + token block)

## 2. Theme system

- [x] 2.1 Define shadcn-style HSL CSS variables for `:root` and `.dark`
- [x] 2.2 `web/src/components/theme-provider.tsx` with system detection + localStorage
- [x] 2.3 `ThemeToggle` button (sun/moon icons) for the sidebar footer

## 3. UI primitives

- [x] 3.1 `web/src/lib/utils.ts` with `cn()` (clsx + tailwind-merge)
- [x] 3.2 `ui/button.tsx` (cva variants: default, ghost, outline, sizes)
- [x] 3.3 `ui/card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent)
- [x] 3.4 `ui/badge.tsx` (variants: default, secondary, success, warning, muted)
- [x] 3.5 `ui/tabs.tsx` (Radix Tabs)
- [x] 3.6 `ui/separator.tsx`
- [x] 3.7 `ui/skeleton.tsx`

## 4. Layout

- [x] 4.1 `components/layout/Sidebar.tsx`: brand, primary nav, change quick-jump, spec quick-jump, footer with theme toggle
- [x] 4.2 `components/layout/AppShell.tsx`: grid layout (sidebar + main), responsive collapse on small screens
- [x] 4.3 `components/layout/PageHeader.tsx`: page title + optional subtitle/breadcrumb

## 5. Routes

- [x] 5.1 Overview: stat cards (active, archived, draft, specs), active changes card, recent activity card
- [x] 5.2 ChangesList: filter tabs (All/Active/Draft/Archived), table with progress bars and badges
- [x] 5.3 ChangeDetail: title + status badges + description, Radix Tabs for artifacts, Card around content
- [x] 5.4 SpecsList: card grid
- [x] 5.5 SpecDetail: page header + Card with rendered markdown

## 6. Markdown styling

- [x] 6.1 `components/Markdown.tsx` rewritten with Tailwind classes for headings, lists, code, blockquote, tables
- [x] 6.2 Inline code uses muted background; code blocks use a slightly-darker panel; both read fine in light + dark

## 7. Build + ship

- [x] 7.1 `pnpm build` clean (vite build first, then tsc)
- [x] 7.2 `compass web --no-open` smoke test + curl checks
- [x] 7.3 Bundle size check: report new gzipped JS/CSS sizes
- [x] 7.4 Commit, `pnpm release minor` → 1.6.0
- [x] 7.5 Push with `--follow-tags`, verify workflow green, `npm view @gazarr/compass version` = 1.6.0
- [x] 7.6 `compass archive redesign-web-admin --skip-specs --yes` + commit rename

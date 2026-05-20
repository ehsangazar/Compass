## 1. Draft README content

- [x] 1.1 Write one-line tagline + 2-3 sentence "what Compass is" paragraph
- [x] 1.2 Add Install section (`npm i -g @gazarr/compass`) and minimum Node version
- [x] 1.3 Add 30-second Quickstart: `compass init`, `compass new change <name>`, drive via `/compass:*` skills
- [x] 1.4 Add Command Map: short descriptions for each top-level command grouped by purpose
- [x] 1.5 Add "AI tools supported" section (claude, cursor, codex, etc.) sourced from `compass init --help`
- [x] 1.6 Add links: PUBLISHING.md, license, issues
- [x] 1.7 Add minimal "Project status" line (1.x, public, MIT)

## 2. Verify

- [x] 2.1 Render-check locally (open in editor with markdown preview, no broken anchors)
- [x] 2.2 Confirm every command listed in README still exists in `compass --help`
- [x] 2.3 Run `compass validate add-readme` and note remaining schema issues (expected: specs/design missing for doc-only change)

## 3. Ship

- [x] 3.1 Commit `README.md` plus the `compass/changes/add-readme/` artifacts
- [x] 3.2 Cut release via `pnpm release patch`; tag push triggers npm publish; README appears on npm page
- [x] 3.3 `compass archive add-readme`

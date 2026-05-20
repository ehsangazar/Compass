## 1. Source fixes

- [x] 1.1 Replace `gaz/Compass` → `ehsangazar/compass` in `src/core/init.ts` (2 occurrences, lines 647-648)
- [x] 1.2 Replace `gaz/Compass` → `ehsangazar/compass` in `src/commands/feedback.ts` (2 occurrences, lines 101, 133)
- [x] 1.3 Update `eslint.config.js` issue link comment

## 2. Test fixes

- [x] 2.1 Update all `gaz/Compass` references in `test/commands/feedback.test.ts` (12 occurrences)
- [x] 2.2 Run `pnpm test` and confirm green

## 3. Verify

- [x] 3.1 `grep -rn 'gaz/Compass' --include='*.ts' --include='*.js' --include='*.md' .` returns no matches outside `compass/changes/archive/`
- [x] 3.2 Run `compass init` in a temp dir and confirm correct URL is printed
- [x] 3.3 Run `pnpm build` to confirm the linked `compass` binary picks up the fix

## 4. Ship

- [x] 4.1 Commit src + tests + change artifacts
- [x] 4.2 `pnpm release patch` to cut 1.4.1; push with `--follow-tags`
- [x] 4.3 `compass archive fix-repo-slug --skip-specs --yes`

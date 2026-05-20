## Why

The string `gaz/Compass` is hardcoded in 16 places across the codebase as the GitHub repo target. That repo does not exist; the real repo is `ehsangazar/compass`. Two consequences:

1. `compass init` prints `Learn more: https://github.com/gaz/Compass` and `Feedback: https://github.com/gaz/Compass/issues` to every user after setup. Both are dead links.
2. `compass feedback "..."` calls `gh` against the `gaz/Compass` repo, so the entire feedback command is broken end to end.

Discovered during README dogfood task on 2026-05-20.

## What Changes

- `src/core/init.ts`: replace 2 printed URLs with `https://github.com/ehsangazar/compass`.
- `src/commands/feedback.ts`: replace 2 `gaz/Compass` repo targets with `ehsangazar/compass`.
- `eslint.config.js`: update issue link in a code comment.
- `test/commands/feedback.test.ts`: update 12 mock URLs and one repo string so tests reflect the real repo.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None at the spec level. This is a bug fix in existing behavior (init output and feedback command). No requirement is changing; the requirements are unchanged but the implementation was wrong.

## Impact

- User-visible: `compass init` now prints real working URLs; `compass feedback` actually opens issues on the real repo.
- Test suite: feedback tests updated to assert against the real repo string.
- No API changes, no migration, no version bump implication beyond a patch.

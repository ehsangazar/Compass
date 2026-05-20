# @gazarr/compass

## 1.9.0 (2026-05-20)

- Add compass upgrade command
- Archive unusual-default-port change

## 1.8.1 (2026-05-20)

- Move default port from 5173 to 51234
- Archive docker-runner change

## 1.8.0 (2026-05-20)

- Add compass docker subcommand + frontend focus refetch
- Archive simplify-theme-toggle change

## 1.7.0 (2026-05-20)

- Simplify theme toggle to light/dark + adopt Tommy Hilfiger palette
- Archive redesign-web-admin change

## 1.6.0 (2026-05-20)

- Rebuild compass web as an admin panel (Tailwind v4 + shadcn-style)
- Archive add-web-ui change

## 1.5.0 (2026-05-20)

- Add compass web: browser UI for changes and specs
- Archive fix-repo-slug change

## 1.4.1 (2026-05-20)

- Fix hardcoded gaz/Compass references to ehsangazar/compass
- Add project README and archive the doc change

## 1.4.0

### Minor Changes

- [`8b7ed18`](https://github.com/ehsangazar/Compass/commit/8b7ed1866bc8ef5a3640d53d7a052af6e79eb9fe) Thanks [@ehsangazar](https://github.com/ehsangazar)! - ### New Features

  - **Kimi CLI support** — Compass can now initialize Kimi CLI as a supported skills-only tool using `.kimi/skills/`

  ### Other

  - Added Kimi-specific docs and init coverage aligned with skill-based `/skill:compass-*` usage

- [`8b7ed18`](https://github.com/ehsangazar/Compass/commit/8b7ed1866bc8ef5a3640d53d7a052af6e79eb9fe) Thanks [@ehsangazar](https://github.com/ehsangazar)! - ### New Features

  - Include the sync workflow in the default core profile so new installs generate `/compass:sync` skills and commands by default.

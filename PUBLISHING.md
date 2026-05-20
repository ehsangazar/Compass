# Publishing @gazarr/compass

## TL;DR

```bash
pnpm build
npm publish --access public --userconfig /tmp/compass-npmrc
```

…where `/tmp/compass-npmrc` contains:

```
//registry.npmjs.org/:_authToken=<npm_automation_token>
```

The token is stored at `vps/npm-token.txt` (outside this repo).

## Account

- npm username: `gazarr`
- Scope: `@gazarr`
- Package: `@gazarr/compass`
- GitHub repo: https://github.com/ehsangazar/Compass

The npm username (`gazarr`) and the GitHub username (`ehsangazar`) are intentionally different. The npm scope must match the npm account, so the package name is `@gazarr/compass` even though the source lives under `ehsangazar` on GitHub.

## First-time setup

If publishing from a fresh machine:

1. Get the npm Automation token from `vps/npm-token.txt`.
2. Save it to an isolated npmrc (so it isn't written to your global `~/.npmrc`):
   ```bash
   echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /tmp/compass-npmrc
   chmod 600 /tmp/compass-npmrc
   ```
3. Verify auth:
   ```bash
   npm --userconfig /tmp/compass-npmrc whoami    # → gazarr
   ```

The Automation token bypasses 2FA, so no OTP is needed.

## Releasing a new version

This repo uses [Changesets](https://github.com/changesets/changesets) for version management.

1. Make code changes.
2. Add a changeset describing the change and its bump type:
   ```bash
   pnpm changeset
   ```
   Pick `patch` / `minor` / `major`, write a one-line summary. This creates a markdown file in `.changeset/`.
3. Commit and push to `main`.
4. The `release-prepare.yml` GitHub Action opens (or updates) a "Version Packages" PR that bumps `package.json` and updates `CHANGELOG.md`.
5. Merge that PR. The workflow runs `pnpm run release:ci`, which publishes to npm via `changeset publish`.

## Manual publish (bypass the workflow)

If you need to publish from your laptop without going through CI:

```bash
# bump version + changelog locally
pnpm exec changeset version

# build, publish, push tag
pnpm build
npm publish --access public --userconfig /tmp/compass-npmrc
git add -A && git commit -m "chore(release): version packages"
git tag "v$(node -p "require('./package.json').version")"
git push --follow-tags
```

## Token rotation

1. Generate a new Automation token at https://www.npmjs.com/settings/gazarr/tokens.
2. Update `vps/npm-token.txt`.
3. Update the `NPM_TOKEN` secret on the GitHub repo if it's set there.
4. Revoke the old token.

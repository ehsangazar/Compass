# Publishing

## TL;DR

```bash
pnpm release patch     # or minor / major
git push origin main --follow-tags
```

That's it. The `v*` tag push triggers `.github/workflows/release.yml`, which publishes to npm and creates a GitHub Release.

## What the release script does

`scripts/release.mjs`:

1. Verifies you're on `main` with a clean tree, up to date with origin.
2. Bumps `package.json` to the next version (computed from `patch|minor|major`).
3. Collects commits since the last `v*` tag and prepends a new section to `CHANGELOG.md`.
4. Updates `pnpm-lock.yaml`.
5. Creates a `chore(release): vX.Y.Z` commit and an annotated `vX.Y.Z` tag.
6. Prints the push command. **Nothing is pushed automatically.**

If you want to back out before pushing:

```bash
git tag -d vX.Y.Z
git reset --hard HEAD~1
```

## What the workflow does

`.github/workflows/release.yml` triggers on any `v*` tag push:

1. Checks out the tagged commit.
2. Installs deps, runs `pnpm build`.
3. Verifies the tag name matches `package.json` version (catches accidental hand-tagging).
4. `npm publish --access public` using the `NPM_TOKEN` repo secret.
5. Extracts the matching section from `CHANGELOG.md` and creates a GitHub Release.

## Account / package facts

- npm username: `gazarr`
- Scope / package: `@gazarr/compass`
- GitHub repo: https://github.com/ehsangazar/compass

The npm scope (`gazarr`) intentionally differs from the GitHub username (`ehsangazar`) — npm scopes must match the publishing account.

## Manual publish (bypass the workflow)

If CI is broken or you need to ship from your laptop:

```bash
# Token at vps/npm-token.txt (extract the Token: line)
echo "//registry.npmjs.org/:_authToken=<token>" > /tmp/compass-npmrc
chmod 600 /tmp/compass-npmrc

pnpm build
npm publish --access public --userconfig /tmp/compass-npmrc

rm /tmp/compass-npmrc
```

The local flow has no CI-specific paths, so it's identical to what the workflow does.

## Rotating the npm token

1. Generate a new Automation token at https://www.npmjs.com/settings/gazarr/tokens.
2. Update `vps/npm-token.txt`.
3. `gh secret set NPM_TOKEN --repo ehsangazar/compass` (paste new value when prompted).
4. Revoke the old token.

## Required GitHub setup (one-time, already done)

- Repo secret `NPM_TOKEN` set to an npm Automation token.
- `Settings → Actions → General → Workflow permissions`: "Read and write" + "Allow GitHub Actions to create and approve pull requests".
- npm account 2FA mode set to "Authorization only" (not "Auth and writes"), so Automation tokens can publish without OTP.

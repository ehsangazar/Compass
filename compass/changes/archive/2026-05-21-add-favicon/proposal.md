## Why

The web UI has no favicon. Browser tabs show a generic globe icon; the browser hits `/favicon.ico` and gets a 404 on every page load. Tiny papercut, but it cheapens the polish we just put into the admin panel + TH palette.

## What Changes

- New file: `web/public/favicon.svg` — an inline SVG built from the lucide Compass icon (the same one used in the sidebar brand bubble). Composition uses all three TH triad colors:
  - Rounded square background: TH navy `#001f5f`
  - Compass body strokes: white
  - Needle polygon fill: TH red `#c8102e`
- `web/index.html` gains a `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
- Vite copies `public/` to `dist/web/` at build time automatically, so the favicon ships in the npm tarball and the docker image picks it up on next `compass docker up`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- Adds ~600 bytes to the bundle.
- No new deps, no API changes.
- Patch release (1.9.1) since this is pure polish.

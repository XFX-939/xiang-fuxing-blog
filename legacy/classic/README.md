# Classic UI source archive

This folder preserves the classic blog UI that previously owned the public routes.
It is intentionally excluded from the active Next.js, TypeScript, ESLint, and
Tailwind build paths. Shared data and behavior modules remain in the main source
tree, so restoring this edition should be done from Git history rather than by
serving this folder directly.

Recovery points:

- `b6a8d1f`: last single-version classic site before UI switching
- `32a8c4f`: classic + Signal dual-version site with the mobile fixes

The active public site now uses the Signal UI only.

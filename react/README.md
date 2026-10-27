# PMS React pages (shadcn/ui)

Incremental migration of the PMS front end (see the plan in the project notes). The legacy pages in `../pms/app/views/` keep working;
a page is switched to React one at a time.

- `npm run verify` — type-check, unit tests, build (output: `../pms/react/`, not committed).
- Pages live in `src/pages/<id>/`; register them in `src/bridge.tsx` (`PAGES`). Business logic stays in `../pms/app/core/*` and is handed to
  pages as `ctx.core` by the legacy shell (`../pms/app/react-bridge.js`) — never bundled, so session/mirror/sync state is shared.
- Switching a page on: `REACT_PAGES` in `pms/app/config.js` (everybody), `prefs.reactPages` (one login), `localStorage.pms_react_pages` (one browser);
  `?legacy=1` forces the legacy page.
- Theme: PMS palette mapped to shadcn variables in `src/globals.css` (scoped to `.pms-react`; the gold page background stays with the legacy shell).
- Staging: `sh ../web/deploy.sh staging` → https://pms-web-staging.tkamlapur.workers.dev (API: pms-api-staging, DB pms-staging seeded from a production export).

# Hotfix: Catalog camera, category navigation, DrillTruck notices and economy

**Date:** 2026-11-06
**Agent:** ChatGPT
**Branch:** `chatgpt/catalog-camera-and-category-scroll-fix`
**User approval:** Fix the four observed bugs and integrate into the existing production `main`, keeping the current browser save.

## User reports and root causes

1. Collapsing Catalog changed the camera: `game.mjs` selected the builder camera whenever `builderOpen` was true, even without construction in progress. The correct browsing behavior is the current player perspective; special overhead mode remains only for HSEC in-world drawing and office management.
2. Selecting a distant category such as Seguridad caused the category bar to scroll to the beginning: `CatalogView.render` rebuilds `innerHTML` on each category selection, losing `scrollLeft`. We preserve the scroll offset and ensure the active tab is visible.
3. Repetitive "DrillTruck en ronda de mantenimiento" notices came directly from `autoDispatchTruck` on every automated round. Removed that toast only; truck behavior and phone status remain.
4. Economy imbalance: M4 generated up to 2,500 per zone each 15 minutes and `calculateOfflineProduction` accumulated unlimited cycles after long absences. In addition, the M4 completion overlay displayed `totalAutomatedIncome` as if it were a newly credited reward, though it had already been credited in production cycles.

## Code changes

- `dist/chapter/game.mjs`: catalog browsing maintains original camera mode; HSEC active placement and office management retain overhead view. Routine DrillTruck dispatch no longer adds a toast. M4 completion overlay displays "Producción automatizada habilitada" without phantom cash reward; M3/M1/M2 real payouts remain.
- `dist/chapter/catalog-view.mjs`: preserve `categoryScrollLeft` across DOM re-render, automatically reveal active tab and retain offset after collapse/expand.
- `dist/mission4/production.mjs`: passive zone income maximum reduced from 2,500 to 500 per 15-minute cycle at quality 1.0 and depth 30m; clamp malformed save inputs.
- `dist/mission4/offline-progress.mjs`: cap offline production catch-up to 4 cycles (1 hour) per producing zone after each return.
- `tests/mission4-economy.test.mjs`: regression tests for bounded offline accrual, idempotence, invalid geology values, ordinary production and preservation of historical money.

## Save integrity and compatibility

No save key changes, schema migrations, reset or rollback of existing money. Existing `cash`, `bank`, `ledger`, missions and `totalAutomatedIncome` values are left as-is. Newly limited income applies to **future** cycles/reconciliation only. Retroactive adjustments require analysis of the user's specific saved ledger, not blind removal of funds.

## Verification performed

- Reviewed actual source in GitHub and identified exact camera selection and UI re-render paths.
- Applied scoped changes using GitHub's file SHA checks.
- Executed updated, actual `production.mjs` and `offline-progress.mjs` function bodies in an isolated JS runtime with assertions: 7 offline days credited only 4 capped cycles = 2,000 for a maximal single zone; second call yielded 0 additional income; a 15-minute ordinary production cycle credited exactly 500 once; malformed 1e9 quality/depth could not earn more than 500. **PASS.**
- Added Node's `node:test` regression file. **Full `npm test` and visual interactive browser test not executed from the connected environment**; requires normal development/runtime test run.
- GitHub branch and Vercel deployment details must be verified after integration, before marking live.

## Collaboration

These adjustments are explicit user-approved, scoped exceptions to Claude Code's usual economic/game logic ownership and are recorded in `AI_COLLABORATION/DECISIONS.md`. Claude must review before later changes to these functions.

## Post-merge production verification

- PR #3 merged to `main` as `c9532a3135fce1c43959009681b2473a16e80827`.
- Vercel deployment `dpl_Eocd4wVeYgSJGaXwCTX4Jjk6hhfF` READY, target production, branch `main`, exact matching commit.
- Production files `/chapter/game.mjs`, `/chapter/catalog-view.mjs`, `/mission4/production.mjs`, `/mission4/offline-progress.mjs` served HTTP 200 with the expected fixes; `/manifest.json` also HTTP 200.
- Browser UI interaction and full `npm test` still not performed. No false claim of player-save testing.

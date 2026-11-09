# V26 — M4 permanent production, wear, DrillTruck service, and recycling inventory

## Scope
- Approved 2026-11-09: single DTH per Zone 1 with 15-minute cycles, initial gross revenue 1,500 per completed full cycle, 30 meters per cycle, physical site rotation, real bit and hammer consumption, DrillTruck supplies replacements from stocked inventory, spent-tool tracking for M8.
- Preserve M1-M3, existing M4 closure, all prior cash and ledger, and prior owned tools.

## Implemented
- `dist/mission4/production.mjs`: upgrades only completed M4 to `single-dth-v2`; preserves historical earnings and resets only the next-cycle clock on upgrade; credits exactly one active zone per cycle; 30 meters consumed on both installed bit and hammer; partial-life cycles credit proportional income; pseudorandom next site different from current; 12-second relocation; requests service on exhaustion; no free supplies.
- `dist/mission4/maintenance.mjs`: a return from real DrillTruck route moves discarded items from awaiting-pickup to awaiting-yard, installs compatible available replacement stock and resumes only when tools ready.
- `dist/chapter/game.mjs`: service dispatch after exhaustion only when spare tools are available, not perpetual rounds; DTH animation is limited to worksite rather than travel.
- `dist/mission4/offline-progress.mjs`: disables offline payouts on completed M4 until the logistics-aware offline simulator is implemented; deliberately prevents unsynchronized credits and free tools.
- `dist/mission4/phone-apps.mjs`: reflects producing, moving, paused, active bit life, and M8 discard state.
- `tests/m4-permanent-production-v26.test.mjs`: added regression tests.

## Validated
- Programmatically executed the production, maintenance and offline JS with synthetic completed-M4 saved state: no migration cash, no early/double credit, 1,500 per 30 m, bit exhausts, hammer wears 30 m, collected inventory persists once, DrillTruck installs actual stock, second cycle targets a different site, and no-stock leaves DTH paused. Syntax checked the modules.
- Vercel production build READY at commit 2f298f3; alias moved and verified.
- **Pending**: real browser playthrough, visual collision inspection, Vercel Cloud Save cross-device, full `node --test` repository run, and offline logistics-aware catch-up.
- Revenue is **gross** and pricing assumes no additional operating expenses. No cash was artificially granted to an existing save.

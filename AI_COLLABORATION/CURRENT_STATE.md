# Current State — DRILL RUN NEXT GENERATION

**Last updated:** 2026-11-06
**Updated by:** Claude Code (game state); ChatGPT (Git/Vercel verification)

## Game Version

- **Platform:** Three.js r170, WebGL2, ES modules (.mjs), no bundler
- **Deployment:** Vercel project `drillrun-builder-lab-v22`; automatic deployment from new GitHub commits is **not independently confirmed**. Latest checked production deployment was created via CLI (`source: cli`) and referenced repository commit `3e36fe3a7d22fc09beb3d522d52aef2118a4f86d`.
- **Deployment verification:** GitHub `main` at audit time: `8f3c434864845bc664995358296455c62c412c0e` (collaboration documentation only); Vercel production status READY does **not** mean that GitHub `main` HEAD is deployed.
- **Production release rule:** Do not push deployments to production or assume autodeploy until Vercel Git configuration, branch mapping and release approval are verified.
- **Repository:** https://github.com/pabloqandres/DRILLRUN-NEXT
- **Branch:** `main`

## Missions Status

| Mission | State | Narrative Integration |
|---------|-------|----------------------|
| M1 — Site Preparation | Complete | Yes — Elena Torres (benefactor) start/end messages, reward deferred to narrative confirmation |
| M2 — HSEC Compliance | Complete | Yes — Marco Salazar (safetySpecialist) start/end messages, 10,500 grant info message, reward deferred |
| M3 — Exploration Contract | Complete | Yes — Camila Reyes (contractAdmin) start/end messages, contract reward via existing system |
| M4 — Automation | Complete | Yes — Elena Torres returns, start/end messages |

## Recently Completed Systems

### Narrative Mission Flow (2026-11-06)
- Full narrative layer: missions now start/end via character messages on in-game phone
- 3 characters: Elena Torres (investor), Marco Salazar (HSEC), Camila Reyes (contracts)
- Phone UI shows contact list with unread badges, conversation threads with typing animation
- Mission rewards deferred to narrative confirmation (M1: 5,000, M2: 35,000 + booster)
- M3/M4 auto-start gated behind narrative acceptance
- Save migration for existing saves (backfills narrative state)
- Files: narrative.mjs, narrative-ui.mjs, narrative-strings.mjs, icons.mjs, state.mjs, game.mjs, phone-ui.mjs, ui-state.mjs, hsec/state.mjs, i18n.mjs, premium.css

### Scroll Fix (2026-11-06)
- Fixed touch scrolling across all game panels (was broken by `body { touch-action: none }`)
- Added `touch-action: pan-y` / `pan-x` to all scrollable containers
- Files: premium.css, premium-v2.css, builder-refresh.css, catalog.css, hsec.css

## Architecture Overview

- `dist/chapter/` — Core game: state, game loop, phone UI, missions, builder, catalog, i18n
- `dist/hsec/` — HSEC (safety) system: state, UI, CSS
- `dist/mission3/` — Exploration/contract mission
- `dist/mission4/` — Automation mission
- `dist/graphics/` — Three.js rendering, shaders, scene
- `dist/camera/` — Camera system
- `dist/cinematics/` — Mission cinematics
- `dist/animation/` — Animation system
- `dist/config/` — Game configuration
- `dist/assets/`, `dist/assets3d/` — 2D/3D assets

## 2026-11-06 — Catalog + Mission 4 Hotfix Live

- Production Git commit: `c9532a3135fce1c43959009681b2473a16e80827` (PR #3 squash merge), Vercel production deployment `dpl_Eocd4wVeYgSJGaXwCTX4Jjk6hhfF`, READY, source `git`, branch `main`.
- Code corrections: Catalog camera continuity and tab-scroll retention; no automatic DrillTruck patrol toast; reduced passive M4 income from 2,500 to 500 per cycle per zone; offline accrual max 4 cycles per zone per return; no fictitious historical-income mission reward.
- Historical saved cash and bank balances remain unchanged by these fixes; no save-key changes.
- Verified via production HTTP 200 and source markers for `/chapter/game.mjs`, `/chapter/catalog-view.mjs`, `/mission4/production.mjs`, `/mission4/offline-progress.mjs`, `/manifest.json`.
- Module economics passed isolated JavaScript execution assertions; full `npm test` and live browser-interaction smoke testing **not yet performed**. Test file: `tests/mission4-economy.test.mjs`.
- See `CHANGES/2026-11-06_chatgpt_catalog-camera-truck-economy-fix.md`.

## Known Issues / Verification Gaps

- No critical runtime issue was independently verified in this documentation audit; the listed mission completions reflect Claude Code's report, not independent end-to-end testing by ChatGPT.
- Confirm GitHub-to-Vercel automatic deployment settings before relying on them.
- Documentation currently under review in branch `chatgpt/collaboration-protocol-hardening`; do not describe it as merged until the PR has been approved and merged.
- README retains historical development-version language; see the new current-state notice on its front page.

## Save Format

State object (`s`) includes:
- `narrative: { messages:[], accepted:[], rewardsCollected:[] }` — Narrative system state
- `cash`, `ledger[]` — Economy
- `hsec` — HSEC system state (completedAt, rewarded, etc.)
- `mission3`, `mission4` — Mission-specific state
- `office`, `modules[]`, `roads[]` — Infrastructure
- Standard fields: level, xp, boosters, etc.

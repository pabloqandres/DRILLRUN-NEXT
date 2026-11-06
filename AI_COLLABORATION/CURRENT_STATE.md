# Current State — DRILL RUN NEXT GENERATION

**Last updated:** 2026-11-06
**Updated by:** Claude Code

## Game Version

- **Platform:** Three.js r170, WebGL2, ES modules (.mjs), no bundler
- **Deployment:** Vercel (auto-deploy from GitHub)
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

## Known Issues

- None critical at this time

## Save Format

State object (`s`) includes:
- `narrative: { messages:[], accepted:[], rewardsCollected:[] }` — Narrative system state
- `cash`, `ledger[]` — Economy
- `hsec` — HSEC system state (completedAt, rewarded, etc.)
- `mission3`, `mission4` — Mission-specific state
- `office`, `modules[]`, `roads[]` — Infrastructure
- Standard fields: level, xp, boosters, etc.

# Changelog — DRILL RUN NEXT GENERATION

## 2026-11-06 — Hotfix Catálogo + DrillTruck + Economía M4 (ChatGPT)

- **Branch:** `chatgpt/catalog-camera-and-category-scroll-fix`.
- Files: `dist/chapter/game.mjs`, `dist/chapter/catalog-view.mjs`, `dist/mission4/production.mjs`, `dist/mission4/offline-progress.mjs`, `tests/mission4-economy.test.mjs`.
- Camera: preserve player view when opening, collapsing and switching Catalog. Special builder camera only for real HSEC placement and office management.
- Category tabs: preserve horizontal scroll and reveal selected category (e.g., Seguridad).
- DrillTruck: silence repeated automatic maintenance round toast without stopping truck operation.
- Passive income: max 500 per 15-minute zone cycle (formerly 2,500), cap catch-up to four cycles per zone per offline session, clamp geology/depth. **No retroactive changes to saved cash or ledger.**
- M4 completion now describes automation activated; historical passive income no longer masquerades as a new cash reward.
- Regression test file added. Direct execution of updated economic module functions in isolated JavaScript assertions **passed**; full `npm test` and interactive gameplay testing remain unexecuted.
- Detailed change record: `CHANGES/2026-11-06_chatgpt_catalog-camera-truck-economy-fix.md`.

## 2026-11-06 — Catálogo V2: first in-game visual pass (ChatGPT)

### Preview verified; user subsequently authorized production testing
- Branch: `chatgpt/catalog-v2-visual-first-pass` (based on `main` `77c4c33`).
- `dist/chapter/catalog.css`: CSS-only design update, preserving original catalog handlers and economy.
- Layout: bottom horizontal asset dock, left identity rail, dark blue/cyan/gold tabs, floating selected product panel, responsive landscape and collapse states.
- CSS code commit: `03f3e672`; Vercel preview `dpl_98Sdej3RypL5i1T1p3CmUes8YKCf` READY.
- Validated: HTTP 200 preview stylesheet, visual CSS marker present, original CSS remains unchanged as prefix, braces balanced.
- **Not independently tested:** rendered UI in a browser or purchase/gameplay interactions.
- Detailed report: `CHANGES/2026-11-06_chatgpt_catalog-v2-visual.md`. User authorized merge to main for testing on stable production domain; browser interaction smoke test remains pending.

## 2026-11-06 — Collaboration protocol documentation hardening (ChatGPT)

### Documentation-only, pending review
- Branch: `chatgpt/collaboration-protocol-hardening`
- Changed: `CLAUDE.md`, `AGENTS.md`, `AI_COLLABORATION/RULES.md`, `AI_COLLABORATION/CURRENT_STATE.md`, `AI_COLLABORATION/CHANGELOG.md`, `AI_COLLABORATION/ACTIVE_WORK.md`, `README.md`; added `AI_COLLABORATION/CHANGES/2026-11-06_chatgpt_collaboration-audit.md`.
- Clarified mandatory pre-edit reading, protected branches and approval gate, safer local instructions, actual deployment provenance and versioned audit trail.
- Verification: inspected GitHub repository/docs/commits and Vercel project/deployment metadata; **no gameplay tests run** because no runtime source files were changed.
- No Vercel deployment or production edit performed. Commit and PR references are available through the branch history and PR once opened.

## 2026-11-06 — Narrative Mission Flow System (Claude Code)

### Added
- **Narrative engine** (`narrative.mjs`): Declarative mission narratives with characters, message delivery, acceptance, reward confirmation, save migration
- **Narrative UI** (`narrative-ui.mjs`): Phone conversation rendering with contact list, message threads, typing animation (25ms/char, tap to skip)
- **Narrative strings** (`narrative-strings.mjs`): All narrative i18n strings for 5 languages (es, en, pt, it, zh-Hant)
- **Character avatars** in `icons.mjs`: Elena Torres (briefcase/gold), Marco Salazar (shield/mint), Camila Reyes (clipboard/warm)
- **Narrative CSS** in `premium.css`: Contact cards, conversation threads, message bubbles, action buttons, typing cursor

### Changed
- **state.mjs**: Added narrative field to `newGame()`, narrative migration in `restore()`, deferred M1 reward in `useOfficeComputer()`
- **game.mjs**: Added narrative tick in frame loop, narrative action handlers, mission gates behind narrative acceptance, deferred M1/M2 completion modals
- **phone-ui.mjs**: Rewrote `renderMessages()` for narrative contact list + conversation UI with typing animation
- **ui-state.mjs**: Added `totalUnread()` combining legacy + narrative unreads
- **hsec/state.mjs**: Deferred M2 reward (35,000 + booster) to narrative confirmation
- **i18n.mjs**: Integrated narrative strings

## 2026-11-06 — Touch Scroll Fix (Claude Code)

### Fixed
- Touch scrolling broken across entire game due to `body { touch-action: none }` inheritance
- Added `touch-action: pan-y` / `pan-x` to all scrollable containers across 6 CSS files:
  - `premium.css`, `premium-v2.css`, `builder-refresh.css`, `catalog.css`, `hsec.css`

## 2026-11-06 — GitHub + Vercel Setup (Claude Code)

### Added
- Git repository initialized and pushed to https://github.com/pabloqandres/DRILLRUN-NEXT
- Vercel deployment configured
- `.gitignore` with node_modules, .env, .DS_Store, macOS resource forks

## 2026-11-06 — AI Collaboration Infrastructure (Claude Code)

### Added
- `AI_COLLABORATION/` directory with RULES.md, CURRENT_STATE.md, CHANGELOG.md, COMPONENT_OWNERSHIP.md, DESIGN_SYSTEM.md, ACTIVE_WORK.md, DECISIONS.md, CHANGES/
- `CLAUDE.md` — Claude Code entry point
- `AGENTS.md` — ChatGPT entry point

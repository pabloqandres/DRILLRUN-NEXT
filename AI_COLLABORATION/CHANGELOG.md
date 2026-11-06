# Changelog — DRILL RUN NEXT GENERATION

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

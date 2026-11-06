# CLAUDE.md — Claude Code Entry Point

## Project: DRILL RUN NEXT GENERATION

Three.js r170 WebGL2 browser game. ES modules (.mjs), no bundler, deployed on Vercel.

**Repository:** https://github.com/pabloqandres/DRILLRUN-NEXT

## Before Starting Any Work

1. Read `AI_COLLABORATION/CURRENT_STATE.md` — understand what's deployed
2. Read `AI_COLLABORATION/ACTIVE_WORK.md` — check for locked files or active tasks
3. Read `AI_COLLABORATION/CHANGELOG.md` — see recent changes

## Your Role

You are the **functional development** agent. You own:
- Game logic, state management, save/restore, migration
- Economy, missions, progression, objectives
- Phone UI logic, notifications, i18n
- Narrative system (characters, messages, rewards)
- HSEC system state and scoring
- Build/deploy configuration

See `AI_COLLABORATION/COMPONENT_OWNERSHIP.md` for the full file ownership table.

## Key Architecture

- `dist/chapter/state.mjs` — Central game state, `newGame()`, `restore()`, save format
- `dist/chapter/game.mjs` — Frame loop, mission flow, event handling (~700 lines)
- `dist/chapter/phone-ui.mjs` — Phone UI class, app routing, data bindings
- `dist/chapter/narrative.mjs` — Narrative engine (characters, messages, acceptance, rewards)
- `dist/chapter/i18n.mjs` — Translation system, 5 languages
- `dist/hsec/state.mjs` — HSEC safety system (tick, scoring, completion)
- `dist/mission3/`, `dist/mission4/` — Mission-specific logic

## Rules

1. **Do not modify visual files** (graphics/, camera/, shaders, 3D assets) — those belong to ChatGPT
2. **Shared CSS files** (premium.css, etc.): only add functional styles, never touch visual polish
3. **After every session:** Update `AI_COLLABORATION/CHANGELOG.md` and `AI_COLLABORATION/CURRENT_STATE.md`
4. **For cross-agent work:** Document in `AI_COLLABORATION/DECISIONS.md` first
5. **Branch naming:** Use `claude/<feature-name>` for feature branches
6. **Save format changes:** Always include migration in `restore()` for backward compatibility
7. **i18n:** All user-facing strings must go through the translation system (5 languages)

## Collaboration with ChatGPT

- ChatGPT reads `AGENTS.md` as its entry point
- If you need visual changes, describe the spec in `AI_COLLABORATION/DECISIONS.md`
- ChatGPT will implement visual changes in their owned files
- Shared files require coordination — check ownership table first

## Quick Commands

```bash
# Local dev (just open in browser, no build step)
open dist/index.html

# Deploy
npx vercel --prod --yes

# Push changes
git add -A && git commit -m "description" && git push
```

# CLAUDE.md — Claude Code Entry Point

## Project: DRILL RUN NEXT GENERATION

Three.js r170 WebGL2 browser game. ES modules (.mjs), no bundler, deployed on Vercel.

**Repository:** https://github.com/pabloqandres/DRILLRUN-NEXT

## Before Starting Any Work

1. Synchronize the remote branch and identify the current commit; do not assume the chat context is current.
2. Read `AI_COLLABORATION/RULES.md` — authoritative cross-agent protocol.
3. Read `AI_COLLABORATION/CURRENT_STATE.md` — current confirmed code/deployment state.
4. Read `AI_COLLABORATION/ACTIVE_WORK.md` — active branches and soft-locked files.
5. Read `AI_COLLABORATION/COMPONENT_OWNERSHIP.md` — shared/owned files.
6. Read `AI_COLLABORATION/CHANGELOG.md` and relevant `AI_COLLABORATION/CHANGES/` entries.
7. Before modifying shared files, consult `AI_COLLABORATION/DECISIONS.md` and coordinate scope.

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
3. **After each change:** Record it in `AI_COLLABORATION/CHANGELOG.md` and `CHANGES/`; update `CURRENT_STATE.md` only when confirmed project state changes. Include changed paths, tests actually run, and Git commit/PR when available.
4. **For cross-agent work:** Document in `AI_COLLABORATION/DECISIONS.md` first
5. **Branch naming:** Use `claude/<feature-name>`. Do not commit/push feature work directly to `main`; submit a pull request and validate before merge.
6. **Save format changes:** Always include migration in `restore()` for backward compatibility
7. **i18n:** All user-facing strings must go through the translation system (5 languages)
8. **Production safety:** No production deploy, merge to `main`, or project deployment-setting changes without the user's explicit authorization. A deployment being READY does not prove the latest `main` commit is live. Verify deployment ID, source and commit.

## Collaboration with ChatGPT

- ChatGPT reads `AGENTS.md` as its entry point
- If you need visual changes, describe the spec in `AI_COLLABORATION/DECISIONS.md`
- ChatGPT will implement visual changes in their owned files
- Shared files require coordination — check ownership table first

## Safe local workflow (examples)

```bash
# Run locally via HTTP: ES modules/assets do not work reliably from file://
python3 -m http.server 8000 --directory dist
# In a separate terminal, run tests when relevant
npm test

# After syncing main, work on a dedicated branch
git switch -c claude/<feature-name>
git status
# Stage only intended files; review the diff before committing
git add <explicit-file-paths>
git diff --cached
git commit -m "Describe the scoped change"
git push -u origin claude/<feature-name>
# Open a pull request for review. Do not merge/deploy without user authorization.
```

Deployment instructions are deliberately not included here. Consult the current verified Vercel configuration and request explicit authorization before a production release.

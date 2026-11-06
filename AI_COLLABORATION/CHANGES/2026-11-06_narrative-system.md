# Change: Narrative Mission Flow System

**Date:** 2026-11-06
**Agent:** Claude Code
**Type:** Feature (additive)

## Summary

Added a narrative layer where missions 1-4 start and end via character messages on the in-game phone. Three characters deliver messages, the player accepts missions explicitly, and confirms completion before receiving rewards.

## Characters

- **Elena Torres** (benefactor) — Investor, missions M1 and M4
- **Marco Salazar** (safetySpecialist) — HSEC specialist, mission M2
- **Camila Reyes** (contractAdmin) — Contract administrator, mission M3

## Files Created

- `dist/chapter/narrative.mjs` — Core narrative engine (~289 lines)
- `dist/chapter/narrative-ui.mjs` — Phone conversation rendering (~130 lines)
- `dist/chapter/narrative-strings.mjs` — i18n strings, 5 languages

## Files Modified

- `dist/chapter/state.mjs` — newGame narrative field, restore migration, M1 reward deferral
- `dist/chapter/game.mjs` — Narrative tick, action handlers, mission gates
- `dist/chapter/phone-ui.mjs` — Narrative contact list + conversation UI
- `dist/chapter/ui-state.mjs` — totalUnread helper
- `dist/chapter/icons.mjs` — Character avatar SVGs
- `dist/chapter/i18n.mjs` — Narrative strings integration
- `dist/hsec/state.mjs` — M2 reward deferral
- `dist/chapter/premium.css` — Narrative conversation styles

## Save Migration

Existing saves without `s.narrative` are migrated in `restore()` via `migrateNarrative()`:
- Completed missions → backfilled as accepted + rewards collected
- Active missions → marked as accepted only
- Edge case: M2 completed but not rewarded → reward given immediately to avoid softlock

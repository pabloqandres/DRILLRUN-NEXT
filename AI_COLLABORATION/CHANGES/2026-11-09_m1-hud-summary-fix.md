# 2026-11-09 — M1 objective HUD summary visibility repair

## User-reported defect
During a fresh game Mission 1 the player cannot see how many obstacles have been removed nor the required total.

## Root cause
- HUD business state already computed `s.cleared.length / CLEARABLES.length` and populated `#objectiveCount`.
- `dist/index.html` initializes `#objectiveDetail` with `hidden`. RenderHUD did not remove that class for M1; only later mission-specific blocks removed it.
- `hud-reference-v4.css` overrides the mission panel to the right and limits the counter width.
- This fix restores a legible mission summary on the left without changing saved counts.

## Changes
- `dist/chapter/game.mjs`: narrow visual-only exception to shared file ownership, after existing objective progress/count rendering: unhide M1 detail and show `Obstáculos retirados: X de Y` using the existing state and official CLEARABLES list. No changes to state, clearObject, costs, inventory, mission acceptance, or save format.
- `dist/chapter/hud-reference-v4.css`: restore left mission panel and collapse tab and improve responsive count/description legibility. Preserve `.hidden` authority (missions not yet accepted remain hidden).

## Verification
- Re-read both branch files from GitHub.
- Syntax of game.mjs parsed successfully via V8 after replacing imports/import.meta.
- CSS curly brace balance: 0 discrepancy.
- End-to-end in-browser gameplay and real device rendering not executed.

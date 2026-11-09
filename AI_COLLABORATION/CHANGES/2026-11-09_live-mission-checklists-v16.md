# 2026-11-09 — V16 live Mission 2/3 checklists linked to left HUD and details

## User report
M3 mission card on the left states "Equipar productos" while the player has not acquired their drilling rig; mobile "Ver detalles" reports separate phase steps, causing contradiction. M2 previously displayed opaque five-stage HSEC progress unrelated to its seven actual completion gates.

## Implementation
- `dist/mission3/mission-readout.mjs`: single pure read-only adapter from `mission3Objectives(s)`, with full 5-stage/13-check list. Calculates **next pending action** in order, true completed/total count and progress; uses the exact same model in both surfaces. Example: when workshop and geology are complete but no rig is acquired, **"Perforadora adquirida"** is Pending, 5/13 checked.
- `dist/chapter/game.mjs`: M3 left mission HUD reads next pending check and real percent from `mission3Readout` rather than hard-coded phase strings; M2 HUD reads the same seven requirements now shown in HSEC overview.
- `dist/mission3/phone-apps.mjs`: replaces separate objectives page step names/check percentages with shared checklist readout, status badges, real measurements and next-action guidance. Contract metrage is calculated from live contract state.
- `dist/hsec/mission-readout.mjs`: read-only seven conditions copied directly from HSEC's completion gate: office level 2, shed built, vehicle connected, pedestrian connected, zero unsafe crossings, lighting ≥80%, score ≥80.
- `dist/hsec/ui.mjs`: seven measured checklist rows on mission 2 overview, preserving risk, HSEC score, resources and all interactive actions. Old five stages are marked indicative.
- `dist/chapter/hud-reference-v4.css`: scoped matching card styles, scrollable HSEC panel and readable mobile status indicators.
- `tests/live-mission-checklists-v16.test.mjs`: new regression coverage for "no drill yet" ordering, completed count and HSEC gates.

## Scope
Presentation and reading only; **no mission completion conditions, currency, contracts, saved data, rewards or inventory writes** changed. Does not alter completed M2 and existing M3 game data. A small documented exception is needed for two render-only fragments in Claude-owned `game.mjs` and M3 phone app, requested directly by user.

## Verification
- Re-fetched all six changed modules from feature branch and parsed with JS runtime: PASS.
- CSS brace check: PASS.
- Deterministic mock readout checks: M3 missing drilling rig yields "Perforadora adquirida", done 5/13; M2 seven rules yield correctly ordered 3/7 with live values.
- Added Node regression tests to repository, not executed against live game; real browser/mobile UI validation pending.

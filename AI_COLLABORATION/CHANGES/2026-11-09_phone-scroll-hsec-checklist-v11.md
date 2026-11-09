# 2026-11-09 — Phone vertical scroll and M2 checklist V11

## Report and scope
- User clarified the broken scroll is inside the phone, not the construction catalog.
- User approved an explicit mission 2 checklist and has already completed mission 2; do not reset completion or rewards.

## Implementation
- `dist/chapter/hud-reference-v4.css`: force a bounded flex phone with a real vertical scrolling `#phoneContent` region, native touch gestures and visible thin scrollbar. Excludes `storeMode` which uses its own internal catalog panes.
- `dist/hsec/mission-readout.mjs`: pure read-only helper mapping seven current tickHsec gates to measured values and hints: office level, built shed, vehicle and pedestrian zone recognition, zero unsafe route intersections, lighting >=80%, score >=80.
- `dist/hsec/ui.mjs`: display seven independent Completed/Pending conditions with measured values on HSEC overview, including completed games.
- `dist/hsec/hsec.css`: checklist styling and bounded scroll region for the HSEC overview modal.

## Invariants
- No HSEC state, scoring, network, builder, economy, mission progression, save schema or rewards changed.

## Checks
- ES module syntax, CSS brace checks and readout condition checks passed; browser gesture QA pending.

# 2026-11-09 — V20 Mission 3 exact completion and timer semantics

## User bug report
User screenshot in M3: all three boreholes 3/3 completed, UI 90/90 metres, but left mission card and Phone checklist remain on 'Validar metraje contratado', 11/13 checks. The countdown falls to 00:00 before the player can submit, despite physical drilling having completed before deadline.

## Root cause, reproduced
- Auto drilling in dist/mission3/tick.mjs increments each second by 3000/3600 = 0.8333333333333334 m.
- Repeating 37 ticks x 3 boreholes of 30 m can accumulate s.contract.metersCompleted to 89.99999999999997, even though all three borehole depthDrilled values equal 30 and all statuses are completed.
- Existing mission3-state.mjs validates via isContractComplete(s), which used a strict comparison of raw s.contract.metersCompleted >= 90. Meanwhile, UI Math.round(...) displayed 90. The mission therefore remains at 11/13, preventing delivery.
- Old HUD countdown used Date.now() after physical completion, so could reach 00:00 even while the user was reading the phone. Old speed bonus computed delivery click time, unfairly penalizing completed-on-time drilling.

## Changes
- dist/mission3/contracts.mjs: add pure read-only drilledMetres(s), drillingComplete(s), drillingCompletedAt(s) helpers. Treat a final difference of up to 0.000001 m as floating-point precision only when *all actual boreholes are completed*. Snap s.contract.metersCompleted to exact target on the last physical drill advance; record drillingCompletedAt. Existing saved games with 89.99999999999997 m are considered complete without save migration or deleting history. contractProgress exposes normalized 90/90 and full progress only after confirmed complete boreholes.
- completeContract(s) continues to allow just one payment. Speed bonus uses the timestamp of actual physical finish (last borehole completedAt fallback for older saves), not the player's later phone submission.
- dist/chapter/game.mjs: existing mission timer changes to 'PERFORACIÓN COMPLETA', 'LISTO', and 3/3 metres/sondajes when contract data confirms completed drilling. Warnings cleared. Otherwise retains countdown as before. Status/mission condition checks are not duplicated in HUD.
- tests/mission3-meter-precision-v20.test.mjs: regressions for exact 90m incremental drilling, older saves, unfinished near-90 cases, speed bonus after late phone submission, no repeat payout, drilling actually after the deadline.

## Scope and coordination
Cross-owner exception: mission3/contracts.mjs and chapter/game.mjs are owned by Claude Code. This precise 90/90 contract-stuck fix was requested through user issue reports and earlier direct-build instruction. Only this targeted functional bug and timer display corrected. No contract duration, drilling productivity, reward amounts, equipment requirements, mission order, HSEC, saved schema or narrative approval changed. No new brand. Existing V16 M2/M3 checklist shared-source model remains intact.

## Verification
- Reproduced IEEE 754 bug in JS: final accumulation 89.99999999999997 m, failed >= 90.
- Mocked original-contract-state executed new contract module: three bores complete at 90 exact, old state validates at 89.99999999999997, genuinely unfinished hole rejected; late phone submission after on-time physical drilling receives correct speed bonus, exactly one payout; late actual drilling gets no bonus.
- Source JS parser tests pass all 3 changed/test files.
- Added Node regressions to repo; Node/full live browser tests not executed.

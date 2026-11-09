# 2026-11-09 — V22 finite workshop acceleration

## User report
Workshop expansion correctly has 5-minute timer, and the button is supposed to accelerate 1 minute using one booster. Player had one booster but could click repeatedly until completion without losing booster balance.

## Root cause
In `dist/mission3/inventory.mjs` accelerateWorkshop(s,seconds) only reduced job.ends, with no s.boosters guard or decrement. The workshop UI in `dist/chapter/game.mjs` allowed repeat clicks and did not refresh HUD booster count.

## Fix
- A valid active construction requires at least one booster. Every click consumes exactly one `s.boosters`, reduces remaining time by up to 60 seconds, and writes a zero-cash acceleration audit entry to ledger.
- No boosters -> reject without altering timer or inventory. Completed or absent jobs likewise cannot be accelerated. Time reduction cannot exceed actual remaining time.
- Workshop card shows `Acelerar 1 min · N disponibles`, disabled when N=0 or timer elapsed. HUD booster counter refreshes on use. If the last boost completes the job, finish it once immediately via existing finishWorkshopUpgrade and downstream updateMission4Phase/render path.
- Standard construction time, upgrade price, rewards, missions and save format unchanged. Previously completed free accelerations are not retroactively charged.

## Validation
- All changed source/test modules pass JS parse.
- Executed inventory.mjs in isolated JS test: one initial booster consumes to 0, removes exactly 60 seconds, next attempted use throws noBoosters without changing end time; ledger records boosters:-1 once.
- Committed 5 Node regression tests under `tests/workshop-boost-economy-v22.test.mjs` (not executed against browser).
- Device browser QA pending.

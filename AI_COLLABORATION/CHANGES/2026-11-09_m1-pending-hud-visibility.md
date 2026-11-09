# 2026-11-09 — Mission 1 HUD pending-acceptance visibility correction

## Defect and root cause
- User screenshot shows no objective card, though removal targets are present and the phone has an unread briefing.
- `renderHUD()` called `hidden($('#objective'),!activeNarrativeMission(s))`.
- `activeNarrativeMission` returns `null` before the player accepts the M1 narrative message; this hid the entire objective card, even though the real-world cleaning step and counters are usable.

## Scope
- `dist/chapter/game.mjs`: show a read-only M1 objective card when the M1 narrative reward has not yet been collected and there is no other active accepted narrative mission. Keep the original narrative gating and acceptance actions.
- Show the real `s.cleared.length / CLEARABLES.length` summary and original progress for pending M1. Existing M2–M4 handling untouched.

## Tests and limitations
- Module source re-fetched and V8-parsed: pass.
- Static assertions: pending M1 visibility condition, detail display, authentic obstacle counter, narrative acceptance unchanged: pass.
- Browser interaction and rendering on the player's device: not executed.
- No economy, saved-data, state-transition, reward or automatic mission acceptance changes.

# 2026-11-09 — HSEC mission scroll V10 (ChatGPT)

## User issue
HSEC mission panel scrolling reportedly stopped working. The modal has a height limit, while the nested `.hsecBody` was not independently defined as a scroll container.

## Visual-only fix
- `dist/hsec/hsec.css`: make `#modalCard.hsecModal` a bounded flex column, let `.hsecPanel` flex, and scroll its `.hsecBody` with `overflow-y:auto`, `touch-action:pan-y`, and iOS momentum scrolling.
- Keep HSEC heading and tabs stationary; tabs remain horizontally scrollable.
- Apply vertical scrolling to the in-game objective detail HUD.
- No changes to mission logic, validation conditions, economy, HSEC score, saved state, or game data.

## Validation
- CSS bracket balance and presence of scoped selectors inspected.
- Full mobile browser interaction not run. No deployment to production without release approval.

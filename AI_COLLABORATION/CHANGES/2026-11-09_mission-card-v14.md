# 2026-11-09 — V14 unified mission card visual polish

## User report
The mission card in M3 shows the collapse tab cropped on the right, the "VER DETALLES" arrow displaced/outside the card, and an overcrowded header/title/progress/footer. Requested one consistent fix across all mission cards, not just M3.

## Changes
- `dist/chapter/hud-reference-v4.css`: final-layer universal M1–M4 card treatment. A true bounded flex-column card, more legible heading, status badge, icon/title, scrolling objective detail, metric bar, and integrated full-width footer.
- Collapse tab is inset (`right:0`) instead of floating beyond the card boundary, and collapsed translation exposes its full touch target.
- Responsive layouts for landscape compact devices; "Ver detalles" stays present even in the short-screen style.
- Mission-complete state retains existing success colors and actions; reduced-motion settings honored.

## Scope and compatibility
- Pure CSS change. No alterations to `dist/chapter/game.mjs`, HTML IDs, events, saved games, missions 1–4, timer, rewards, HSEC or construction.
- Previous V13 geological/HSEC telemetry rail preserved.
- Existing `#objective`, `#objToggle`, `#objectiveDetail`, `#objectiveProgress`, and `#objectiveCount` markup unchanged.

## Validation
- Re-fetched live branch stylesheet and HTML; all 12 targeted source checks passed, CSS braces balanced.
- Browser render/screenshot and on-device tap acceptance not run.

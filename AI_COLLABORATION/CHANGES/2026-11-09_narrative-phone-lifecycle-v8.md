# 2026-11-09 — Narrative phone + mission lifecycle V8 (ChatGPT)

## User-reported defects and desired flow
- Screenshot: narrative messages on cream cards have nearly invisible gray text.
- Character avatars absent from the bubble; user requests actual character portraits.
- Typewriter never starts because `PhoneUI.renderMessages` marks the character read before `renderConversation` checks `!m.readAt`.
- Missions appear to be running before player has accepted a welcome SMS; conclusion and rewards have inconsistent presentation.

## Changes (actual code, not mockups)
- `dist/chapter/premium.css`: scoped high-contrast phone text, dark blue lettering, sender hierarchy, rounded portrait, clear action buttons, responsive sizes and a pulsating phone icon while SMS acceptance/completion is pending.
- `dist/assets/narrative-portraits.mjs`: three original inline SVG human portrait illustrations: Elena Torres, Marco Salazar, Camila Reyes. No external image, trademark or dependency.
- `dist/chapter/narrative-ui.mjs`: every bubble identifies sender with matching portrait, name and position; HTML escaped. Typewriter uses deterministic requestAnimationFrame elapsed time; pointerdown skips; hidden action button appears when text is finished.
- `dist/chapter/phone-ui.mjs`: render message before recording its readAt timestamp. Existing per-message `readAt` is the first-open memory; reopen shows full text without replay, no new save schema.
- `dist/chapter/narrative-strings.mjs`: update Spanish Elena Torres M1 welcome to offer 5,000 reward, cleared plot, office that is already furnished and step-by-step narrative.
- `dist/chapter/game.mjs`: distinctive WebAudio SMS ring following sound preference; automatically opens each initial mission start SMS when eligible; end SMS rings and awaits user phone tap (persistent glow, direct conversation navigation). Missions' objective HUD and M1 clear/build interactions only unlock on narrative acceptance. M2 HSEC scoring only ticks after accepting M2; M3/M4 already use accepted narrative for initialization. Intermediate rewards no longer display final mission-complete modal; M3 contract hand-in stops showing premature mission completion overlay. Final confirmation of each M1–M4 triggers existing Mission Complete overlay, including real contract payment ledger on M3. New start SMS waits for previous completion overlay to dismiss.
- Existing economy, accepted/collected state, contract payment timing, save format and legacy migration unchanged. No unapproved third-party brands.

## Actual checks
- All 5 modified/new ES modules parsed in V8 after removing ES import/export declarations: PASS.
- Scoped CSS brace balance: PASS.
- Mock conversation rendering: real sender avatar slot, job role and action button hidden during first-open typing: PASS; body content escaped: PASS.
- Static assertions checked start/finish ring/auto-open, phone-glow condition, acceptance-gated HUD and HSEC tick, and no premature M3 modal: PASS.
- Live browser, phone haptics, audio autoplay eligibility and full M1–M4 end-to-end gameplay not executed; testing on deployment remains required.

## Agent boundary exception
Per user's express request to implement full system, shared/Claude-owned `game.mjs`, `phone-ui.mjs`, `narrative-ui.mjs` and `narrative-strings.mjs` receive narrowly-scoped narrative UI and lifecycle adjustments. The canonical narrative state engine `narrative.mjs`, monetary state `state.mjs`, and HSEC economic state were not edited. See `DECISIONS.md`.

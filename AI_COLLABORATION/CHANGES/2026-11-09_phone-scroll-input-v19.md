# 2026-11-09 — V19 UX stability, Casa Matriz and workshop immersion

## User-reported defects
1. Phone scroll blocked or repeatedly reset to the top, including after buying individual bits.
2. PC controls sometimes remain stuck after opening menus or losing focus.
3. Casa Matriz RC preview extends beyond card; raw product translation key and misaligned price/button.
4. Footsteps too prominent, requested subtle accompaniment.
5. Workshop shed interior dark at night.

## Implemented
- dist/chapter/phone-ui.mjs: preserve scrollTop across same-app re-renders (especially purchases), reset on navigation to another phone app.
- dist/chapter/hud-reference-v4.css: native vertical scroll and flex min-height in the phone, scoped stable three-column responsive RC rig cards; clip/render image previews via object-fit: contain; keep text and buttons inside cards.
- dist/mission3/phone-apps.mjs: targeted RC card class and human-readable RC rig names instead of raw translation keys. No purchase value changed.
- dist/chapter/game.mjs: stop movement on phone/catalog/modal focus, prevent keys acting on gameplay while overlay is open; release held controls on blur, hidden document, Escape and pagehide.
- dist/audio/worksite-audio.mjs: lower gravel footsteps about 38 percent, concrete about 31 percent, soften onset.
- dist/graphics/site-cinematics.mjs: two actual neutral-white ceiling lights, emissive housings, glows inside the real completed workshop. No new build geometry, colliders or artificial workshop.
- tests/phone-scroll-v19.test.mjs: scroll persistence and reset tests, plus DOM/style wiring assertions.

## Constraints
V16 checklists previously approved by user, V17 HSEC header and V18 ambient effects remain unchanged. No missions, saved state, contract, money, purchases or HSEC scoring changes. Narrow UI-only integration in Claude-owned game.mjs under direct user request.

## Verification
Six modified JS modules pass syntax parsing, CSS braces balanced. A fake DOM test of actual PhoneUI.render shows same-app scroll 280 remains 280, app navigation resets it to 0. New Node tests committed but not run; actual mobile/desktop browser audio and GPU visual QA remains pending.

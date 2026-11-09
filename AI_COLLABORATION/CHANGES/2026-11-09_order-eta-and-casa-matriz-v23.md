# 2026-11-09 — V23 precise order ETA and Casa Matriz mobile layout repair

## User reports
- Orders for bits, hammers, drilling rigs, vehicles show "1 min" for their entire last minute, despite less than one minute remaining. Different products and machinery share the same fault.
- Three screenshots show misaligned/distorted Casa Matriz phone layout following previous V19 CSS tweaks; rig thumbnail, text and purchase controls compete for the same row.

## Root cause
Two independent UI functions in dist/mission3/phone-apps.mjs used Math.ceil(remainingSeconds/60); values 1–60 always became 1 min. The phone refreshed only once every 2 seconds. The V19 rig card forced three columns with no reliable account of the narrow PHONE width, so the product description was squeezed by model preview and price.

## Changes
- dist/mission3/headquarters.mjs: introduce read-only orderSecondsRemaining(order,now) and formatOrderETA(order,now). For 1–59 seconds show exact seconds; 60+ seconds show whole minutes (round up); 0 shows "Llegando...". All types use order.dispatchDuration/dispatchedAt, so delivery scheduling remains unchanged.
- dist/mission3/phone-apps.mjs: BOTH orders panel and Casa Matriz pending-orders summary use the same formatter. Scope a m3CatalogHeader class to Casa Matriz without affecting other phones.
- dist/chapter/game.mjs: refresh Pedidos and Casa Matriz once per second (other screens retain 2-second refresh); existing scroll restoration from V19 remains.
- dist/chapter/hud-reference-v4.css: final scoped CSS only under #phone[data-app="m3-catalog"]: remove 3-column squeeze, use 2-column model image/details with button below description; images clipped inside preview and text wraps, wallet in a separate header row, regular consumables remain compact and contained. Phone-specific layout rather than desktop-size breakpoints.
- tests/order-eta-and-catalog-v23.test.mjs: checks across bit/hammer/RC/DTH/DrillTruck, final 59,34,1 sec and 60/61 transitions, completed/pending, shared consumers and scoped CSS.

## Scope and QA
- No delivery timers, purchase prices, saves, state, inventory, mission logic, HSEC or economy changed.
- 5 modified JS/CSS/test files pass JS parse / balanced CSS. Actual formatting function exercised against 0,1,23,59,60,61,119,120 seconds with expected output.
- Browser/mobile actual screenshots and interaction QA still pending.

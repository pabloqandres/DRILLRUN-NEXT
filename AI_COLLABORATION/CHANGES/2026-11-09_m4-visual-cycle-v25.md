# 2026-11-09 — V25 catalog presentation, real zones, RC ground, notifications, first production timer

## Screenshots / runtime error reported
- DrillTruck thumbnail cropped in builder vehicle catalog and its technical sheet.
- RC moved into temporary staging at x=-18 under raised desert mesh; player sank into the terrain.
- "Localizar [perforadora] en faena" notification threw `TypeError: n.action is not a function` because an action string was supplied.
- "Zonas convertidas 3/6" although there are only three genuine completed sites in player save; six was hardcoded.
- Player cannot tell when M4 first 15-minute DTH production cycle finishes and expected a small right HUD countdown.
- "$/hora" metric misinterpreted as DrillTruck earnings; actual meaning is projected gross income from producing DTH zones, paid only on completed 15-minute cycles.
- User asks what happens to DTH after M4: the rig must remain owned, stay at its assigned site and continue producing beyond mission completion.

## Repairs implemented
- `dist/chapter/drilltruck-catalog-audit.css` final scoped vehicle CSS clips real asset thumbnails inside catalog cards and technical panels using contain and flex sizing, preserving title and technical data.
- `dist/graphics/production-dth-rig.mjs` move temporary RC and DTH staging pads from (-18,-9.3)/(-23,-9.3) to (9,-7.2)/(15,-7.2), wholly inside the flat playable yard. Existing positional world update moves machines to new locations without save-schema changes. No HSEC score or future M5 yard is granted.
- `dist/chapter/notifications.mjs` only exposes/calls optional actions if callable, dismissing safely. `dist/chapter/game.mjs` replaces action string for drill-localization notification with real movement-to-rig callback.
- `dist/mission4/phone-apps.mjs` derives converted zones total from union of real completed borehole IDs and current zone IDs; no hardcoded 6. Both per-hour stats relabeled "Producción estimada/h" and zones description explains projected gross income versus real cycle payouts, unrelated to DrillTruck.
- `dist/mission4/production.mjs` adds pure `firstProductionCycleStatus(s,now)` that reads actual zone status and persisted `lastCycleAt`. Before production it reports waiting or maintenance without fake countdown. While producing it shows 15m through 0s; after first income it hides.
- `dist/index.html` adds separate compact `#productionCycleTimer` in HUD to right below top bar; `dist/chapter/game.mjs` updates text, progress and site each HUD frame, and hides it automatically when no first cycle pending. Styled in `dist/chapter/hud-reference-v4.css`. Does NOT move HSEC back from top bar or change actual cycle length.
- M4 end handling now immediately delivers and auto-opens the benefactor's final message after first actual cycle income; notification acknowledges first credit instead of showing a premature completion overlay. Already-delivered unread M4 endings are recovered. Formal mission confirmation shows M4 completed without granting duplicate cash. Continuing production, DTH position, tool ownership and future cycle income remain unmodified.
- `tests/m4-visual-status-v25.test.mjs` guards timer, real site totals, flat staging, notification click and DTH production persistence.

## Validation
- 8 changed JS/CSS/HTML source files pass V8 syntax/CSS balance.
- Exercised firstProductionCycleStatus and tickProduction using actual source in JS: 15:00, 07:30, 00:01, 00:00 first income event, hidden after first income; DTH remains producing in assigned zone with per-hour projection. No game economy rule changed.
- Full Node tests and visual WebGL/device QA remain pending.
- Note that exact graphic cropping requires visual inspection on desktop/mobile after deployment.

## Collaboration
Narrow user-requested edits to Claude-owned game, phone and production modules documented here. No M2/M3 checklist, money/boosters, scoring, save migrations or independent M5 features altered.

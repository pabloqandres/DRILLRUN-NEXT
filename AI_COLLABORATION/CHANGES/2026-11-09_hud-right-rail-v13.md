# 2026-11-09 — HUD right-side telemetry layout V13

## User observations
- Mission 3 screenshot: small geological-analysis notification stacks on top of large mission card at the left, beside another loose HSEC score badge.
- Request: move geological activity to the right and keep the already-completed HSEC score small at the top.

## Changes
- `dist/index.html`: move the existing HSEC button from *inside* `#objective` to its sibling in `#hud`. IDs, event hooks and card contents preserved; this prevents collapse/transforms of the mission card from also transforming HSEC.
- `dist/chapter/hud-reference-v4.css`: final-layer scoped visual overrides place the compact HSEC status just under the top-right resource bar; geological progress appears directly underneath it. Responsive placement avoids the bottom joystick/navigation. Existing progress, completion and click handlers unchanged.
- No JS/gameplay/economy/missions/saves altered, no new assets or logos.

## Verification
- Current branch HTML/CSS fetched from GitHub.
- Assertions: both IDs exist once and within HUD, HSEC is no longer a descendant of mission card, geological progress/dismiss remain present, CSS braces balanced and right-rail overrides present.
- Browser screenshots/real-device geometry still require verification.

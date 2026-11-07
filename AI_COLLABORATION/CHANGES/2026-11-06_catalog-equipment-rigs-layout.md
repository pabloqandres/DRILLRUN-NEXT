# Catalog Audit 02 — Vehículos identity rail, Equipment labels and two rig types

Date: 2026-11-06
Owner: ChatGPT
Scope: visual CSS and read-only Catalog equipment presentation only

## Verified root cause
The prior vehicle audit introduced `#builderPanel.catalogTray[data-category="vehicles"] .constructionRail { padding:10px 14px!important; }`. Its !important shorthand overrides the Catalog V2 identity rail's `padding-left:144px`, so the larger vehicle card overlaps the left CATÁLOGO band. Restore the full left inset (144px desktop, 101px compact).

## Two rig cards
The existing source declared two RC drills and one DTH drill. Expose one RC exploration choice and one DTH production choice as the primary in-game Catalog cards. Keep the advanced RC type/ID/pricing untouched for older purchases and queued orders; in these cases the one RC slot shows the advanced model. Game nicknames: PIONERO RC, PIONERO RC PRO, TITÁN DTH.

## 3D research
Use Explorac 235 as a geometry reference for exploration RC, and SmartROC D65 for production DTH. External manufacturer logos must be removed from any game-visible model. Reference imagery stays outside the game, not pasted into production.
See `design/equipment-rig-reference-brief.md`.

## Safety/QA
Tests and browser layout checks are to be recorded after execution; do not merge or deploy without approval.

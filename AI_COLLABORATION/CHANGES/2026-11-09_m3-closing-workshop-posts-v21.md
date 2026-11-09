# 2026-11-09 — V21 M3 auto-closing SMS + workshop phantom light poles

## Symptoms and root causes
1. After the player submits a fully drilled M3 contract, money is paid but Camila Reyes' closing narrative message is only notified. The narrativeTick logic automatically opened only ':start' messages; ':end' messages rang but did not open, even when the Contract phone screen was already open.
2. Workshop expansion reports many "Poste de luz" although not visible. detectWorkshopObstacles() traversed all meshes in the entire 3D scene and labeled any mesh position above 2 metres as a post, including parts of building walls, decorative light fixtures, scenery. Its UI falsely claimed objects are removed automatically though no such removal occurs.

## Changes
- dist/chapter/game.mjs: After successful completeContract(), call narrativeTick(1.5) after updateMission3Phase, save, HUD and phone render. This delivers Camila's n:m3:end and auto-opens its conversation even if the phone was already on Contrato. It NEVER calls completeContract twice; narrative confirmCompletion('m3') has reward:null, preserving exactly one payment and gating M4 on explicit confirmation. Existing saves with delivered, unread n:m3:end are recovered in the narrative polling tick and auto-opened once. No other closing message behavior changed.
- Same file: detectWorkshopObstacles reads only s.hsec.assets with status 'built' and known static types at actual coordinates inside the extension rectangle. It no longer traverses world meshes, guesses 'Poste de luz' by height, or reports nonexistent scene parts. Warning accurately says any actual HSEC installation is registered nearby, NOT that the game automatically removes it. Construction is not blocked nor auto-removes the user's HSEC assets.
- tests/m3-auto-end-message-v21.test.mjs: actual narrative contract closing, single message, no second money grant, M4 unlock message, saved unread recovery, only actual built HSEC assets.

## Collaboration / invariants
Targeted cross-owner correction to Claude-owned dist/chapter/game.mjs explicitly prompted by user's bug report and standing direct implementation instruction. Other M3 logic, economy, saved state, HSEC scoring, buildings and terrain unchanged. V16 checklists remain approved.

## Verification
- Actual narrative.mjs functions exercised in isolation: M3 end pending -> deliver once -> confirm no new cash -> M4 intro eligible. PASS.
- Pure detector extracted and tested with built tower, unfinished post, distant sign, nearby cone: only genuinely built nearby objects returned, no phantom scene meshes. PASS.
- Modified game JS parses successfully. Test file staged but not executed with Node or real browser; device UI not verified.

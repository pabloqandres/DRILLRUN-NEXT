# PUMA red restoration, workshop access collision fix, architectural approval workflow

**Date:** 2026-11-06
**Agent:** ChatGPT (direct implementation; no handoff)
**Scope:** Bug fix + reversible palette correction only. The newly generated visual proposals are conceptual designs, **not completed 3D replacements**, pending user approval.

## User feedback
- Restore the previously preferred office architecture and PUMA burgundy, improving true stair/railing detail, racks and architecture in a future user-approved model revision.
- The character cannot move from the outside yard toward the workshop; there appears to be an invisible collider.
- The "full HUD redesign" previously shown has NOT yet been implemented; prior World Art V1 added compact HUD CSS but retained the old layout/logic.
- Provide architecture designs for review before complete model rebuild, rather than claiming AI concept images exactly match real game mesh.

## Confirmed source defect
In `dist/scene.mjs`, `World.updateWorkshop()` (L2) unconditionally pushed a 3.8×2.6 metre `_workshopNv2` parking AABB centred at world (0.9, -3.5). No physical parking vehicle is guaranteed at that position. The box blocks a valid outdoor pedestrian approach even when the space looks empty.

**Fix:** Remove any legacy `_workshopNv2` phantom parking collider in-place from the shared collider array. Preserve real building walls, front support pillars, HSEC networks and other collisions. A parked real vehicle must declare its own true physical footprint rather than occupying the whole hypothetical parking bay.

## Reversible visual correction
- `dist/assets3d/office-shell.mjs`: restore original approved PUMA color values `red 0x701e30 / edge 0x461b28` and the warm cladding palette, retaining already-built solar/access/light details and original functional openings.
- `dist/scene.mjs`: PUMA red workshop canopy and back roof fascia.
- `dist/hsec/shed-model.mjs`: PUMA red access canopy.
- No structural/functional redesign of office, workshop or HSEC shed in this hotfix; that requires approved visual plans.

## Tests
- Added `tests/workshop-access-and-puma-color.test.mjs`: the L2 exterior approach at (0.9,-3.5) and front opening at (-7.6,-6.3) are walkable in isolated World.isBlocked test fixture while real walls remain blocking; old parking AABB would have blocked exactly the tested approach.
- Ran actual `World.prototype.isBlocked` from the branch against the `circleHitsRect` function in `office-layout.mjs` using an isolated JavaScript harness; six assertions passed, including absence of phantom push code and in-place stale-collider cleanup.
- Full `npm test`, interactive browser navigation with the user's exact saved HSEC construction and performance screenshots remain to be checked.

## HUD / architecture approval
The existing production HUD is NOT the comprehensive interface from the mockup. Only visual CSS, compact controls and updated SVG iconography have been integrated. New layout, missions dock, fixed left objective header and world scene composition require a separate actual implementation after visual signoff.

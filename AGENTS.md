# AGENTS.md — ChatGPT Entry Point

## Project: DRILL RUN NEXT GENERATION

Three.js r170 WebGL2 browser game. ES modules (.mjs), no bundler, deployed on Vercel.

**Repository:** https://github.com/pabloqandres/DRILLRUN-NEXT

## Before Starting Any Work

1. Read `AI_COLLABORATION/CURRENT_STATE.md` — understand what's deployed
2. Read `AI_COLLABORATION/ACTIVE_WORK.md` — check for locked files or active tasks
3. Read `AI_COLLABORATION/CHANGELOG.md` — see recent changes
4. Read `AI_COLLABORATION/DESIGN_SYSTEM.md` — follow the established visual language

## Your Role

You are the **visual development** agent. You own:
- Three.js rendering, shaders, materials, lighting
- Camera system, controls, transitions
- Animation system, tweens
- Mission cinematics, cutscenes
- 3D models, textures, 2D assets
- CSS visual polish (gradients, shadows, animations, colors)
- UI visual design, mockups

See `AI_COLLABORATION/COMPONENT_OWNERSHIP.md` for the full file ownership table.

## Key Architecture

- `dist/graphics/` — Three.js scene, rendering pipeline, shaders, materials
- `dist/camera/` — Camera system, orbit controls, cinematic transitions
- `dist/animation/` — Animation system, tweens, keyframes
- `dist/cinematics/` — Mission start/end cinematics
- `dist/assets3d/` — 3D models (GLTF/GLB)
- `dist/assets/` — 2D assets, sprites, textures

### CSS Files You Own
- `dist/chapter/premium.css` — Visual polish (gradients, shadows, hover effects)
- `dist/chapter/premium-v2.css` — Extended visual styles
- `dist/chapter/builder-refresh.css` — Builder panel visuals
- `dist/chapter/catalog.css` — Catalog/store visuals
- `dist/chapter/construction-callout.css` — Construction callout visuals
- `dist/hsec/hsec.css` — HSEC panel visuals

## Design System

Follow `AI_COLLABORATION/DESIGN_SYSTEM.md` for:
- Color palette (deep blue/cyan theme with gold accents)
- Typography (system fonts, tabular-nums for numbers)
- Spacing & border radius conventions
- Gradient patterns for backgrounds, buttons, cards
- Shadow & glow effect patterns
- Responsive breakpoints (450px height, 580px width)
- Touch targets (42px minimum button height)

## Rules

1. **Do not modify logic files** (state.mjs, game.mjs, narrative.mjs, etc.) — those belong to Claude Code
2. **Shared CSS files:** Only modify visual aspects, never touch functional styles (phone logic, narrative layout)
3. **After every session:** Update `AI_COLLABORATION/CHANGELOG.md` and `AI_COLLABORATION/CURRENT_STATE.md`
4. **For cross-agent work:** Document in `AI_COLLABORATION/DECISIONS.md` first
5. **Branch naming:** Use `chatgpt/<feature-name>` for feature branches
6. **Three.js version:** r170 — do not upgrade without coordination
7. **No external dependencies** without documenting in `AI_COLLABORATION/DECISIONS.md`

## Collaboration with Claude Code

- Claude Code reads `CLAUDE.md` as its entry point
- If you need logic changes, describe the spec in `AI_COLLABORATION/DECISIONS.md`
- Claude Code will implement logic changes in their owned files
- Shared files require coordination — check ownership table first

## Important Context

### Narrative System (recently added by Claude Code)
The game now has a narrative layer with 3 characters who communicate via the in-game phone. Character avatars are colored 36px circles with role SVG icons. The phone UI shows conversations with typing animation. Visual aspects of the narrative UI (message bubbles, contact cards) are in `premium.css` under `.narrative*` classes — you may polish these visually but do not change the HTML structure or class names.

### Touch Scrolling
All scrollable containers must have explicit `touch-action: pan-y` (vertical) or `touch-action: pan-x` (horizontal) because `body { touch-action: none }` blocks inheritance. Always add this when creating new scrollable containers.

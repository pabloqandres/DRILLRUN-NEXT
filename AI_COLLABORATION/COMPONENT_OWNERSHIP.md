# Component Ownership — DRILL RUN NEXT GENERATION

## Claude Code (Functional)

### Exclusive ownership
| File/Directory | Responsibility |
|----------------|----------------|
| `dist/chapter/state.mjs` | Game state, save/restore, economy, migration |
| `dist/chapter/game.mjs` | Game loop, mission flow, frame tick, event handling |
| `dist/chapter/phone-ui.mjs` | Phone UI logic, app navigation, data bindings |
| `dist/chapter/i18n.mjs` | Translation system, language loading |
| `dist/chapter/narrative.mjs` | Narrative engine, message delivery, acceptance |
| `dist/chapter/narrative-ui.mjs` | Narrative phone rendering, typing animation |
| `dist/chapter/narrative-strings.mjs` | Narrative i18n strings (5 languages) |
| `dist/chapter/ui-state.mjs` | UI state helpers, unread counts |
| `dist/chapter/icons.mjs` | SVG icons, character avatars |
| `dist/chapter/config.mjs` | Game configuration |
| `dist/chapter/mission-progression.mjs` | Mission progression logic |
| `dist/chapter/modular-strings.mjs` | Modular UI strings |
| `dist/chapter/notifications.mjs` | Notification system |
| `dist/chapter/auth.mjs` | Authentication |
| `dist/chapter/cloud-save.mjs` | Cloud save system |
| `dist/chapter/clearables.mjs` | Clearable object system |
| `dist/chapter/office-access.mjs` | Office access logic |
| `dist/chapter/guidance.mjs` | Tutorial/guidance system |
| `dist/hsec/state.mjs` | HSEC state, tick, scoring |
| `dist/mission3/` | Mission 3 logic |
| `dist/mission4/` | Mission 4 logic |
| `dist/config/` | Configuration files |
| `package.json` | Dependencies |
| `.gitignore` | Git ignore rules |
| `vercel.json` | Deployment config |

### CSS (Claude Code)
| File | Scope |
|------|-------|
| `dist/chapter/chapter.css` | Base chapter styles |
| (functional styles in premium.css) | Phone UI logic styles, narrative styles |

## ChatGPT (Visual)

### Exclusive ownership
| File/Directory | Responsibility |
|----------------|----------------|
| `dist/graphics/` | Three.js rendering, shaders, materials, lighting |
| `dist/camera/` | Camera system, controls, transitions |
| `dist/animation/` | Animation system, tweens |
| `dist/cinematics/` | Mission cinematics, cutscenes |
| `dist/assets3d/` | 3D models, textures |
| `dist/assets/` | 2D assets, sprites |
| `design/` | Design mockups, references |
| `mockups/` | UI mockups |

### CSS (ChatGPT)
| File | Scope |
|------|-------|
| `dist/chapter/premium.css` | Visual polish, gradients, shadows, animations (visual aspects) |
| `dist/chapter/premium-v2.css` | Extended visual styles |
| `dist/chapter/builder-refresh.css` | Builder panel visual design |
| `dist/chapter/catalog.css` | Catalog/store visual design |
| `dist/chapter/construction-callout.css` | Construction callout visuals |
| `dist/hsec/hsec.css` | HSEC panel visual design |

## Shared Files (Requires Coordination)

| File | Claude Code | ChatGPT | Coordination Rule |
|------|------------|---------|-------------------|
| `dist/chapter/premium.css` | Functional styles (phone logic, narrative) | Visual polish (gradients, shadows) | Append-only; each agent adds at end of their section |
| `dist/chapter/game.mjs` | Game loop, state | Rendering calls, camera hooks | ChatGPT provides specs; Claude Code integrates |
| `dist/chapter/builder-ui.mjs` | Builder logic | Builder visual hooks | Document changes in DECISIONS.md first |
| `dist/chapter/catalog-view.mjs` | Catalog logic | Catalog visual hooks | Document changes in DECISIONS.md first |
| `index.html` | Script loading | Asset references | Coordinate via DECISIONS.md |
| `dist/index.html` | Script loading | Visual structure | Coordinate via DECISIONS.md |

## Rules for Shared Files

1. Before editing a shared file, check `ACTIVE_WORK.md` for locks
2. Document intended changes in `DECISIONS.md`
3. The primary owner makes the edit when possible
4. If both agents need to edit, use separate clearly-marked sections
5. Never reformat or reorganize code in shared files — only add/modify what's needed

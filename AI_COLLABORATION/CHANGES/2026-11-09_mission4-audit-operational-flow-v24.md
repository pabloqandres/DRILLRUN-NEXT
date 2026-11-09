# 2026-11-09 — V24 Mission 4 gameplay / UX audit and operational repair

## Scope
User explicitly requested ChatGPT directly audit Mission 4 end-to-end, simplify all purchase/receipt/tool-install/deployment/maintenance flows, locate DTH/RC machinery, and design a future M5 fenced secure equipment yard. Existing M1–M3 saves and approved M2/M3 checklists must remain intact.

## Audit: confirmed root causes (before V24)
1. **Buried product families:** Casa Matriz M3 RC/EXPLORA® product list had a separate DTH catalog link appended by phone-ui *at the bottom*, so DTH production items were only found accidentally. RC bit category was confusingly labeled “Bits DTH”.
2. **No useful central walkthrough:** M4 objective checks were real but scattered in independent panels; main HUD and phone gave overlapping but unhelpful instructions. No link between current action, destination, delivery or cost.
3. **Taller not actually operating as M4 workbench:** tools/install buttons existed in the DTH purchase catalog rather than the workshop; no central DTH installed-tool view at Equipos.
4. **Invisible paid DTH:** delivery was persisted by `tickDeliveries` → `materializeMachinery` → `purchaseDthDrill(...,true)`, but no M4 world model was ever spawned. The only M4 3D tracked was DrillTruck. RC remained visually at its last borehole.
5. **Wrong production state:** `assignDthDrillToZone` set the rig to `producing` immediately; the real zone stayed idle until DrillTruck service was completed, so UI/engine/audio falsely implied active production.
6. **Non-monotonic checklist:** truck clears `assignedZone` when maintenance finishes, making its previously completed link check regress while M4 waits for first production cycle.
7. **Budget hidden:** minimum procurement path costs 61,100 in game units (8,000 workshop L2 + 28,000 rig + 6,500 PUMA DTH 6 + 800 DTH bit 6 + 5,000 technician + 12,000 truck + 4 × 200 delivery). Actual remaining amount depends on owned/paid goods. M4 once-only cash floor 30,000 is not itself enough for every purchase; players may need saved M3 capital. This balancing/economy risk is identified, NOT silently rewritten.
8. **First-production waiting time undisclosed:** actual production cycle is 900 sec (15 min). Now shown in walkthrough.

## V24 implemented
- New read-only `dist/mission4/operations-guide.mjs`: five real stages/11 checks taken from `mission4Objectives(s)`, first pending action + route, status RC and DTH, installed hammer/bit counts, pending deliveries, current wallet, exact minimum total and remaining budget excluding purchased/in-transit supplies.
- New functional `m4-operaciones` phone view with direct functional routes to **Casa Matriz → Taller → Zonas → DrillTruck**, full checklist in order, financial overview and real equipment whereabouts. Main mission HUD reads this same adapter. M4 phone home also exposes the new Operations tile.
- `dist/mission3/phone-apps.mjs` Casa Matriz now shows **EXPLORA® / Sondaje RC** and **PUMA® DTH / Producción** two tabs *at the top*; RC bits explicitly labeled for RC exploration. DTH catalog has reciprocal visible tab and a direct action to Workshop. Removed the previous hidden link at bottom.
- New `m4-workshop` operations screen installs real delivered PUMA DTH hammer and DTH bit using existing `installDthTool` callback and inventory state. Shows installed status, remaining life and correct next actions. Existing Equipos bottom-nav button routes here during M4; in-world Workshop card offers same action. All purchases remain in Casa Matriz and deliveries in Pedidos.
- New `dist/graphics/production-dth-rig.mjs` provides an optimized generic low-poly visual DTH *stand-in*, without branded machine markings. It is created only after actual DTH delivery and moves to actual assigned M4 zone; collider follows. RC visualization is moved into its own physical reserve bay after completed M3 when M4 activates, retaining s.drill and tools. Two minimalist marked bays temporarily stage rigs by the workshop. No fictitious fenced/illuminated M5 yard or security score.
- Actual user-supplied source models `PERFO RC.glb` (~79 MB, 1M triangles) and `PERFO 2 DTH.glb` (~68 MB, 1M triangles) available locally but **not inserted into repository** due mobile bandwidth/performance and binary upload limitations. V24 visual remains generic provisional, not a claim to use user GLB.
- `dist/mission4/drills-dth.mjs`: deploying DTH now makes it assigned and staged, **not automatically producing**. `dist/mission4/maintenance.mjs` starts actual DTH state when DrillTruck maintenance completes and zone begins production.
- `dist/mission4/mission4-state.mjs`: once automation objective 4 is completed, returning DrillTruck doesn't erase the completed link check.
- `dist/chapter/game.mjs`: narrow event/view/3D hooks, live refresh of M4 screens, descriptive delivery/deployment notifications, M4 HUD shared readout. Existing M1–M3 mission/economy/contract logic untouched.
- Scoped M4 UI CSS added to `dist/chapter/hud-reference-v4.css`, no global phone reflow.
- Future M5 design concept and strict HSEC/access requirements in `design/M5_PATIO_MAQUINARIA_PROPOSAL.md`; **no M5 gameplay wired, no accidental costs or scoring**.

## Real code tests executed
- All modified source modules V8 syntax pass and CSS brace balance zero.
- Isolated execution of real (not rewritten) mission4 modules in V8 with dependency injection, sequence:
  M4 initial 2/11, receive DTH 3/11, install PUMA hammer+bit 5/11, deploy to converted zone 6/11 (DTH idle, maintenance pending), hire technical service + link DrillTruck 9/11, complete service 10/11 (DTH and zone producing, truck parked), tick actual 900s production → income event, phase complete, 11/11. All assertions pass. Minimum 61,100, remaining 53,100 at L2 and without DTH items.
- New Node regression file tests the same end-to-end flow, pricing, actual UI route identifiers and 3D visibility code. Node/browser WebGL not executed here.
- Additional QA required: real mobile phone scroll, 3D staging placement relative to existing buildings, audio when production begins, actual production deployment. Do NOT claim production quality without device review.

## Release / collaboration
- GitHub feature branch `chatgpt/m4-operations-audit-v24`.
- Shared/Claude-owned functional exceptions explicitly coordinated under the user's direct implementation request; no unauthorized brand names, retroactive demolition, grants, mission reward changes, or fake equipment purchases.
- Production merge only with established release authorization and deployment-commit verification.

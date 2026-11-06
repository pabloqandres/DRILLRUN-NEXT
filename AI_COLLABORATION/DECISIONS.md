# Decisions Log — DRILL RUN NEXT GENERATION

## 2026-11-06 — Narrative Reward Deferral (Claude Code)

**Decision:** Mission rewards (M1: 5,000 cash, M2: 35,000 cash + booster) are no longer given immediately upon objective completion. Instead, they are deferred to narrative `confirmCompletion()`, triggered when the player reads the end-of-mission message and presses the confirm button.

**Rationale:** Creates a story-driven experience where rewards feel earned through character interaction rather than appearing automatically. The player must engage with the phone's message system to receive rewards.

**Impact:** `useOfficeComputer()` in state.mjs and `tickHsec()` in hsec/state.mjs no longer directly add cash/boosters. The narrative system handles reward delivery.

## 2026-11-06 — Mission Gating via Narrative (Claude Code)

**Decision:** M3 and M4 auto-start now requires `isMissionAccepted(s, 'mX')` to be true. Players must accept the mission via the narrative message before the mission systems activate.

**Rationale:** Prevents missions from starting before the player has context from the character's briefing message.

**Impact:** `game.mjs` mission start conditions now include narrative acceptance checks.

## 2026-11-06 — Road System: Option B (Claude Code + User)

**Decision:** Use predefined snap routes instead of a free waypoint editor for the road system.

**Rationale:** User-approved decision for simpler, more guided road placement.

## 2026-11-06 — AI Collaboration Structure (Claude Code + User)

**Decision:** Established dual-agent collaboration framework: Claude Code handles functional development, ChatGPT handles visual development. Shared files require coordination via DECISIONS.md.

**Rationale:** Clear ownership boundaries prevent merge conflicts and ensure each agent works within their expertise.

## 2026-11-06 — First ChatGPT Catalog V2 visual pass (User + ChatGPT)

**Decision:** Implement the user's approved visual language on the existing in-game Catalog using CSS-only presentation changes on branch `chatgpt/catalog-v2-visual-first-pass`. Prefer a full-width bottom carousel with category pills, a vertical Catalog identity rail, premium dark/cyan/gold cards and a contextual floating purchase/inspection surface. Preserve the real game renderer as the protagonist.

**Scope:** `dist/chapter/catalog.css` only for application code. Functional JavaScript, purchase events, prices, availability, missions, saves, navigation IDs, source data and the construction hologram behavior remain unchanged. No new product images or fictitious catalogue data. Responsive landscape layout and collapse states must remain usable.

**Integration:** Preview first; merge/deploy to production only after visual review/authorization.

## 2026-11-06 — Use main/production for DRILL RUN game testing (User approval)

**Decision:** The user explicitly chose `main` and the existing Vercel production domain for ongoing iterative tests, rather than temporary preview origins. This preserves browser-origin local save continuity and avoids temporary preview domains failing Firebase OAuth authorized-domain checks. User is the only active tester at this stage.

**Constraints:** Feature work still uses documented branches and commits, then merges to `main` for release after authorization. Verify effects of changes and avoid replacing save data; keep ability to roll back. **Production does not by itself create a Firebase session;** Google login must be functional on the stable domain. Current approval specifically covers deploying the Catalog V2 visual pass via PR #2 to main. No unreviewed gameplay or state migrations are authorized.

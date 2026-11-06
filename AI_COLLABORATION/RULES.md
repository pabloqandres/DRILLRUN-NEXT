# DRILL RUN NEXT GENERATION — AI Collaboration Rules

## Agents

| Agent | Role | Entry Point |
|-------|------|-------------|
| **Claude Code** | Functional development: game logic, state, systems, economy, missions, save/restore, i18n, build | `CLAUDE.md` |
| **ChatGPT** | Visual development: 3D assets, shaders, CSS polish, animations, camera, UI visual design | `AGENTS.md` |

## Golden Rules

1. **Never modify files owned by the other agent** without explicit coordination documented in `DECISIONS.md`.
2. **Always read `CURRENT_STATE.md`** before starting any work session.
3. **Always update `ACTIVE_WORK.md`** when starting or finishing a task.
4. **Log every change** in `CHANGELOG.md` and create a file in `CHANGES/` for significant changes.
5. **No gameplay, economy, or visual changes** during infrastructure or collaboration setup tasks.
6. **Branch naming:**
   - Claude Code: `claude/<feature-name>`
   - ChatGPT: `chatgpt/<feature-name>`
   - Shared/reviewed: `collab/<feature-name>`
7. **Conflict resolution:** If both agents need to modify a shared file, document the plan in `DECISIONS.md` first. The agent who owns the file makes the edit; the other provides the spec.
8. **Shared files** (files both agents may touch) require a note in `COMPONENT_OWNERSHIP.md` and extra care.
9. **CSS/shared ownership:** `COMPONENT_OWNERSHIP.md` governs each file. For a shared CSS file such as `premium.css`, modify only the agreed section and preserve the other agent's functional or visual rules. Coordinate cross-cutting changes in `DECISIONS.md`.
10. **Testing:** Test changes on the feature branch or preview **before** merging. Run post-merge smoke checks on `main` only after the approved merge.
11. **Release gate:** Never merge to `main`, deploy to production, or change production configuration without explicit user authorization. A successful build/READY status is not authorization.
12. **Record provenance:** Each significant change documents files, scope, checks actually performed, and commit/PR references; do not claim tests passed unless executed.
13. **One source of truth:** GitHub repository is the source of code; Vercel is the deployment target. Confirm deployment source and commit rather than assuming automatic Git deployment.

## Communication Protocol

1. Before starting work: sync the remote branch; read `RULES.md`, `CURRENT_STATE.md`, `ACTIVE_WORK.md`, `COMPONENT_OWNERSHIP.md`, `CHANGELOG.md`, and relevant `CHANGES/` records
2. During work: update `ACTIVE_WORK.md` with current task
3. After work: update `CHANGELOG.md` and `CHANGES/`, update `CURRENT_STATE.md` when its confirmed status changed, and mark the task completed or awaiting review in `ACTIVE_WORK.md`
4. For cross-agent dependencies: document in `DECISIONS.md` with date and both agents' names

## Sync Procedure

When switching between agents:
1. Committing agent commits/pushes changes to a feature branch and opens a pull request
2. Committing agent records the change in `CHANGELOG.md`, `CHANGES/`, and applicable state/decision files
3. Receiving agent pulls latest `main` and the relevant feature branch, checks the diff and active work
4. Merging and production deployment require user approval; after approved merge, update the confirmed state

## File Locking (Soft)

If an agent is actively editing a file, they note it in `ACTIVE_WORK.md` under "Files in progress." The other agent must not edit those files until cleared.

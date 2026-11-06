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
9. **CSS ownership:** Each agent owns specific CSS files. Never add rules to the other agent's CSS files.
10. **Testing:** Each agent tests their own changes before committing. Integration testing is done on `main`.

## Communication Protocol

1. Before starting work: read `CURRENT_STATE.md`, `ACTIVE_WORK.md`, `CHANGELOG.md`
2. During work: update `ACTIVE_WORK.md` with current task
3. After work: update `CHANGELOG.md`, `CURRENT_STATE.md`, clear task from `ACTIVE_WORK.md`
4. For cross-agent dependencies: document in `DECISIONS.md` with date and both agents' names

## Sync Procedure

When switching between agents:
1. Committing agent pushes all changes to their branch
2. Committing agent updates `CURRENT_STATE.md` and `CHANGELOG.md`
3. Receiving agent pulls latest `main` (or the relevant branch)
4. Receiving agent reads `CURRENT_STATE.md` before starting

## File Locking (Soft)

If an agent is actively editing a file, they note it in `ACTIVE_WORK.md` under "Files in progress." The other agent must not edit those files until cleared.

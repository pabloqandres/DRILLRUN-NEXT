# Change: Collaboration protocol safety audit

**Date:** 2026-11-06
**Agent:** ChatGPT
**Type:** Documentation only
**Branch:** `chatgpt/collaboration-protocol-hardening`
**State:** Awaiting pull request review and approval; not merged into `main`

## Goal

Reconcile existing collaboration instructions with the user's requirement that Claude Code owns functional logic and ChatGPT owns aesthetics, while preventing accidental changes on main or production.

## Repository observations

- At audit start, GitHub main was `8f3c434864845bc664995358296455c62c412c0e` and already contained the shared documentation.
- Vercel project `drillrun-builder-lab-v22` latest checked production deployment was READY, sourced from CLI, and had GitHub commit metadata for `3e36fe3a7d22fc09beb3d522d52aef2118a4f86d`. Automatic Git deployments were not verified.
- Original README introduction described an earlier development snapshot. The documentation now flags that text as historical.

## Changes

- `CLAUDE.md` / `AGENTS.md`: explicitly require consulting RULES, ownership, active work, changelog and relevant records; add PR and release gates.
- `AI_COLLABORATION/RULES.md`: clarify shared CSS ownership, testing on feature branches, production authorization, and records with verifiable provenance.
- `AI_COLLABORATION/CURRENT_STATE.md`: record verified deployment source and uncertainty; avoid claiming the most recent GitHub head is live.
- `README.md`: add status notice and point to authoritative state docs.
- `AI_COLLABORATION/CHANGELOG.md`, `AI_COLLABORATION/ACTIVE_WORK.md`: record this audit for Claude.
- This detailed change report.

## Files deliberately not touched

All game runtime files under `dist/`, game economy, mission logic, save state, models, material/rendering files, Vercel project settings, `vercel.json`, and GitHub `main`.

## Checks

- Read-only inspection of GitHub repository files, commit history and collaboration docs.
- Read-only check of Vercel project and deployment provenance.
- GitHub branch file writes with pre-existing blob SHAs.
- No application build, browser gameplay test or production deploy. Documentation change only.

## Follow-up upon approval

- Review and merge PR into `main` following the established release rules.
- Confirm GitHub-to-Vercel integration settings separately before relying on automatic deployments.
- Update `ACTIVE_WORK.md` after merge to mark this documentation task completed.

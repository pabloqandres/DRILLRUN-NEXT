# Change: Avatar 02/03/04 Intro Videos

**Date:** 2026-11-07
**Agent:** Claude Code
**Type:** Feature (additive)
**PR:** #35 (merged), supersedes #33

## Summary

Added dedicated intro cinematic videos for avatars 2, 3, and 4. Previously Avatar 3 fell back to Avatar 1's shared video; now all four avatars have their own intro film using the same CinematicDirector player.

## Files Added

- `dist/cinematics/avatar02-intro.mp4` — 4.8 MB, H.264
- `dist/cinematics/avatar03-intro.mp4` — 15 MB, H.264
- `dist/cinematics/avatar04-intro.mp4` — 14 MB, H.264

## Files Modified

- `dist/chapter/config.mjs` — `AVATAR_INTRO_VIDEOS.operator03` changed from `null` to `'./cinematics/avatar03-intro.mp4'`; comment updated
- `tests/new-game-stability.test.mjs` — Test now expects Avatar 3 with dedicated video and `sharedIntro: false`

## Verification

- `new-game-stability.test.mjs`: 15/15 pass
- All 4 MP4s return HTTP 200 on Vercel production
- Deployment ID: `dpl_7utw3MPTofuibqqBKbamztafD4RM`

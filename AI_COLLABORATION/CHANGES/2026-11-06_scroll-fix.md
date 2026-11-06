# Change: Touch Scroll Fix

**Date:** 2026-11-06
**Agent:** Claude Code
**Type:** Bug fix

## Summary

Fixed touch scrolling being broken across the entire game on touch devices.

## Root Cause

`body { touch-action: none }` in `style.css` blocks all native touch scrolling. Scrollable containers did not override this with their own `touch-action` value, so no panel could scroll via touch.

## Fix

Added `touch-action: pan-y` (vertical scroll) or `touch-action: pan-x` (horizontal scroll) to every scrollable container:

- `dist/chapter/premium.css` — `#phoneContent`, `#modalCard`, `.catalogRail`, `.productInfo`
- `dist/chapter/premium-v2.css` — `#objectiveDetail`
- `dist/chapter/builder-refresh.css` — `.builderCategories`, `.moduleCards`, `.hsecItems`
- `dist/chapter/catalog.css` — `.catalogCategories`, `.catalogSummary`, `.catalogInlineDetails`
- `dist/hsec/hsec.css` — `#chapterQA`, `.hsecCatalog .moduleCards`, `.hsecTabs`

# Design System — DRILL RUN NEXT GENERATION

## Color Palette

### Primary UI
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-deep` | `#081c2e` | Modal/panel backgrounds |
| `--bg-card` | `#0f2840` | Card backgrounds |
| `--border-primary` | `#5ab8e8` | Active borders, highlights |
| `--border-subtle` | `#36566a` | Default borders |
| `--text-primary` | `#f8fbff` | Main text |
| `--text-secondary` | `#9dbaca` | Secondary text, labels |
| `--text-muted` | `#7ea8bd` | Hints, placeholders |

### Accents
| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#ffc83d` / `#ffd960` | Rewards, scores, primary CTA |
| Cyan | `#5cdbff` / `#2cdcf1` | Selected states, progress bars |
| Green | `#40e4a3` | Success, completed states |
| Red | `#ff756c` | Risks, errors, warnings |
| Orange | `#ffbd24` | Warning states |

### Character Colors
| Character | Color | CSS Variable |
|-----------|-------|-------------|
| Elena Torres (benefactor) | `#f6c56d` (gold) | `--char-benefactor` |
| Marco Salazar (safetySpecialist) | `#8bd9cf` (mint) | `--char-safety` |
| Camila Reyes (contractAdmin) | `#e8a87c` (warm) | `--char-contract` |

## Typography

- **Primary font:** System font stack (no custom fonts loaded)
- **Numeric display:** `font-variant-numeric: tabular-nums` for all numeric values
- **Score display:** Gradient text (`background-clip: text`) gold gradient
- **Labels/Eyebrows:** `font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5b9bb7`

## Spacing & Layout

- **Border radius:** 9-12px for cards/panels, 7-9px for buttons, 15px for avatars
- **Padding:** 13-14px for cards, 9-14px for buttons, 20-24px for modals
- **Gap:** 6-8px tight, 12-15px standard, 18-20px spacious
- **Modal max width:** `min(850px, 88vw)`

## Gradients

- **Panel background:** `linear-gradient(155deg, #0c2640f8, #081c2ef5)`
- **Button default:** `linear-gradient(180deg, #1e4258, #18364a)`
- **Button selected:** `linear-gradient(180deg, #1a4a68, #15385a)`
- **Card background:** `linear-gradient(155deg, #0f2840dd, #0a1e30dd)`
- **Primary CTA:** `linear-gradient(180deg, #ffe58b, #f6bc37)` (gold)
- **Risk card:** `linear-gradient(135deg, #3a1a1a55, #2a0e0e55)`
- **Success card:** `linear-gradient(135deg, #1a3a28, #142d1e)`

## Shadows & Effects

- **Panel shadow:** `0 20px 80px #031220cc, 0 0 30px #2ba8e31a`
- **Card shadow:** `0 2px 8px #04122033`
- **Glow effect:** `0 0 10px <color>22` (subtle), `0 0 16px <color>55` (hover)
- **Backdrop filter:** `blur(10px)` on modals
- **Inset highlight:** `inset 0 1px #c8ecff44` on panels, `inset 0 1px #fff9` on gold buttons

## Transitions

- **Default:** `0.2s` for borders, backgrounds, shadows
- **Slow:** `0.3s` for border-color + box-shadow on HUD elements
- **Animations:** `ease-in-out` for pulses, `ease` for typing cursor blink

## Touch Targets

- **Minimum button height:** 42px (35px on short screens `max-height: 450px`)
- **Touch action:** `pan-y` for vertical scrollables, `pan-x` for horizontal scrollables
- **Safe area:** `env(safe-area-inset-bottom)` for bottom-positioned elements

## Responsive Breakpoints

- `max-height: 450px` — Compact vertical layout (reduced font sizes, padding, heights)
- `max-width: 580px` — Mobile width (single column categories, wrapped controls)

## Icons

- **UI icons:** Inline SVG, 20-26px, `currentColor` stroke
- **Character avatars:** 36px colored circle + role SVG icon (briefcase, shield, clipboard)
- **HSEC icons:** 18-26px, category-colored stroke with drop-shadow

## Component Patterns

### HUD element
```css
background: linear-gradient(160deg, #16364bea, #071722ed);
border: 1px solid #5b9bb7;
border-radius: 10px;
box-shadow: 0 4px 16px #00101966, inset 0 1px #e0f5ff20;
```

### Modal
```css
background: linear-gradient(155deg, #0c2640f8, #081c2ef5);
border: 1px solid #5ab8e8aa;
border-radius: 18px;
box-shadow: 0 20px 80px #031220cc, 0 0 30px #2ba8e31a, inset 0 1px #c8ecff44;
backdrop-filter: blur(10px);
```

### Action button (gold primary)
```css
background: linear-gradient(180deg, #ffe58b, #f6bc37);
color: #152332;
border-color: #fff0aa;
font-weight: 750;
box-shadow: inset 0 1px #fff9, 0 0 14px #ffc83d44;
```

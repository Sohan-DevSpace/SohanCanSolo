---
name: Alpona Design System
description: The Editorial Atelier — A premium fashion-magazine editorial design system for Alpona.
colors:
  primary: "#1A1A1A"
  primary-foreground: "#FFFFFF"
  background: "#FAF7F4"
  secondary: "#F5F1EC"
  muted-foreground: "#8A8580"
  border: "#E8E2DB"
  ring: "#B8763C"
  destructive: "#C53030"
typography:
  display:
    fontFamily: "var(--font-cormorant), Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-manrope), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-manrope), sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
  micro:
    fontFamily: "var(--font-manrope), sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "#2A2A2A"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-secondary-hover:
    backgroundColor: "#E8E2DB"
---

# Design System: Alpona

## 1. Overview

**Creative North Star: "The Editorial Atelier"**

Alpona's visual system is a sophisticated, editorial streetwear presentation designed to feel like an expensive print magazine or a luxury boutique workshop. Density is light to medium, allowing generous whitespace (using the Warm Linen background) to establish restraint and focus attention on custom-designed apparel.

Depth is flat by default, utilizing soft matte shadows instead of heavy, dark blurs. Interactive elements transition smoothly with custom easing curves that make user feedback feel tactile and physical.

**Key Characteristics:**
- Warm monochrome canvas with elegant bronze highlights
- Elegant Cormorant serif headers contrasted against clean, modern Manrope body copy
- Generous whitespace to frame clothing imagery
- Subtle matte shadows that respond only to user hover actions

---

## 2. Colors

The color palette is anchored in a warm monochrome scale, accented by a rich bronze/amber tone.

### Primary
- **Matte Charcoal** (#1A1A1A): Used for primary text, solid buttons, headers, and major layout elements.

### Secondary
- **Warm Linen** (#FAF7F4): The main background color, tinting the canvas to feel organic, premium, and warm.
- **Soft Alabaster** (#F5F1EC): Used for cards, secondary buttons, input fields, and block quote fills.
- **Muted Earth** (#8A8580): Used for secondary body text, captions, metadata, and placeholder text.
- **Sandstone Border** (#E8E2DB): Used for borders, divider lines, and container outlines.

### Accent
- **Bronze Amber** (#B8763C): Used as a rare accent for active rings, selection highlights, success badges, and focus rings.

### Named Rules
**The 10% Accent Rule.** The Bronze Amber accent must be used on ≤10% of any given viewport. Its infrequency is key to its premium appeal.
**The Tinted Border Rule.** Divider lines and borders must never be solid black or pure gray. They must use Sandstone Border (#E8E2DB) to blend softly with the Warm Linen background.

---

## 3. Typography

**Display Font:** Cormorant (with Georgia, serif fallback)
**Body Font:** Manrope (with system-ui, sans-serif fallback)

### Hierarchy
- **Display** (Bold (700), clamp(2.5rem, 7vw, 4.5rem), 1.1): Used for large hero H1 headlines only. Letter spacing is locked at -0.02em.
- **Headline** (Bold (700), 28px to 40px, 1.15): Used for H2 section titles.
- **Title** (Medium (500), 16px to 20px, 1.2): Used for cards, subheadings, and menus.
- **Body** (Regular (400), 14px (0.875rem), 1.5): Used for general content, descriptions, and lists. Line length is capped at 75ch.
- **Label** (Bold (700), 12px, 0.05em, uppercase): Used for small badges, tags, and helper text.
- **Micro** (Bold (700), 10px, 0.05em, uppercase): Used for micro labels, badge counts, and illustration details.

---

## 4. Elevation

The system is flat-by-default, utilizing soft matte shadows to raise components off the canvas upon hover or active state.

### Shadow Vocabulary
- **Matte XS** (`box-shadow: 0 1px 2px rgba(0,0,0,0.03)`): Used on primary buttons and cards at rest.
- **Matte SM** (`box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)`): Used on select fields and dropdown anchors.
- **Matte MD** (`box-shadow: 0 4px 16px -2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)`): Used for hovered cards and dropdown menus.
- **Matte LG** (`box-shadow: 0 12px 40px -8px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`): Used for overlays, modals, and slide-over sheets.

### Named Rules
**The Flat-at-Rest Rule.** Buttons and cards remain flat or use minimal shadows at rest. Elevation is a dynamic response to user interactions (e.g. hover).

---

## 5. Components

### Buttons
- **Shape:** Rounded corners (8px radius).
- **Primary:** Solid Matte Charcoal background, white text, 8px vertical and 20px horizontal padding.
- **Secondary:** Soft Alabaster background, Matte Charcoal text, 8px vertical and 20px horizontal padding.
- **Hover:** Primary shifts to `#2A2A2A` and secondary shifts to `#E8E2DB` with a 200ms cubic-bezier transition.

### Cards
- **Corner Style:** Rounded corners (12px radius).
- **Background:** Solid white (`#FFFFFF`) to stand out from the Warm Linen background.
- **Border:** Sandstone Border (`#E8E2DB/60`).
- **Internal Padding:** 16px spacing (`--spacing(4)`).

### Inputs
- **Style:** Sandstone Border stroke, white or Soft Alabaster background, rounded corners (8px radius).
- **Focus:** Border transitions to Bronze Amber (`#B8763C`) with an offset ring outline.

---

## 6. Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 contrast ratio for body copy against the Warm Linen background.
- **Do** use `text-wrap: balance` on H1 to H3 display titles to prevent awkward wrapping.
- **Do** use custom cubic-bezier easings (such as `ease-out-expo`) for motion reveals and transitions.

### Don't:
- **Don't** use generic SaaS/tech accents like flat blue links, neon gradient text, or card-within-card containers.
- **Don't** use cheap print-on-demand layouts with cluttered grids, clip-art iconography, or overly thick shadows.
- **Don't** use side-stripe borders (border-left or border-right > 1px) to emphasize cards or info blocks.
- **Don't** round cards or buttons past 16px, avoiding the childish "bubble" appearance.

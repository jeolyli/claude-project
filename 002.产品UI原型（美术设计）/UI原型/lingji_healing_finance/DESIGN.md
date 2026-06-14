---
name: LingJi Healing Finance
colors:
  surface: '#fff8f8'
  surface-dim: '#eed3dc'
  surface-bright: '#fff8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f4'
  surface-container: '#ffe8ef'
  surface-container-high: '#fde1ea'
  surface-container-highest: '#f7dbe5'
  on-surface: '#26171e'
  on-surface-variant: '#554245'
  inverse-surface: '#3d2c33'
  inverse-on-surface: '#ffecf1'
  outline: '#887175'
  outline-variant: '#dbc0c4'
  surface-tint: '#a03a57'
  primary: '#a03a57'
  on-primary: '#ffffff'
  primary-container: '#ff85a2'
  on-primary-container: '#771a38'
  inverse-primary: '#ffb1c1'
  secondary: '#884c5d'
  on-secondary: '#ffffff'
  secondary-container: '#fdb2c5'
  on-secondary-container: '#7a4151'
  tertiary: '#8d4d38'
  on-tertiary: '#ffffff'
  tertiary-container: '#e7977e'
  on-tertiary-container: '#672f1c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c1'
  on-primary-fixed: '#3f0017'
  on-primary-fixed-variant: '#812240'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#fdb2c5'
  on-secondary-fixed: '#370a1b'
  on-secondary-fixed-variant: '#6c3546'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#390c01'
  on-tertiary-fixed-variant: '#713623'
  background: '#fff8f8'
  on-background: '#26171e'
  surface-variant: '#f7dbe5'
  surface-pink: '#FBF5F7'
  bg-soft: '#FFEEF2'
  accent-coral: '#FF7B89'
  accent-mint: '#A8D8CA'
  accent-lavender: '#C5A3D9'
  chart-transport: '#9EB7D4'
  chart-education: '#F9E4B7'
  chart-housing: '#F0D5BE'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-numeric:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The brand personality is **warm, healing, and approachable**, designed to transform the often-stressful task of expense tracking into a moment of "micro-healing." It targets individuals who find traditional finance apps cold or intimidating, offering instead a "Kawaii" companion through the mascot **Ling Ling**.

The design style is a blend of **Minimalism** and **Soft-Tactile Modernism**. It utilizes heavy whitespace and a refined color palette to maintain professional utility, while employing oversized border radii and soft, tinted shadows to create a "squishy," friendly interface. The visual narrative moves away from corporate rigidity toward a gentle, organic aesthetic that feels safe and supportive.

**Key Visual Principles:**
- **Softness over Strictness:** No sharp corners; every element must feel touchable and safe.
- **Atmospheric Depth:** Use of pink-tinted blurs and shadows instead of grey to maintain a "warm glow" across the UI.
- **Emotional Feedback:** Celebratory micro-interactions (petals, hearts) to reward positive financial habits.

## Colors

The color system is rooted in **Sakura Pink**, moving away from the "financial green/red" trope to reduce anxiety. 

- **Primary & Secondary:** Used for brand expression, active states, and primary actions. Use gradients (135deg) between these two for high-emphasis buttons.
- **Accent (Peach/Coral/Mint):** Used for semantic signaling. **Peach** (#FFAB91) represents income/growth, while **Mint** (#A8D8CA) indicates budget health. **Coral** (#FF7B89) is reserved for warnings and over-budget states.
- **Neutral:** The primary text color is a **Dark Purple-Grey** (#3D2C33) rather than black, ensuring high legibility while maintaining the warm temperature of the palette.
- **Surfaces:** Cards should use **Soft White** (#FBF5F7) to distinguish them from the global **Background** (#FFEEF2).

## Typography

The typography system prioritizes warmth and clarity. **Plus Jakarta Sans** is used for headings and numeric data to provide a modern, slightly rounded geometric feel that complements the "Kawaii" aesthetic. **Be Vietnam Pro** is used for body text and labels for its friendly, approachable character.

**Special Instructions:**
- **Financial Data:** All currency displays must use **Tabular Nums** (`tnum`) to ensure vertical alignment in lists and reports.
- **Hierarchy:** Use the Dark Purple-Grey (#3D2C33) for headlines and Primary Pink (#FF85A2) for emphasized amounts. Secondary text should use #6B5B63 (Neutral-700).

## Layout & Spacing

This design system employs a **8px soft grid** to ensure consistent rhythm. The layout philosophy is **fluid-within-fixed**, where content containers have maximum widths on desktop but stretch with safe margins on mobile.

- **Padding:** Standard cards use `16px` (md) internal padding. 
- **Margins:** Screen edges maintain a `20px` margin to feel spacious and "breathable."
- **Stacking:** Elements within a card (e.g., icon and text) should use `12px` (sm) spacing.
- **Mobile-First:** The UI is optimized for one-handed use, placing primary entry points (like the "Add Expense" button) in the bottom-center "thumb zone."

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Pink Shadows**. Instead of traditional grey shadows, this system uses low-opacity shadows tinted with the primary brand color to create a "floating" effect that feels integrated into the warm environment.

- **Level 1 (Default Cards):** Used for bill items. Subtle shadow: `0 2px 8px rgba(255,133,162,0.10)`.
- **Level 2 (Popovers/Active):** Used for navigation bars and dropdowns. `0 4px 16px rgba(255,133,162,0.15)`.
- **Level 3 (Modals):** High depth for critical focus. `0 8px 32px rgba(255,133,162,0.20)`.

Avoid high-contrast borders. Use subtle, 1px borders in Neutral-200 (#E8DCE1) only when elements need additional separation from the background.

## Shapes

The shape language is defined by a **"No Sharp Edges"** policy. The core of the system is the **Rounded (Level 2)** setting, but it extends to **Pill-shaped (Level 3)** for high-action components.

- **Standard Buttons:** Always use a capsule/pill shape (Radius: 24px+).
- **Primary Cards:** Radius of 20px for large dashboard panels.
- **Secondary Cards/List Items:** Radius of 16px.
- **Input Fields:** Radius of 12px for a softer, more modern look than standard inputs.

## Components

### Buttons
- **Primary:** Pill-shaped with a 135-degree gradient from Primary-400 to Primary-300. Use white text and a Level 2 pink shadow.
- **Secondary:** Ghost-style with a Primary-400 border and Primary-50 background.

### Cards
- Always use the **Surface Pink** (#FBF5F7) color.
- Corner radius should be 16px or 20px depending on nesting.
- Include a Level 1 shadow to separate from the global background.

### Input Fields
- Background should be white or Neutral-50.
- 12px corner radius.
- On focus, the border transitions to Primary-400 with a soft glow effect.

### Chips & Tags
- Use for categories (Dining, Shopping).
- Backgrounds should be light tints (10% opacity) of the category color with matching colored text.
- Radius: Pill (100px).

### The Mascot (Ling Ling)
- **Empty States:** Ling Ling looking into an empty wallet or sleeping.
- **Success States:** Ling Ling cheering with hearts.
- **Loading:** Ling Ling bouncing or chasing a floating petal.
# Design

## Brand & Style

The **Casa Flora** design system is rooted in the warmth, heritage, and rich traditions of Colombian culture, interpreted through a modern, tactile, and editorial digital experience.

The core identity, **"Heritage Hearth"**, balances artisanal tradition with contemporary elegance. Rather than relying on cold or generic neutrals, the aesthetic is anchored in warm beige surfaces, deep red wine, roasted coffee tones, warm gold, and earthy terracotta. The interface evokes the welcoming hospitality of a traditional Colombian home, combining generous breathing room with refined typography and subtle depth.

The design is built with a strict **Mobile-First** approach, offering an intuitive, touch-friendly mobile layout that progressively enhances into an expansive, editorial presentation on larger screens.

---

## Colors

The color palette is divided into foundational base tokens and adaptive semantic variables. The default interface is **Light Mode**, with a complementary **Dark Mode** enabled via the `.dark` class.

### Semantic Tokens (Light Mode - Default)

| Token | Variable | Value / Reference | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#fff8f6` (`--base-bg-beige`) | Warm, inviting base canvas |
| **Background Alt** | `--background-alt` | `#f8f4ec` (`--base-bg-warm`) | Secondary warm section backgrounds |
| **Surface** | `--surface` | `#ffffff` (`--base-surface-white`) | Clean card and container surface |
| **Foreground** | `--foreground` | `#261814` (`--base-on-bg`) | High-contrast deep coffee text |
| **Foreground Muted** | `--foreground-muted` | `#887272` (`--base-outline`) | Subdued text, metadata, and borders |
| **Primary** | `--primary` | `#4b030f` (`--base-primary`) | Brand signature Red Wine / Vino |
| **Primary Foreground** | `--primary-foreground`| `#ffffff` (`--base-white`) | Text on primary elements |
| **Secondary** | `--secondary` | `#bc8e56` (`--base-secondary-btn`)| Warm Gold for accents, highlights & badges |
| **Secondary Foreground** | `--secondary-foreground` | `#2b1d19` (`--base-text-btn`) | Dark text on gold elements |
| **Accent** | `--accent` | `#ad5d4e` (`--base-tertiary-btn`) | Terracotta warmth for badges & secondary CTAs |
| **Accent Foreground** | `--accent-foreground` | `#ffffff` (`--base-white`) | Text on accent elements |
| **Destructive** | `--destructive` | `#ba1a1a` (`--base-error`) | Error messages and validation states |
| **Border** | `--border` | `#887272` (`--base-outline`) | Structural borders and outlines |

### Dark Mode Tokens (`.dark`)

When `.dark` is applied to the root element, colors adapt to an intimate, nocturnal coffeehouse atmosphere:

| Token | Variable | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#1a110f` (`--base-cocoa-900`) | Deep roasted cocoa background |
| **Background Alt** | `--background-alt` | `#3c2d28` (`--base-inverse-surface`) | Warm dark brown section surface |
| **Surface** | `--surface` | `#2c1e1a` (`--base-cocoa-800`) | Elevated dark cocoa card containers |
| **Foreground** | `--foreground` | `#fff8f6` (`--base-bg-beige`) | Soft beige high-contrast text |
| **Foreground Muted** | `--foreground-muted` | `#eed5ce` (`--base-surface-dim`) | Dim terracotta-tinted secondary text |
| **Primary** | `--primary` | `#8a1f2d` (`--base-wine-light`) | Luminous wine for visibility on dark base |
| **Primary Foreground** | `--primary-foreground`| `#fff8f6` (`--base-bg-beige`) | Warm beige text on primary elements |
| **Secondary** | `--secondary` | `#bc8e56` (`--base-secondary-btn`)| Persistent gold accent |
| **Secondary Foreground** | `--secondary-foreground` | `#1a110f` (`--base-cocoa-900`) | Dark text on secondary highlights |
| **Accent** | `--accent` | `#ad5d4e` (`--base-tertiary-btn`) | Terracotta highlight |
| **Border** | `--border` | `#554242` (`--base-on-bg-variant`)| Low-contrast warm dark borders |

---

## Typography

The typographic hierarchy blends a classic high-contrast serif for headings with a legible, humanist sans-serif for UI and body text.

- **Headlines & Display:** `Playfair Display`, serif (`--font-display`). Imparts artisanal elegance, editorial flair, and culinary tradition.
- **Body & Interface:** `Nunito Sans`, sans-serif (`--font-body`). Features soft humanist curves, excellent readability at small sizes, and friendly warmth.

### Type Scale

| Style | Size Token | Line Height Token | Computed Size | Computed Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Display Large** | `--text-display-lg-size` | `--text-display-lg-lh` | `3rem` (48px) | `3.5rem` (56px) |
| **Headline Large (Desktop)** | `--text-headline-lg-size` | `--text-headline-lg-lh` | `2rem` (32px) | `2.5rem` (40px) |
| **Headline Large (Mobile)** | `--text-headline-lg-mobile-size` | `--text-headline-lg-mobile-lh` | `2.75rem` (44px) | `2.25rem` (36px) |
| **Headline Medium** | `--text-headline-md-size` | `--text-headline-md-lh` | `1.5rem` (24px) | `2rem` (32px) |
| **Body Large** | `--text-body-lg-size` | `--text-body-lg-lh` | `1.125rem` (18px) | `1.75rem` (28px) |
| **Body Medium** | `--text-body-md-size` | `--text-body-md-lh` | `1rem` (16px) | `1.5rem` (24px) |
| **Label Large** | `--text-label-lg-size` | `--text-label-lg-lh` | `0.875rem` (14px) | `1.25rem` (20px) |
| **Label Small** | `--text-label-sm-size` | `--text-label-sm-lh` | `0.75rem` (12px) | `1rem` (16px) |

---

## Layout & Spacing

Layout adheres to an **8px Base Grid System** designed with a mobile-first responsive architecture.

### Spacing Tokens

- **Base Unit:** `--spacing-base: 0.5rem` (8px)
- **Gutter:** `--spacing-gutter: 1.5rem` (24px)
- **Mobile Margins:** `--spacing-margin-mobile: 1rem` (16px)
- **Desktop Margins:** `--spacing-margin-desktop: 2.5rem` (40px)
- **Max Container:** `--container-max: 75rem` (1200px)

### Responsive Breakpoints

1. **Mobile (< 768px):**
   - Single-column flowing layout with generous touch targets (minimum 44px).
   - Fixed top header (4rem height) with brand title and theme switch.
   - Fixed bottom navigation bar (`.bottom-navbar`, 5rem height) with safe-area inset support (`env(safe-area-inset-bottom)`).
   - Main content padded top (`4rem`) and bottom (`var(--spacing-gutter)`) to avoid occlusion.

2. **Tablet (≥ 768px):**
   - Margins expand to `--spacing-margin-desktop` (40px).
   - Desktop navigation links (`.desktop-nav-links`) appear in top header; bottom navigation bar is hidden (`display: none`).
   - Grid layouts expand to 2-column configurations.

3. **Desktop (≥ 1024px):**
   - Footer expands to a 4-column layout (`repeat(4, 1fr)`).
   - Content maxes out at `75rem` (1200px) centered horizontally.

---

## Elevation & Depth

Depth is conveyed through warm ambient shadows and frosted glass translucency rather than stark, cold drop shadows.

- **Ambient Shadow (Small):** `--shadow-ambient-sm: 0 2px 8px rgba(38, 24, 20, 0.04)`
  - Used for fixed headers and subtle resting card elevations.
- **Ambient Shadow (Medium):** `--shadow-ambient-md: 0 4px 16px rgba(38, 24, 20, 0.06)`
  - Used for interactive hover states, modals, and raised surfaces.
- **Bottom Navigation Shadow:** `0 -2px 10px rgba(43, 29, 25, 0.05)`
  - Upward ambient drop shadow anchoring mobile navigation.
- **Glassmorphism / Frosted Surfaces:**
  - Header uses `rgba(248, 244, 236, 0.95)` with `backdrop-filter: blur(12px)`.
  - In dark mode, adapts to `rgba(44, 30, 26, 0.95)`.

---

## Shapes

Organic and approachable forms reflect the hand-crafted nature of Colombian ceramics and gastronomy.

- **Small Radius (`--radius-sm`):** `0.25rem` (4px) — subtle rounding for small badges and inputs.
- **Default Radius (`--radius-default`):** `0.5rem` (8px) — standard for cards, form fields, and content boxes.
- **Medium Radius (`--radius-md`):** `0.75rem` (12px) — modals, selection tiles, and featured containers.
- **Large Radius (`--radius-lg`):** `1rem` (16px) — image containers and hero wrappers.
- **Extra Large Radius (`--radius-xl`):** `1.5rem` (24px) — navigation item pills and chips.
- **Full Radius (`--radius-full`):** `9999px` — pills, counter buttons, round action triggers.

---

## Motion & Transitions

- **Theme Transition:** Leverages the native View Transitions API (`::view-transition-new(root)` / `::view-transition-old(root)`) with a circular SVG mask expansion (`darkmode-scale 1s`) animated to `350vmax` using exponential easing curves (`--expo-in`, `--expo-out`).
- **Page Transitions:** View Transitions with animated exits (`scale(0.98) translateY(8px)`) and entrances (`scale(1.01) translateY(-12px)`) using smooth cubic-bezier easing (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Element State Transitions:** Global `0.4s ease` transitions on `background-color`, `color`, `border-color`, and `box-shadow` ensure theme shifts feel organic and seamless.
- **Interactive Micro-Interactions:** 
  - Buttons and interactive items scale on `:active` (`scale(0.95)` or `scale(0.9)`).
  - Desktop nav links feature an animated sliding underline (`::after` expanding from `0` to `100%` width in `0.3s ease`).
- **Hero & Content Reveal:** Staggered entrance via `.hero-animate` (`opacity: 0; transform: translateY(24px)`) transitioning to `.hero-visible` (`opacity: 1; transform: translateY(0)` in `0.7s ease`).

---

## Components

### 1. Header & Navigation
- **Fixed Header (`header`):** Translucent frosted background (`backdrop-filter: blur(12px)`) with `--shadow-ambient-sm`. Maintains `z-index: 50` at a fixed height of `4rem`.
- **Main Heading (`.main-heading`):** Styled in `Playfair Display` serif, colored with `--primary`, negative letter-spacing (`-0.02em`).
- **Theme Toggle Button:** Minimalist transparent button housing SVG sun/moon icons with active scale feedback (`scale(0.95)`).
- **Desktop Nav Links (`.desktop-nav-links`):** Displayed only on screens ≥ 768px. Links in `--foreground-muted` with sliding `--primary` underlines on hover and active states (`font-weight: 700`).

### 2. Mobile Bottom Navigation (`.bottom-navbar`)
- Fixed at viewport bottom on mobile (`< 768px`) with `z-index: 50`.
- Height of `5rem` with bottom padding conforming to `env(safe-area-inset-bottom)`.
- Nav links display vertically stacked icon and text label.
- Active state highlighted in `--primary` with a warm amber pill background (`rgba(255, 221, 184, 0.3)`).

### 3. Footer (`.main-footer`)
- Signature Red Wine background (`--primary`) with crisp white/light cream typography.
- Brand title in `Playfair Display` colored with `--secondary` (Gold).
- Category column headers in `--secondary` uppercase with tracking (`letter-spacing: 0.05em`).
- Responsive layout: 1 column on mobile, 2 columns on tablet (`≥ 768px`), and 4 columns on desktop (`≥ 1024px`).
- Bottom section separated by a translucent `1px` border (`rgba(255, 255, 255, 0.2)`).

### 4. Interactive Form Elements & Buttons
- **Primary Buttons:** High-contrast buttons utilizing `--primary` or `--secondary` with matching `--primary-foreground` / `--secondary-foreground`.
- **Hover & Focus States:** Gentle opacity shifts (`0.8`), scale-down tactile feedback (`scale(0.95)` or `scale(0.9)`), and clear outline rings on focus.
- **Form Validation:** Inline error indicators with high-visibility color (`--destructive: #ba1a1a`) positioned directly adjacent to invalidated input containers.
# Design System & Visual Specification (Pinky Rose Edition)
## Alumni Tracking System (Mezun Takip Sistemi)

[![Design System](https://img.shields.io/badge/Design%20System-Apple%20Minimalism%20%2B%20Pinky%20Rose-f43f5e.svg)](#-1-overview--design-philosophy)
[![Palette](https://img.shields.io/badge/Color%20Palette-Rose%20%2B%20Velvet%20Plum-e11d48.svg)](#-2-colors--pinky-rose-palette)
[![Typography](https://img.shields.io/badge/Typography-Plus%20Jakarta%20Sans%2017px-fb7185.svg)](#-3-typography-system)
[![Components](https://img.shields.io/badge/Components-Edge--to--Edge%20Tiles%20%2B%20Pills-ec4899.svg)](#-6-component-specifications)
[![Status](https://img.shields.io/badge/Specification-Living%20System%20v2.0-blueviolet.svg)](#)

---

## 🏛️ 1. Overview & Design Philosophy

This design system synthesizes **Apple’s masterclass in reverent, near-invisible UI framing** with a vibrant, high-fashion **Pinky Rose & Velvet Plum aesthetic** engineered specifically for the **Alumni Tracking System**.

Rather than cluttering pages with heavy decorative chrome, gradients, or excessive borders, the interface recedes to let the core artifacts speak: **distinguished alumni profiles, high-impact career vacancies, student success metrics, and community announcements**.

### Key Architectural Characteristics
* **Photography & Artifact First**: UI elements are quiet, purposeful pedestals for alumni achievements and career opportunities.
* **Alternating Full-Bleed Tile Sections**: Clean alternation between **Pure White / Rose Parchment** (`#ffffff` ↔ `#fdf5f7`) and **Deep Velvet Plum** (`#1a101e` ↔ `#221428`). The surface shift itself acts as the natural divider with zero noisy borders.
* **Refined Pinky Accent System**: All interactive energy is focused into an electric, sophisticated palette of **Rose Carmine (`#f43f5e`)**, **Deep Magenta (`#e11d48`)**, and **Glow Pink (`#fb7185`)**. No competing secondary brand color dilutes user attention.
* **Two Distinct Button Grammars**:
  1. Signature pill CTAs (`{rounded.pill}` — `9999px`) for high-conviction actions ("Apply Now", "Publish Job", "View Profile").
  2. Compact utility rectangles (`{rounded.sm}` — `8px`) for system controls, navigation pills, and table action bars.
* **Signature Editorial Typography**: Negative letter-spacing on display headlines (`-0.02em` tracking) creates a tight, confident voice, paired with a deliberate **17px body reading pace** for maximum comprehension.
* **Whisper-Soft Elevation**: Exactly one drop-shadow exists in the entire system (`rgba(225, 29, 72, 0.18) 3px 5px 30px`), reserved strictly for floating profile hero renders and elevated utility cards.
* **Slim Frosted Navigation**: Ultra-thin velvet global bar (`44px`) accompanied by a frosted glass sub-nav (`52px`, `backdrop-filter: blur(20px)`) with right-aligned persistent CTAs.

---

## 🎨 2. Colors — The Pinky Rose Palette

The color hierarchy balances luxurious dark velvet tones, light parchment contrast, and electric pink accents to maintain strict WCAG AAA readability.

```
       [PURE WHITE / ROSE PARCHMENT]      ↔      [DEEP VELVET PLUM]
            Canvas & Utility Cards                    Hero Canvas & Tiles
                      │                                       │
                      └──────────► [ACTION ROSE] ◄────────────┘
                                     #f43f5e
                               (Universal Signal)
```

### Brand & Interactive Accents (Pinky Signature)

| Token | Name | Hex Code | RGB | Role & Usage |
|---|---|---|---|---|
| `{colors.primary}` | **Action Rose** | `#f43f5e` | `rgb(244, 63, 94)` | The single brand interactive color. Used for all primary pill CTAs, active pagination, and text links. |
| `{colors.primary-hover}` | **Crimson Rose** | `#e11d48` | `rgb(225, 29, 72)` | Active and hover states for buttons and interactive badges. |
| `{colors.primary-focus}` | **Fuchsia Glow** | `#fb7185` | `rgb(251, 113, 133)` | Keyboard accessibility focus rings (`outline: 2px solid`) and selected chip borders. |
| `{colors.primary-on-dark}` | **Sky Rose Link** | `#fda4af` | `rgb(253, 164, 175)` | In-copy links on dark velvet tiles where standard Action Rose would lose contrast. |
| `{colors.accent-magenta}` | **Vivid Magenta** | `#ec4899` | `rgb(236, 72, 153)` | Subtle decorative highlight for badge gradients and review badges. |

### Canvas & Surface Layers

| Token | Name | Hex Code | RGB | Role & Usage |
|---|---|---|---|---|
| `{colors.canvas-white}` | **Pure White** | `#ffffff` | `rgb(255, 255, 255)` | Light-mode base, utility cards, application modal backgrounds. |
| `{colors.canvas-parchment}`| **Rose Parchment**| `#fdf5f7` | `rgb(253, 245, 247)` | The Apple-inspired signature off-white tinted with delicate rose. Used for alternating light tiles and footers. |
| `{colors.surface-pearl}` | **Blush Pearl** | `#fff1f4` | `rgb(255, 241, 244)` | Fill for secondary "ghost" pill buttons on parchment surfaces. |
| `{colors.surface-tile-1}` | **Dark Velvet 1** | `#1a101e` | `rgb(26, 16, 30)` | Primary dark tile background for hero showcases and high-impact announcements. |
| `{colors.surface-tile-2}` | **Dark Velvet 2** | `#221428` | `rgb(34, 20, 40)` | Micro-step lighter dark tile used directly adjacent to Tile 1 to create subtle section separation. |
| `{colors.surface-tile-3}` | **Dark Velvet 3** | `#140c17` | `rgb(20, 12, 23)` | Deepest void tone for global navigation and player frames. |
| `{colors.surface-abyss}` | **True Black** | `#000000` | `rgb(0, 0, 0)` | Reserved for edge-to-edge media overlays and global nav bar backdrop. |

### Text & Readable Ink

| Token | Name | Hex Code | Role & Usage |
|---|---|---|---|
| `{colors.ink}` | **Plum Ink** | `#180e1b` | Default text on light canvases. Near-black with a subtle plum undertone to prevent harshness. |
| `{colors.ink-muted}` | **Muted Plum** | `#736171` | Secondary descriptions, timestamps, subheaders on light surfaces. |
| `{colors.text-on-dark}` | **Pure Snow** | `#ffffff` | Headlines and titles on dark velvet tiles. |
| `{colors.text-on-dark-muted}` | **Soft Orchid** | `#d4c6d3` | Body and supporting paragraphs on dark velvet tiles. |
| `{colors.text-disabled}` | **Dusty Rose** | `#a3919e` | Disabled button states and legal fine print. |

### Hairlines & Dividers

| Token | Name | Value | Role & Usage |
|---|---|---|---|
| `{colors.hairline-light}` | **Rose Hairline** | `rgba(225, 29, 72, 0.12)` | Subtle 1px boundary on white utility cards and search inputs. |
| `{colors.hairline-dark}` | **Velvet Hairline** | `rgba(244, 63, 94, 0.18)` | 1px border on dark tile cards and frosted glass dividers. |

---

## 🔤 3. Typography System

Our typography combines the geometric precision of **Plus Jakarta Sans** (with fallback to **SF Pro Display / Text**) and the code readability of **JetBrains Mono**.

### Core Typographic Rules
1. **Negative Letter-Spacing on Headlines**: Headlines at `17px` and above carry tight tracking (`-0.02em` / `-0.28px` to `-0.374px`) to replicate the confident "Apple tight" cadence.
2. **Body Copy at 17px**: Body text runs at `17px / 400 / 1.47` line-height rather than conventional 16px, setting an intentional editorial reading pace.
3. **Strict Weight Ladder**: Only weights `400` (Regular), `600` (SemiBold), and `700` (Bold) are used. Weight `500` is deliberately omitted to prevent ambiguous visual hierarchy.

### Type Hierarchy Scale

| Token | Size | Weight | Line Height | Tracking | Application Context |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 700 | 1.07 | -0.35px | Main Homepage Hero & Major Campaign Openers |
| `{typography.display-lg}` | 40px | 600 | 1.10 | -0.28px | Tile Headlines ("Alumni Network", "Featured Openings") |
| `{typography.display-md}` | 32px | 600 | 1.25 | -0.25px | Section Titles & Profile Names |
| `{typography.lead}` | 24px | 400 | 1.25 | 0.15px | Sub-tile intro paragraphs and callouts |
| `{typography.tagline}` | 20px | 600 | 1.20 | 0.20px | Sub-nav category titles and card category labels |
| `{typography.body-strong}` | 17px | 600 | 1.35 | -0.20px | Table cell emphasis, job company names, bold body |
| `{typography.body}` | 17px | 400 | 1.47 | -0.20px | Standard readable text and candidate descriptions |
| `{typography.caption}` | 14px | 400 | 1.40 | -0.15px | Helper texts, input labels, metadata chips |
| `{typography.button}` | 15px | 600 | 1.00 | 0.00px | Primary pill and utility button text |
| `{typography.badge}` | 12px | 700 | 1.00 | 0.05em | Pipeline status badges and role pills (uppercase) |
| `{typography.code}` | 13px | 500 | 1.40 | 0.00px | Monospace logs, IDs, and Swagger specs |

---

## 📐 4. Layout, Elevation & Rhythm

### Spacing Scale
Layouts snap strictly to a rhythmic 8-point spatial system:
* `{spacing.xxs}`: `4px`
* `{spacing.xs}`: `8px`
* `{spacing.sm}`: `12px`
* `{spacing.md}`: `16px`
* `{spacing.lg}`: `24px`
* `{spacing.xl}`: `32px`
* `{spacing.xxl}`: `48px`
* `{spacing.section}`: `80px` (standard vertical tile padding)

### Tile Stacking Rhythm
Pages flow as an unbroken stack of full-bleed tiles with **0px gap**:
$$\text{Hero (Velvet Dark 1)} \longrightarrow \text{Directory (Pure White)} \longrightarrow \text{Job Board (Velvet Dark 2)} \longrightarrow \text{Announcements (Rose Parchment)} \longrightarrow \text{Footer (Velvet Dark 3)}$$
The transition between background colors creates a clean, architectural divider without relying on physical borders.

### The Single Elevation Rule
* **No box-shadows on standard UI**: Cards, buttons, and text never carry dropshadows.
* **The Single Product/Avatar Shadow**: When an alumnus profile photo, graduation badge, or company logo rests on a surface, it receives:
  ```css
  box-shadow: 3px 5px 30px rgba(225, 29, 72, 0.18), 0 2px 8px rgba(0, 0, 0, 0.15);
  ```
  This creates atmospheric visual weight without UI noise.

---

## 🔘 5. Shapes & Border Radii

| Token | Radius | Usage |
|---|---|---|
| `{rounded.none}` | `0px` | Full-bleed section tiles (touch viewport edges) |
| `{rounded.sm}` | `8px` | Dark utility buttons, table action buttons, badge chips |
| `{rounded.md}` | `12px` | Stat metric counters and filter panels |
| `{rounded.lg}` | `18px` | Store & Job vacancy utility cards, candidate review cards |
| `{rounded.pill}` | `9999px` | Signature Action Rose pill CTAs, search inputs, status badges |

---

## 🧩 6. Component Specifications

### 1. Navigation Architecture
* **`global-nav`**:
  - Height: `44px`
  - Background: `{colors.surface-tile-3}` (`#140c17`) at `95%` alpha.
  - Border Bottom: `1px solid rgba(244, 63, 94, 0.15)`.
  - Links: `12px`, muted orchid tint, spacing `24px` apart.
* **`sub-nav-frosted`**:
  - Height: `52px` (sticks below global nav on scroll).
  - Background: `rgba(253, 245, 247, 0.82)` on light surfaces or `rgba(26, 16, 30, 0.82)` on dark surfaces.
  - Filter: `backdrop-filter: blur(20px) saturate(180%)`.
  - Content: Left displays category title in `{typography.tagline}`; Right houses contextual action pill ("Post a Job" or "Apply").

### 2. Button Hierarchy
* **`button-primary-pill` (Signature CTA)**:
  - Background: `{colors.primary}` (`#f43f5e`).
  - Text: `{colors.text-on-dark}` (`#ffffff`).
  - Shape: `{rounded.pill}` (`9999px`).
  - Padding: `11px 22px`.
  - Active State: `transform: scale(0.96)`.
* **`button-secondary-pill` (Ghost CTA)**:
  - Background: `transparent`.
  - Border: `1.5px solid {colors.primary}`.
  - Text: `{colors.primary}` (`#f43f5e`).
  - Shape: `{rounded.pill}`.
  - Padding: `11px 22px`.
* **`button-utility-plum`**:
  - Background: `{colors.surface-tile-2}` (`#221428`).
  - Border: `1px solid rgba(244, 63, 94, 0.2)`.
  - Text: `#ffffff`.
  - Shape: `{rounded.sm}` (`8px`).
  - Padding: `8px 16px`.

### 3. Job Vacancy Card (`store-utility-card`)
Designed for high scanning density and immediate action:
* Container: `background: #ffffff`, `border: 1px solid rgba(225, 29, 72, 0.14)`, `border-radius: 18px`, `padding: 24px`.
* Top Row: Position title (`typography.body-strong`, max 120 chars) + Employment Type pill (`Full-Time`, `Remote`, etc.).
* Middle Row: Company name in `{colors.ink}` + optional City / Location in `{colors.ink-muted}`.
* Bottom Row: Instant **"Apply"** action pill (`/applications/new?job_id=:id`) and applicant count counter badge.

### 4. Application Pipeline Status Pills
* **`PENDING`**: Background `rgba(245, 158, 11, 0.12)`, Text `#d97706`, Border `1px solid rgba(245, 158, 11, 0.3)`.
* **`REVIEWING`**: Background `rgba(236, 72, 153, 0.12)`, Text `#db2777`, Border `1px solid rgba(236, 72, 153, 0.3)`.
* **`ACCEPTED`**: Background `rgba(16, 185, 129, 0.12)`, Text `#059669`, Border `1px solid rgba(16, 185, 129, 0.3)`.
* **`REJECTED`**: Background `rgba(225, 29, 72, 0.12)`, Text `#e11d48`, Border `1px solid rgba(225, 29, 72, 0.3)`.
* **`WITHDRAWN`**: Background `rgba(115, 97, 113, 0.12)`, Text `#736171`, Border `1px solid rgba(115, 97, 113, 0.3)`.

### 5. Search & Filter Inputs
* **`search-pill-input`**:
  - Height: `44px`.
  - Shape: `{rounded.pill}` (`9999px`).
  - Background: `#ffffff`.
  - Border: `1.5px solid rgba(225, 29, 72, 0.2)`.
  - Focus Ring: `0 0 0 3px rgba(244, 63, 94, 0.25)`.
  - Padding: `0 20px 0 42px` (with magnifying glass icon on the left).

### 6. Guardian Error UI & Observability
* **`404 Guardian View`**: Centered card with `{colors.surface-pearl}` well, displaying the exact reason (`The requested route GET /api/xyz does not exist.`), requested path, and 5 direct recovery pills back to safe routes.
* **`5xx Guardian View`**: Gracefully renders server failure state without leaking stack traces to clients, while appending error payloads directly to `logs/error.logs`.
* **`Terminal Logger Row`**:
  $$\text{Row format: } \texttt{time method route res. type duration}$$
  *Example:* `10:20:30 post /api/jobs 201 json 18ms`

---

## 🚫 7. Do's and Don'ts Matrix

| Category | ✅ Do | ❌ Don't |
|---|---|---|
| **Color Usage** | Use Action Rose (`#f43f5e`) for all primary actions, focus rings, and active indicators. | Don't mix in unrelated blue, orange, or purple brand buttons. Keep the single pinky accent clear. |
| **Section Breaks** | Alternate light tiles (`#ffffff` / `#fdf5f7`) with dark velvet tiles (`#1a101e` / `#221428`). | Don't place hard horizontal dividing lines across full-bleed tile sections. |
| **Typography** | Maintain 17px body copy and negative tracking on headlines (`-0.02em`). | Don't reduce body text to 14px or use font weight 500. Stick to 400, 600, 700. |
| **Shadows** | Apply the single soft rose/black shadow only to profile renders and elevated media. | Don't put dropshadows on cards, text, or buttons. |
| **Pill Geometry** | Reserve `{rounded.pill}` for actionable CTAs, search inputs, and status badges. | Don't make full-bleed tiles rounded at the corners. Tiles must touch edges seamlessly. |
| **Interaction** | Apply `transform: scale(0.96)` active state micro-interaction to all buttons. | Don't use jarring layout shifts or animated bouncing effects on click. |

---

## 📱 8. Responsive Breakpoint Matrix

| Breakpoint | Viewport Width | Key Responsive Behaviors |
|---|---|---|
| **Small Phone** | $\le 419\text{px}$ | Single-column tiles; hero text drops to `28px`; sub-nav collapses to category + primary CTA. |
| **Phone** | $420\text{px} - 640\text{px}$ | 1-column card stack; job cards stack metadata vertically; hero text scales to `34px`. |
| **Tablet Portrait**| $641\text{px} - 833\text{px}$ | Global nav collapses to hamburger; utility grids switch to 2 columns; tile vertical padding tightens to `48px`. |
| **Tablet Landscape**| $834\text{px} - 1023\text{px}$| Global nav expands horizontally; 3-column utility card grids; sub-nav displays full link cluster. |
| **Standard Desktop**| $1024\text{px} - 1440\text{px}$| 4-column job card grid; full-bleed tile heroes with 80px vertical breathing room; 1440px max content width. |
| **Wide Desktop** | $\ge 1441\text{px}$ | Content width locks at `1440px`; margins automatically absorb extra space. |

---

## 💻 9. CSS Variables Reference

```css
:root {
  /* Brand Pinky Interactive */
  --primary: #f43f5e;
  --primary-hover: #e11d48;
  --primary-focus: #fb7185;
  --primary-on-dark: #fda4af;
  --accent-magenta: #ec4899;

  /* Surfaces & Canvases */
  --canvas-white: #ffffff;
  --canvas-parchment: #fdf5f7;
  --surface-pearl: #fff1f4;
  --surface-tile-1: #1a101e;
  --surface-tile-2: #221428;
  --surface-tile-3: #140c17;

  /* Hairlines & Borders */
  --border-light: rgba(225, 29, 72, 0.14);
  --border-dark: rgba(244, 63, 94, 0.20);

  /* Typography Colors */
  --ink: #180e1b;
  --ink-muted: #736171;
  --text-on-dark: #ffffff;
  --text-on-dark-muted: #d4c6d3;

  /* Semantic Statuses */
  --status-pending: #f59e0b;
  --status-reviewing: #ec4899;
  --status-accepted: #10b981;
  --status-rejected: #e11d48;
  --status-withdrawn: #736171;

  /* Elevation */
  --shadow-product: 3px 5px 30px rgba(225, 29, 72, 0.18), 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

---

## 🔗 10. Document Integration & Anchors

* **Design Specification**: [design.md](design.md)
* **Brand Guidelines**: [brand.md](brand.md)
* **Data Design Document**: [ddd.md](ddd.md)
* **Main Readme**: [README.md](README.md)
* **Postman Test Collection**: [alumni_postman_collection.json](alumni_postman_collection.json)

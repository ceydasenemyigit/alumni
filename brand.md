# Brand Identity & Design System Guidelines
## Alumni Tracking System (Mezun Takip Sistemi)

[![Brand](https://img.shields.io/badge/Brand-Alumni%20Tracking%20System-2563eb.svg)](#-1-brand-overview--core-identity)
[![UI Kit](https://img.shields.io/badge/Design%20System-Dark%20Slate%20%2B%20Cobalt-0ea5e9.svg)](#-3-color-palette--visual-hierarchy)
[![Typography](https://img.shields.io/badge/Typography-Plus%20Jakarta%20Sans-10b981.svg)](#-4-typography-system)
[![Design Spec](https://img.shields.io/badge/Design%20Spec-Pinky%20Rose-f43f5e.svg)](design.md)
[![README](https://img.shields.io/badge/Documentation-README.md-10b981.svg)](README.md)

---

## 📌 1. Brand Overview & Core Identity

The **Alumni Tracking System** is a unified digital ecosystem connecting university graduates, current undergraduate/graduate students, faculty members, and institutional administration. Our brand identity reflects academic prestige, technological innovation, and lifelong communal belonging.

### Brand Essence
> **"Bridging Academic Heritage with Professional Futures"**
> *(Akademik Mirası Profesyonel Gelecekle Buluşturuyoruz)*

### Core Brand Values
1. **Academic Excellence & Trust**: Grounded in university heritage with dependable, transparent information architectures.
2. **Lifelong Community**: Fostering lasting bonds between graduates, mentor alumni, and aspiring students.
3. **Career Empowerment**: Accelerating career mobility through verified job opportunities and direct candidate applications.
4. **Modern Minimalist Utility**: Delivering high performance, clutter-free user experiences, and responsive dark-mode aesthetics.

---

## 🎨 2. Logo & Emblem Architecture

The Alumni Tracking System brandmark combines the iconic **Academic Graduation Cap (`🎓`)** with an **Interconnected Network Gradient Badge**, symbolizing the continuous web of alumni distributed across the global workforce.

```
       ┌───────────────────────────────┐
       │   🎓  Alumni Tracking System  │  [ALUMNI PORTAL]
       └───────────────────────────────┘
          ^               ^                    ^
      Brand Mark     Logotype Wordmark    Gradient Tag
```

### Brand Badge Specifications
* **Badge Gradient**: `linear-gradient(135deg, #2563eb, #0ea5e9)`
* **Corner Radius**: `6px`
* **Badge Typography**: `0.75rem`, `700 Weight`, uppercase, `letter-spacing: 0.05em`
* **Clearance Zone**: Minimum margin of `16px` on all sides when placed alongside third-party institutional marks.

### Brand Logo Do's & Don'ts
* ✅ **DO**: Use the official gradient badge on dark backgrounds (`#0f172a` and `#1e293b`).
* ✅ **DO**: Maintain consistent capitalization: **"Alumni Tracking System"** or **"Mezun Takip Sistemi"**.
* ❌ **DON'T**: Apply low-contrast dropshadows or stretch the logo proportions.
* ❌ **DON'T**: Alter the core brand colors or invert gradient directions.

---

## 🌈 3. Color Palette & Visual Hierarchy

The application employs a **High-Contrast Dark Theme Design System** built on deep slate tones with vibrant cobalt and sky-blue interactive accents. This minimizes eye strain, emphasizes data density, and ensures accessibility across all device viewports.

### Primary Brand Colors

| Swatch | Color Name | Hex Code | RGB | CSS Variable | Semantic Usage |
|---|---|---|---|---|---|
| ![#2563eb](https://via.placeholder.com/15/2563eb/000000?text=+) | **Cobalt Royal** | `#2563eb` | `rgb(37, 99, 235)` | `--primary` | Primary action buttons, brand accents, active tabs |
| ![#1d4ed8](https://via.placeholder.com/15/1d4ed8/000000?text=+) | **Cobalt Dark** | `#1d4ed8` | `rgb(29, 78, 216)` | `--primary-hover` | Button hover and focus states |
| ![#0ea5e9](https://via.placeholder.com/15/0ea5e9/000000?text=+) | **Sky Cyan** | `#0ea5e9` | `rgb(14, 165, 233)` | `--accent` | Secondary highlights, gradient blends, interactive links |

### Neutral & Background Foundations

| Swatch | Color Name | Hex Code | RGB | CSS Variable | Semantic Usage |
|---|---|---|---|---|---|
| ![#0b0f19](https://via.placeholder.com/15/0b0f19/000000?text=+) | **Deep Abyss** | `#0b0f19` | `rgb(11, 15, 25)` | `--bg-abyss` | Global canvas backdrop |
| ![#0f172a](https://via.placeholder.com/15/0f172a/000000?text=+) | **Slate 900** | `#0f172a` | `rgb(15, 23, 42)` | `--bg` | Form inputs, inner card wells, footer canvas |
| ![#1e293b](https://via.placeholder.com/15/1e293b/000000?text=+) | **Slate 800** | `#1e293b` | `rgb(30, 41, 59)` | `--surface` | Primary content cards, modals, headers |
| ![#273548](https://via.placeholder.com/15/273548/000000?text=+) | **Slate 750** | `#273548` | `rgb(39, 53, 72)` | `--surface-hover`| Table row hover, elevated interactive elements |
| ![#334155](https://via.placeholder.com/15/334155/000000?text=+) | **Slate 700** | `#334155` | `rgb(51, 65, 85)` | `--border` | Dividers, card boundaries, table cell borders |
| ![#f8fafc](https://via.placeholder.com/15/f8fafc/000000?text=+) | **Pure Slate Text** | `#f8fafc` | `rgb(248, 250, 252)`| `--text` | Primary readable text, titles, headings |
| ![#94a3b8](https://via.placeholder.com/15/94a3b8/000000?text=+) | **Muted Slate** | `#94a3b8` | `rgb(148, 163, 184)`| `--text-muted` | Secondary copy, timestamps, form hints, icons |

### Semantic State Palette

| Swatch | State | Hex Code | CSS Variable | Platform Context |
|---|---|---|---|---|
| ![#10b981](https://via.placeholder.com/15/10b981/000000?text=+) | **Success / Accepted** | `#10b981` | `--success` | `ACCEPTED` application status, verified badges, active jobs |
| ![#f59e0b](https://via.placeholder.com/15/f59e0b/000000?text=+) | **Warning / Reviewing** | `#f59e0b` | `--warning` | `REVIEWING` & `PENDING` states, deadline countdowns |
| ![#ef4444](https://via.placeholder.com/15/ef4444/000000?text=+) | **Danger / Rejected** | `#ef4444` | `--danger` | `REJECTED` status, 404/5xx Guardian alerts, deletion buttons |
| ![#64748b](https://via.placeholder.com/15/64748b/000000?text=+) | **Muted / Withdrawn** | `#64748b` | `--text-muted` | `WITHDRAWN` candidate status, archived listings |

---

## 🔤 4. Typography System

Our typography stack prioritizes geometric clarity, exceptional legibility on digital screens, and clean technical code rendering.

### Font Families
```css
/* Primary User Interface & Body Font */
font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

/* Monospace & Technical / Code Font */
font-family: 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace;
```

### Type Scale & Hierarchy

| Element | Size | Weight | Line Height | Usage Example |
|---|---|---|---|---|
| **Display / H1** | `2.25rem` (36px) | `800 Bold` | `1.2` | Page Titles, Hero Headlines (`Alumni User Directory`) |
| **Section / H2** | `1.5rem` (24px) | `700 Bold` | `1.3` | Card Section Headers, Review Headers |
| **Subtitle / H3** | `1.15rem` (18.4px) | `600 SemiBold` | `1.4` | Form Subheaders, Grid Item Titles |
| **Body Large** | `1.0rem` (16px) | `500 Medium` | `1.6` | Lead Paragraphs, Hero Intros |
| **Body Regular** | `0.95rem` (15.2px) | `400 Regular` | `1.5` | Standard Content, Descriptions, Form Labels |
| **Caption / Small**| `0.85rem` (13.6px) | `500 Medium` | `1.4` | Helper Text, Table Footers, Timestamps |
| **Badges / Micro** | `0.75rem` (12px) | `700 Bold` | `1.0` | Status Pills, Role Tags, Employment Types |

---

## 🧩 5. UI Component Design Patterns

### 1. Stat & Metric Counters
```
┌─────────────────────────────────┐
│ TOTAL OPENINGS                  │
│ 14                              │
│ +3 added this week              │
└─────────────────────────────────┘
```
* Container: `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 12px`
* Value: `font-size: 2rem`, `font-weight: 800`, `color: white`
* Label: `font-size: 0.8rem`, `font-weight: 700`, uppercase, `color: var(--text-muted)`

### 2. Status Badge Standard
All pipeline statuses across Jobs and Applications follow unified styling:
* **`PENDING`**: Amber background tint (`rgba(245, 158, 11, 0.15)`), amber text (`#f59e0b`).
* **`REVIEWING`**: Sky cyan background tint (`rgba(14, 165, 233, 0.15)`), cyan text (`#0ea5e9`).
* **`ACCEPTED`**: Emerald green background tint (`rgba(16, 185, 129, 0.15)`), green text (`#10b981`).
* **`REJECTED`**: Rose red background tint (`rgba(239, 68, 68, 0.15)`), red text (`#ef4444`).
* **`WITHDRAWN`**: Slate gray background tint (`rgba(148, 163, 184, 0.15)`), gray text (`#94a3b8`).

### 3. Button Design Matrix
* **Primary Button**: `background: var(--primary); color: white; border-radius: 8px; font-weight: 600;`
* **Outline Button**: `background: transparent; border: 1px solid var(--border); color: var(--text);`
* **Danger Button**: `background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5;`

---

## 📢 6. Tone of Voice & Content Guidelines

| Dimension | Our Tone | What to Avoid |
|---|---|---|
| **Formality** | Professional, academic, yet welcoming | Bureaucratic, cold, overly stiff |
| **Clarity** | Direct, concise, actionable instructions | Vague error statements, cryptic jargon |
| **Error Handling** | Helpful, with clear **reasons** and recovery paths | Dead ends, accusatory phrasing ("You broke this") |
| **Community** | Inclusive, encouraging student-alumni networking | Elitist, restrictive phrasing |

### Error Guardian Messaging Rules
When rendering error screens or API responses:
1. Always state the **status code** prominently (`HTTP 404 • Not Found`).
2. Provide an explicit **`reason`** explaining why the request failed.
3. Offer immediate **navigational escape paths** (links to Home, Directory, Job Board, API Docs).

---

## 📂 7. Brand Assets & Repository Integration

* **Brand Documentation**: [brand.md](brand.md)
* **Visual Design System (Pinky Rose Edition)**: [design.md](design.md)
* **Data Design Architecture**: [ddd.md](ddd.md)
* **Project Readme**: [README.md](README.md)
* **Interactive UI**: [http://localhost:3000](http://localhost:3000)
* **API Swagger**: [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)

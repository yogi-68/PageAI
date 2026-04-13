# PageAI — UI Design System v5.2

> Premium dark-mode design system built for business owners.  
> Stack: Next.js 16 · Tailwind CSS v4 · Framer Motion · Lucide Icons

---

## 1. Color Tokens

### Backgrounds
| Token               | Value     | Usage                        |
|----------------------|-----------|------------------------------|
| `--bg`              | `#0c0e16` | Page base                    |
| `--bg-raised`       | `#14161f` | Cards, panels                |
| `--bg-overlay`      | `#1a1d28` | Hover states, overlays       |
| `--bg-subtle`       | `#10121a` | Sidebar, secondary surfaces  |

### Text
| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| `--text-1` | `#eef0f6` | Primary headings & body  |
| `--text-2` | `#a0a3b5` | Secondary / descriptions |
| `--text-3` | `#5f6275` | Muted / labels           |

### Accent
| Token            | Value                       | Usage               |
|-------------------|-----------------------------|----------------------|
| `--accent`       | `#6c5ce7`                   | Primary brand        |
| `--accent-hover` | `#7c6ff7`                   | Hover / active       |
| `--accent-muted` | `rgba(108, 92, 231, 0.10)`  | Pill backgrounds     |

### Borders
| Token              | Value                        |
|---------------------|------------------------------|
| `--border`         | `rgba(255, 255, 255, 0.06)`  |
| `--border-active`  | `rgba(255, 255, 255, 0.10)`  |
| `--border-focus`   | `rgba(108, 92, 231, 0.40)`   |

### Semantic
| Token        | Value     |
|--------------|-----------|
| `--success`  | `#00b894` |
| `--warning`  | `#fdcb6e` |
| `--error`    | `#ff6b6b` |

---

## 2. Typography

| Element    | Size              | Line-Height | Weight | Letter-Spacing |
|------------|-------------------|-------------|--------|----------------|
| Body       | 15px              | 1.8         | 400    | 0.015em        |
| Paragraph  | inherit           | 1.85        | —      | —              |
| H1         | clamp(2.75rem–5rem) | 1.08–1.2  | 700+   | -0.03em        |
| H2         | —                 | 1.3         | 700    | -0.02em        |
| H3         | —                 | 1.35        | 600    | -0.015em       |
| Labels     | 14px              | 1.5         | 500    | —              |
| Small text | 12–13px           | 1.6–1.8    | 400    | —              |

**Font stack:** `Inter, system-ui, -apple-system, sans-serif`

---

## 3. Spacing System

| Context              | Value          |
|----------------------|----------------|
| Section padding      | 160px / 120px  |
| Container inline     | 32px           |
| Container max-width  | 1200px         |
| Container-sm width   | 720px          |
| Card padding         | 32px (default) |
| Button padding       | 14px 28px      |
| Input padding        | 14px 18px      |
| Badge padding        | 7px 16px       |
| Gap (grids)          | 20px–32px      |

---

## 4. Border Radius

| Token          | Value |
|----------------|-------|
| `--radius-sm`  | 8px   |
| `--radius-md`  | 12px  |
| `--radius-lg`  | 16px  |
| `--radius-xl`  | 20px  |

General usage: Cards → `--radius-lg`, Buttons/Inputs → `--radius-md`, Badges → `9999px`, Avatars → `full`

---

## 5. Shadow System

| Token           | Description                              |
|-----------------|------------------------------------------|
| `--shadow-sm`   | Subtle card shadow                       |
| `--shadow-md`   | Elevated cards, active FAQ items         |
| `--shadow-lg`   | Modals, login/signup cards               |
| `--shadow-xl`   | Mobile drawer                            |
| `--shadow-glow` | Accent glow for logos, featured elements |

All shadows use `rgba(0,0,0,...)` with increasing opacity + spread.

---

## 6. Animations & Motion

### Framer Motion Patterns

| Pattern              | Usage                          | Config                                              |
|----------------------|--------------------------------|------------------------------------------------------|
| `whileInView`        | Scroll-triggered entrances     | `viewport={{ once: true }}`                          |
| `whileHover`         | Card/button micro-interactions | `y: -3` to `-6`, `scale: 1.01–1.08`                 |
| `whileTap`           | Button press feedback          | `scale: 0.98`                                        |
| `AnimatePresence`    | Mount/unmount animations       | FAQ accordion, mobile menu                           |
| `useScroll/Transform`| Parallax effects               | Hero background glow + browser mockup                |
| Staggered children   | Grid entrances                 | `staggerChildren: 0.06–0.1s`                         |
| Spring physics       | Toggle, logo hover             | `type: "spring", stiffness: 300–500, damping: 20–30` |

### CSS Animations

| Keyframe     | Effect                                  | Duration |
|--------------|------------------------------------------|----------|
| `float`      | Gentle Y oscillation (0→-8px→0)         | 6s       |
| `glow-pulse` | Shadow opacity pulse                    | 4s       |
| `slide-up`   | Y:8→0 with fade-in                      | 0.5s     |
| `blur-in`    | Blur:4px→0 + fade-in                    | 0.6s     |
| `glow`       | Scale oscillation (1→1.15→1)            | 8s       |

**Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — fast start, gentle deceleration.

### Delay System
10 utility classes: `.delay-1` (100ms) through `.delay-10` (1000ms), increments of 100ms.

---

## 7. Component Patterns

### Cards
```css
.card {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);    /* 16px */
  padding: 32px;
  box-shadow: var(--shadow-sm);
}
```

### Buttons
```css
.btn-primary {
  background: var(--accent);
  border-radius: var(--radius-md);    /* 12px */
  padding: 14px 28px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  /* Hover: translateY(-1px) + lighter bg */
}

.btn-secondary {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
```

### Inputs
```css
.input {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.6;
}
```

### Glass Effect
```css
.glass {
  background: rgba(12, 14, 22, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

### Glow Border
Pseudo-element `::before` with `conic-gradient` from accent → transparent → accent, masked to border area.

---

## 8. Layout Structure

### Landing Page
- **Navbar:** 72px height, glass effect on scroll, sticky top-0
- **Hero:** pt-40 pb-32, parallax background glow, browser mockup, stats row
- **Features:** 3-column grid, staggered entrance
- **How It Works:** 3-step cards with animated tags
- **Pricing:** 3-column grid, animated annual/monthly toggle
- **Testimonials:** 3-column grid, staggered entrance
- **FAQ:** Accordion with AnimatePresence height transitions
- **CTA:** Full-width gradient card
- **Footer:** 4-column links, logo, copyright

### Auth Pages
- **Login:** Centered card (460px max), glass glow background, OAuth + email form
- **Signup:** Split layout — 45% benefits panel (left) + 55% form (right), responsive

### Dashboard
- **Layout:** Left sidebar (260px/68px collapsed) + top bar (64px) + content area
- **Sidebar:** 8 nav items, user card, sign-out, animation on mobile (spring-based slide)
- **Content:** 32px padding, staggered KPI cards, animated usage bar
- **Mobile:** Hamburger → AnimatePresence drawer with backdrop blur

---

## 9. Background Effects

| Element     | Size   | Effect                                |
|-------------|--------|---------------------------------------|
| `.bg-grid`  | 56px   | Repeating white grid lines (opacity 3%) |
| `.bg-glow`  | 800px  | Radial gradient accent blob           |
| `.bg-noise` | —      | SVG fractal noise overlay (opacity 2%) |

---

## 10. Responsive Breakpoints

Built on Tailwind defaults:
- `sm:` 640px — 2-col grids
- `md:` 768px — medium adjustments
- `lg:` 1024px — desktop sidebar, split auth layouts
- `xl:` 1280px — wider left panels

Section padding scales down to 80px/60px on mobile via Tailwind responsive prefixes.

---

## 11. File Map

| File                                | Role                        |
|--------------------------------------|-----------------------------|
| `src/app/globals.css`               | Design tokens + base styles |
| `src/components/landing/Navbar.tsx`  | Nav with motion + glass     |
| `src/components/landing/HeroSection.tsx` | Parallax hero          |
| `src/components/landing/FeaturesSection.tsx` | Staggered grid     |
| `src/components/landing/HowItWorksSection.tsx` | Step cards        |
| `src/components/landing/PricingSection.tsx` | Animated pricing     |
| `src/components/landing/TestimonialsSection.tsx` | Staggered cards  |
| `src/components/landing/FAQSection.tsx` | AnimatePresence accordion |
| `src/components/landing/CTASection.tsx` | CTA banner              |
| `src/components/landing/Footer.tsx`  | Footer (server component)  |
| `src/app/login/page.tsx`            | Login with motion           |
| `src/app/signup/page.tsx`           | Split signup with motion    |
| `src/app/dashboard/layout.tsx`      | Sidebar + top bar           |
| `src/app/dashboard/page.tsx`        | KPIs, bots grid, actions    |

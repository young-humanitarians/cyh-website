# CYH Design Rules

Binding design specification for this site.

**Source of truth: the live site at <https://circleofyounghumanitarians.ch/>** (Squarespace 7.1).
Every value below was extracted from that site's served CSS and page context, not
invented. Where this repo currently disagrees with the live site, the live site
wins — see [§13 Known deviations](#13-known-deviations-in-this-repo).

Audience: whoever (human or agent) writes CSS, components or templates here.
Read §2, §4 and §13 before touching any styling.

---

## 1. How these values were obtained

So they can be re-checked when the live site changes:

```bash
curl -sL https://circleofyounghumanitarians.ch/ -o /tmp/cyh.html

# Design tokens live in the versioned site stylesheet linked from that HTML:
grep -oE 'versioned-site-css[^"]*' /tmp/cyh.html        # → site.css URL
curl -sL "https://static1.squarespace.com/static/versioned-site-css/.../site.css?nocustom=true" -o /tmp/site.css

grep -oE '\-\-[a-zA-Z0-9-]*hsl:[^;]*' /tmp/site.css | sort -u        # palette
grep -oE '\-\-(heading|body|meta)-font-[a-zA-Z-]*:[^;}]*' /tmp/site.css | sort -u
grep -oE '\-\-(primary|secondary|tertiary)-button-[a-zA-Z-]*:[^;}]*' /tmp/site.css | sort -u

# Layout + header settings come from the inline page context:
python3 -c "import re,json;h=open('/tmp/cyh.html').read();print(json.dumps(json.loads(re.search(r'Static\.SQUARESPACE_CONTEXT\s*=\s*(\{.*?\});',h,re.S).group(1))['tweakJSON'],indent=1))"
```

Last verified: 2026-09-16.

---

## 2. Colour

The live site uses **exactly four colours**. There is no grey scale, no tinted
surface, no secondary hue. This is the single most important rule in this
document: the design gets its force from black, white and one red.

| Role | Squarespace var | HSL (authoritative) | Hex |
| --- | --- | --- | --- |
| Accent red | `--accent-hsl` | `hsl(356.96 100% 46.47%)` | `#ED000C` |
| Dark accent red | `--darkAccent-hsl` | `hsl(0 100% 34.71%)` | `#B10000` |
| Black | `--black-hsl` | `hsl(0 0% 0%)` | `#000000` |
| White | `--white-hsl` / `--lightAccent-hsl` | `hsl(0 0% 100%)` | `#FFFFFF` |

`--lightAccent-hsl` is white — i.e. the "light accent" slot is not a tinted
off-white, it is plain white. Do not introduce one.

### Rules

- **Body text and headings are pure black `#000000` on white.** Not `#141414`,
  not a soft grey. The live site sets both `--headingLargeColor` and
  `--paragraphMediumColor` to `hsla(var(--black-hsl),1)` on white sections.
- **Do not invent grey tokens** for muted text, card borders, dividers or sunk
  backgrounds. If something needs to be visually secondary, use size, weight or
  whitespace — not a grey.
- **Red is for accent only**: primary buttons, links, active navigation state.
  It is never a text colour for body copy and never a large background fill
  outside a deliberate `bright` section (§3).
- **Links use `#B10000`** (dark accent) on white. `#ED000C` on white is
  4.56:1 — it passes WCAG AA for normal text, but only just; `#B10000` gives
  7.32:1 and is the safer default for anything text-sized.

### When a design calls for "a colour per category"

It does not get one. The 2026 draft asks for a colour block per department in
the organigram; with four colours there is no hue to spare. Departments
alternate between a red-filled and a black-filled header block instead. Apply
the same reasoning to any future request for a categorical palette: vary
fill, weight and border, not hue.

### Contrast reference

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on `#ED000C` | 4.56:1 | AA normal text (marginal), AA large text |
| Black on `#ED000C` | 4.61:1 | AA normal text (marginal) |
| White on `#B10000` | 7.32:1 | AAA large, AA normal comfortably |
| Black on `#B10000` | 2.87:1 | **Fails** — never do this |
| White on black | 21:1 | Maximum |

---

## 3. Section colour themes

Sections carry a theme that sets background, text and button colours together.
The live site uses only two of the ten available themes.

| Theme | Background | Headings | Body | Primary button | In use? |
| --- | --- | --- | --- | --- | --- |
| `white` (default) | white | black | black | red bg / white text | **yes** — nearly every section |
| `black` | black | white | white | white bg / black text | **yes** — one section per page |
| `bright` | red | white | white | white bg / red text | available, unused |
| `light`, `dark`, `*-bold`, `bright-inverse` | — | — | — | — | unused |

Every page follows the same rhythm: white content sections, plus **one black
section** used as a full-bleed emphasis band, plus the footer.

**Rule:** default to white. Use black sparingly — at most one black band per
page. Do not use the unused themes without a decision to change the design
language.

---

## 4. Typography

### Families

| Role | Family | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- |
| Headings (h1–h4, site title) | `acumin-pro` (Adobe Fonts) | 500 | 1.4 | 0 |
| Body | `Poppins` | **300** | **1.8** | 0 |
| Meta (dates, captions, categories) | `Poppins` | 400 | — | — |

Notes that matter:

- **Body weight is 300 (Light), not 400.** Poppins 300 at 1.8 line height is
  what gives the site its airy feel. Loading only 400+ changes the design.
- **Heading line height is 1.4 and tracking is 0.** Headings are *not* tight.
  Do not apply negative letter-spacing.
- `acumin-pro` is served via Adobe Fonts (Typekit kit `xCg1Gr1ce00…`), licensed
  per-domain. See §13 for what this means for the rebuild.

### Size scale

Squarespace resolves sizes from a unitless value `V` with this formula:

```css
/* ≥768px */
font-size: min(
  calc((V - 1) * 1.2vw + 1rem),
  max(calc((V - 1) * 0.012 * 1800px + 1rem), calc(V * 1rem))
);
/* <768px */
font-size: calc((V - 1) * calc(0.012 * min(100vh, 900px)) + 1rem);
```

| Role | `V` | ~390px | 768px | 1024px | 1280px | 1440px | ≥1800px |
| --- | --- | --- | --- | --- | --- | --- | --- |
| h1 | 4 | 44.8px | 43.6px | 52.9px | 62.1px | 67.8px | 80.8px |
| h2 | 2.8 | 33.3px | 32.6px | 38.1px | 43.6px | 47.1px | 54.9px |
| h3 | 2.2 | 27.5px | 27.1px | 30.7px | 34.4px | 36.7px | 41.9px |
| h4 | 1.6 | 21.8px | 21.5px | 23.4px | 25.2px | 26.4px | 29.0px |
| Large body | 1.5 | 20.8px | 20.6px | 22.1px | 23.7px | 24.6px | 26.8px |
| Body | 1.0 | 16px at every width |
| Small body | 0.9 | 14.4px (treat as flat) |

**The h1 reaches ~81px, not 64px.** `4rem` is the *value*, not the rendered cap.
Do not cap headings at 3.5rem.

### Implementation for this repo

Plain-CSS equivalents, accurate to within a pixel of the live site:

```css
:root {
  --t-h1: clamp(2.8rem, 3.6vw + 1rem, 5.05rem);   /* 44.8 → 80.8px */
  --t-h2: clamp(2.08rem, 2.16vw + 1rem, 3.43rem); /* 33.3 → 54.9px */
  --t-h3: clamp(1.72rem, 1.44vw + 1rem, 2.62rem); /* 27.5 → 41.9px */
  --t-h4: clamp(1.36rem, 0.72vw + 1rem, 1.81rem); /* 21.8 → 29.0px */
  --t-lg: clamp(1.3rem, 0.6vw + 1rem, 1.68rem);   /* 20.8 → 26.8px */
  --t-base: 1rem;
  --t-sm: 0.9rem;
}
```

### Type rules

- Only h1–h4 are defined. There is no h5/h6 scale — if you need one, you are
  nesting too deep; restructure the page.
- One `h1` per page, matching the page title.
- No uppercase transform anywhere: every `text-transform` token on the live
  site is `none`. **Do not add uppercase eyebrows or all-caps meta labels.**
- No letter-spacing on headings or body. The only tracked text is the primary
  button (`0.1em`).

---

## 5. Layout

| Token | Value |
| --- | --- |
| Max page width | `1800px` |
| Page gutter | `3vw` |
| Mobile gutter | `6vw` |
| Content grid | 24 columns desktop / 8 columns mobile, `11px` gutter |
| Mobile breakpoint | `767px` / `768px` |

**Rule:** the site is wide. Content runs to 1800px, not to a 1152px column.
Long-form prose may still be constrained to a readable measure inside a
full-width section, but section backgrounds, images and grids go full width.

---

## 6. Buttons

Three tiers, all Poppins, all `6.4px` corner radius. **Not pills.**

| | Primary | Secondary | Tertiary |
| --- | --- | --- | --- |
| Font size (`V`) | 1.5 (→ 20.8–26.8px) | 1.1 (→ 17–18.2px) | 1.0 (16px) |
| Weight | **800** | 500 | 300 |
| Letter spacing | `0.1em` | `0.02em` | `0` |
| Line height | 1.2 | 1.2 | 1.2 |
| Padding | `1em 0.6em` | `1.1em 0em` | `1.3rem 1.3rem` |
| Border width | `2px` | `1px` | — |
| Radius | `6.4px` | `6.4px` | `6.4px` |
| Background (white section) | `#ED000C` | theme-dependent | theme-dependent |
| Text (white section) | `#FFFFFF` | black | — |
| Background (black section) | `#FFFFFF` | — | — |
| Text (black section) | `#000000` | — | — |

Two things to know before you "fix" these:

- **Primary buttons are tall and narrow-sided** — `padding: 1em 0.6em` means
  roughly 24px top/bottom against 14px left/right at typical sizes. This is the
  live design, verified in the served CSS
  (`padding-top: var(--primary-button-padding-y)` / `padding-right:
  var(--primary-button-padding-x)`). Reproduce it; do not silently swap the axes.
- **Secondary buttons have zero horizontal padding** (`0em`), so they read as an
  underlined/outlined text link rather than a filled control.

One addition this repo makes, not present in the Squarespace tokens: primary
buttons carry `min-width: 12rem`. With only 0.6em of horizontal padding, a
short label like "Donate" would otherwise render as a cramped sliver. The
min-width only bites on short labels; longer ones are already wider than it.

Primary button text at weight 800 and ~21px+ counts as large text, so
white-on-red clears WCAG AA comfortably there.

---

## 7. Header and navigation

| Property | Value |
| --- | --- |
| Layout | Logo left, navigation right (`logoLeftNavRight`) |
| Width | Full bleed |
| Logo height | `117px` desktop, max `70px` mobile |
| Vertical padding | `2vw` desktop, `6vw` mobile |
| Background | White (`--solidHeaderBackgroundColor: #FFFFFF`) |
| Nav link colour | Black; red (`#ED000C`) for hover/active |
| Fixed / sticky | **No** (`tweak-fixed-header: false`) |
| Transparent | **No** (`tweak-transparent-header: false`) |

The header scrolls away with the page. Do not make it sticky.

Navigation structure (mirrors `src/content/settings/site.yaml`):

```
Home · About ▾ · Initiatives ▾ · Summit ▾ · Impact · Get Involved · Support Us
```

Top-level items with children are folders — the parent is not itself a link.

---

## 8. Footer and newsletter

Every page ends with the same two elements, in this order:

1. **Newsletter block** — heading "Stay Up to Date with the CYH Newsletter",
   Mailchimp form, single email field plus submit.
2. **Footer** — address, social links (Instagram, LinkedIn, Spotify), legal
   links, copyright.

Social icons on the live site: `24px`, `14px` gap, no border radius, no
container — plain monochrome glyphs.

---

## 9. Imagery

- Photography is documentary: real people at real CYH events. No stock imagery,
  no illustration, no icon sets beyond the social glyphs.
- Images are presented **uncropped and unfiltered** — no duotone, no red
  overlay, no rounded corners on photos.
- Event thumbnails are **1:1 square**.
- The home page carries a full-bleed hero image and a multi-image gallery.
- The logo is the CYH seal (red circle mark). Never recolour it, never place it
  on red.
- Per `CLAUDE.md`: content images live in `src/assets/` or `public/images/`,
  never as external URLs.

---

## 10. Motion

**Global animations are disabled on the live site**:

```
tweak-global-animations-enabled = false
tweak-global-animations-type    = none
```

Rules:

- No scroll-triggered reveals, no fade-ins, no parallax, no marquee-style
  attention grabbers on new work.
- Hover state changes on links and buttons are fine, but keep them instant or
  very short (the site's own animation duration token is `0.1s`, curve `ease`).
- Keep the `prefers-reduced-motion` block in `global.css` regardless.

**One standing exception.** The 2026 revamp asks for initiative flashcards that
turn over to reveal their description. That card flip runs at 350ms, longer
than the 0.1s above. It is allowed because it is a direct interaction with a
control the user is pointing at, not an ambient effect — and under
`prefers-reduced-motion` the faces swap outright instead of rotating. Do not
read this exception as licence for scroll reveals.

---

## 11. Accessibility

Non-negotiable, and mostly independent of the visual spec:

- Semantic HTML: real `<nav>`, `<main>`, `<header>`, `<footer>`, heading order
  without skips.
- Every image has a meaningful `alt`; decorative images get `alt=""`.
- Visible focus indicator on every interactive element. Never remove an outline
  without providing a replacement.
- All interactive elements reachable and operable by keyboard. Dropdown
  navigation must open on focus, not hover alone.
- Respect the contrast table in §2. Black on red is forbidden.
- Skip link to `#main` stays.
- UI strings stay centralised in `src/content/settings/site.yaml` so the site
  can be translated (German first, per `CLAUDE.md`).

---

## 12. Page patterns

Observed section order, consistent across pages:

- **Home** — hero image + CTA ("Check our upcoming events!") → mission statement
  → image gallery → ICRC collaboration callout → social feed → newsletter.
- **Content pages** (`about-us`, `impact`, `get-involved`, `support`) — h1 page
  title → 2–4 white content sections → one black emphasis band → newsletter.
- **Summit pages** — content sections → partners/supporters → social → terms →
  newsletter.

When adding a page, follow this shape rather than inventing a new one.

---

## 13. Deviations from the live site — resolved

`src/styles/global.css` used to encode a reinterpretation of the live design.
As of the 2026 revamp it has been rewritten to the values in this document.
All eighteen deviations below are **fixed**; the table is kept as a record of
what changed and why, so nobody reintroduces them.

| # | Area | Was | Now |
| --- | --- | --- | --- |
| 1 | Grey palette | `--c-ink-soft`, `--c-ink-mute`, `--c-paper-warm`, `--c-paper-sunk`, `--c-rule` | All removed; four colours only |
| 2 | Ink colour | `hsl(0 0% 8%)` | `#000000` |
| 3 | Body weight | Poppins 400 | Poppins 300 |
| 4 | Body line height | 1.65 | 1.8 |
| 5 | Heading font | Archivo 600 | Inter 500 (stand-in — see below) |
| 6 | Heading line height | 1.15 | 1.4 |
| 7 | Heading tracking | `-0.015em` | `0` |
| 8 | Type scale cap | h1 maxed at 3.5rem | h1 reaches 5.05rem (80.8px) |
| 9 | Button shape | `border-radius: 999px` | `6.4px` |
| 10 | Button fill | Ink background, red on hover | Red background, white text |
| 11 | Button type | `--t-sm`, weight 600, `0.01em` | 1.5 scale, weight 800, `0.1em` |
| 12 | Page width | `72rem` (1152px) | `1800px`, with a 68ch measure for prose |
| 13 | Gutter | `clamp(1.25rem, 5vw, 3rem)` | `3vw` / `6vw` mobile |
| 14 | Uppercase eyebrow | Uppercase, `0.14em` tracked | Sentence case, red, no tracking |
| 15 | Card meta | Uppercase, `0.08em`, grey | Sentence case, no grey |
| 16 | Card borders | `1px solid var(--c-rule)` grey | 1px solid black hairline |
| 17 | Logo size | 84px / 64px | 117px / 70px |
| 18 | Section tinting | `.section--sunk` warm grey | `[data-theme="black"]` band |

Verified against the built CSS: the only colours the site emits are `#000`,
`#fff`, `#ed000c`, `#b10000` and `transparent`; the only font weights are 300,
400, 500 and 800; there is no `text-transform` and no negative tracking.

### The one thing still open: the heading font

`acumin-pro` is an Adobe Fonts face licensed per-domain via a Typekit kit
owned by the Squarespace site. It cannot be self-hosted from this repo.

**Inter 500 is shipping as the stand-in**, at line height 1.4 and tracking 0.
It is a closer neo-grotesque match than the Archivo it replaced. Everything
reads `--font-heading`, so switching to the real face is a single change in
the `fonts` array in `astro.config.mjs`.

To close this properly, CYH needs to provision an Adobe Fonts web project for
the new domain and allowlist it. Until then, Inter stands.

## 14. Conformance checklist

Before considering any styling task done:

- [ ] No colour used other than `#000000`, `#FFFFFF`, `#ED000C`, `#B10000`
- [ ] No `text-transform: uppercase`
- [ ] No negative `letter-spacing`
- [ ] No grey text, grey borders or tinted backgrounds
- [ ] Buttons are `6.4px` radius, not pills
- [ ] Body copy is Poppins 300 / 1.8
- [ ] Headings are 500 / 1.4 / tracking 0
- [ ] Every interactive element has a visible focus style
- [ ] Contrast checked against §2; no black-on-red
- [ ] No scroll-triggered animation added
- [ ] No new hue introduced for a category — vary fill and weight instead (§2)
- [ ] Any new block type exists in all four places: content schema, component,
      `Blocks.astro`, and `keystatic.config.ts`
- [ ] `npm run build` passes with no new warnings
- [ ] `npx astro check` reports no new errors or warnings

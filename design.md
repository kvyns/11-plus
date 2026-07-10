# 11+ eLearning — Design System

This is the single source of truth for how the app looks. If you're adding or
editing a page, check here first — don't invent new colors, radii, or card
patterns. Everything below is already wired up in `src/index.css` (Tailwind
v4 `@theme` tokens) and a handful of reusable components.

## Vibe

Warm, playful, illustrated — built for parents and 9–13 year-olds, not a B2B
SaaS dashboard. Reference inspiration: Kidza (kindergarten template) and
Психология счастья (parent-coaching landing page) — cream/lavender base,
flat pastel cards, rotated sticker badges, organic wave dividers, circular
photo crops. Avoid generic centered-card-on-white-gradient layouts.

## Color

Defined in `src/index.css` under `@theme`. Use the token classes, not raw
Tailwind colors like `bg-rose-100` or `bg-purple-600`.

| Token | Class | Use |
|---|---|---|
| `--color-cream` | `bg-cream` | Page background (default, everywhere) |
| `--color-cream-100` | `bg-cream-100` | Secondary cream surface |
| `--color-lavender-50` / `-100` | `bg-lavender-50` / `bg-lavender-100` | Section backgrounds for contrast bands, gradients |
| `--color-primary-*` (indigo) | `bg-indigo-600` etc. | Primary actions, links, brand accent |
| `--color-pastel-yellow` / `-pink` / `-mint` / `-lavender` (+ `-ink` variants) | `bg-pastel-pink` / `text-pastel-pink-ink` | Flat card fills — subject cards, feature cards, icon badges. Always pair a pastel bg with its matching `-ink` text color, never `text-slate-900` on a pastel card body copy (use `-ink` at reduced opacity for secondary text) |
| amber-400/500 | `bg-amber-500` | Secondary CTA color, sticker badges, highlight pills |
| slate-900 | `bg-slate-900` | Dark contrast sections (marquee, progress panel, live-classes band) — used sparingly, 1–2 per page max |

Never use raw `purple-*`, `rose-*` (except transient one-offs like error
banners which stay semantic `red-*`/`green-*`), or a `from-indigo-600
to-purple-600` gradient — that gradient was explicitly rejected as "so bad"
in review. If a section needs a colored panel, use `bg-slate-900` (dark) or
`bg-gradient-to-br from-lavender-100 to-pastel-lavender` (light), not a
saturated brand-color gradient.

## Typography

Three font families, loaded in `index.html` via Google Fonts:

- **Body**: Inter (default, no class needed)
- **Display / headings**: `font-display` (Baloo 2) — apply to every `h1`/`h2`/`h3`
  and any bold UI label that acts as a heading (page titles, card titles,
  section eyebrows' companion headline)
- **Accent / script**: `font-accent` (Caveat) — use *sparingly*, only for one
  emphasis word per hero/headline (e.g. "Learning made **simple**"), paired
  with a hand-drawn underline SVG. Never use it for body copy or buttons.

## Radius & shadow system

Don't invent new radius/shadow values. Three-tier shadow scale in
`index.css`:

| Token | Class | Use |
|---|---|---|
| `--shadow-card` | `shadow-card` | Default card resting state |
| `--shadow-card-lg` | `shadow-card-lg` | Hover state / elevated card |
| `--shadow-card-xl` | `shadow-card-xl` | Modals, hero cards, the auth form panel |
| `--shadow-btn` | `shadow-btn` | Primary buttons |

Radius: `rounded-full` for buttons/pills/avatars, `rounded-2xl` for small
cards, `rounded-[1.75rem]` for medium cards (auth forms, dashboard panels),
`rounded-[2rem]` for hero-level cards and photo collage images.

## Layout patterns

### Expand width before you add vertical scroll
On desktop (`sm:`/`lg:` and up), a long single-column form is a layout
failure, not a neutral choice — it means width is sitting unused while the
user scrolls past fields that could sit side-by-side. Before shipping any
form/card longer than ~5 fields, ask: can this be 2 columns instead of
scroll? Concretely:
- Pair naturally-related fields in a `grid grid-cols-1 sm:grid-cols-2 gap-4`
  (first/last name, email/mobile, password/confirm) — 1 column on mobile,
  2 on `sm:` and up. This is why `RegisterPage` uses `maxWidth="max-w-xl"`
  on `AuthLayout` instead of the default `max-w-md` — the wider card is
  what makes 2-column pairing worth doing; don't pair fields into a
  cramped `max-w-md` card.
- `AddChildPage` follows the same rule (name pair, will widen further if
  more fields are added) — check it for the reference pattern outside the
  auth flow.
- This is a per-page judgment call, not "always 2 columns" — a single
  short field (search box, single code input) stays full-width. The test
  is whether pairing still leaves each field comfortably readable; don't
  cram 3+ columns just to avoid scroll.

### Wave dividers
Use `<WaveDivider fromColor toColor flip />` (`src/components/landing/WaveDivider.jsx`)
between full-bleed sections of different background colors instead of a hard
edge. `fromColor` is the solid background of the divider box (matches the
section above it), `toColor` fills the SVG curve (matches the section
below). `flip` only changes the curve shape for variety — it does **not**
swap which color is "top" vs "bottom" (that was a bug, now fixed — don't
reintroduce it by rotating the whole div again).

### "Playful" is not landing-page-only
The landing page is the reference for the vibe, not the ceiling — every
page in the app should read as the same product, not a marketing site
bolted onto a plain internal tool. When reskinning any page (dashboard,
mock tests, subscription, profile, etc.), pull in the same toolkit the
landing page uses, not just flat pastel card fills:
- **Wave dividers** between stacked sections on any page with 2+ visually
  distinct zones (e.g. a hero/summary block sitting above a list/grid),
  not just the marketing landing page.
- **Decorative blurred blobs** (`absolute` positioned, `blur-3xl`, low
  opacity, `pointer-events-none`) behind dark or accent panels — see the
  Progress section pattern in `LandingPage.jsx` and the sidebar/stats
  panels in `ChildDashboardPage.jsx`.
- **Rotated sticker badges/tags** on cards that announce a status (LIVE,
  FREE, a score, a count) instead of a flat inline label.
- **Circular photo/icon treatments** instead of square thumbnails wherever
  a subject, child, or achievement is represented visually.
Judgment call: don't force a wave divider between two sections that are
already the same background color, and don't add decorative blobs behind
small/dense UI (forms, tables) where they'd fight with the content.

### Sticker cards
The core recurring card pattern (subject cards, feature cards, dashboard
subject grid): flat pastel background (`bg-pastel-*`), a circular photo or
icon element (often overlapping the card edge with a negative offset +
`ring-4 ring-white`), a rotated tag chip in a corner, `-ink` colored body
text. See `subjects` array + card markup in `LandingPage.jsx` for
the canonical example.

### Circular icon badges
Every "feature/benefit" icon uses a circle, not a rounded-square — `flex
h-10 w-10 items-center justify-center rounded-full bg-white/70` (on a
pastel card) or `bg-pastel-*` (on a white card). This is the one unified
"highlight" motif — don't introduce a fourth variant.

### Sticker badges
`<StickerBadge icon label sublabel rotate delay />`
(`src/components/landing/StickerBadge.jsx`) — small white rounded-2xl chip
with a circular amber icon, used floating/overlapping photography (hero
collage, auth illustration panel). Rotate between -8 and 8 degrees, spring
entrance animation.

### Auth split-screen
`<AuthLayout maxWidth onBack>` (`src/components/auth/AuthLayout.jsx`) wraps
every authentication page (Login, Register, ForgotPassword, ResetPassword,
ActivateAccount, ChildLogin — and should be used for any future
auth-adjacent page). Left panel (`lg:` and up only) is the lavender
illustration panel with photo collage + sticker badge + checklist; right
panel is the actual form, capped at `maxWidth` (default `max-w-md`, Register
uses `max-w-xl` since it has paired fields). On mobile the illustration
panel is hidden (`hidden lg:flex`) and the page falls back to a single
centered column — pages using `AuthLayout` must render their own mobile
logo block behind a `lg:hidden` wrapper since the illustration panel (which
carries the logo on desktop) disappears. Pass `onBack` for a back-nav
chevron rendered above the form (both mobile and desktop) instead of the
old full-width colored header bar pattern.

**Container never scrolls as a whole** — `lg:h-screen lg:overflow-hidden` on
the outer wrapper, `lg:overflow-y-auto` on just the form panel. A tall form
scrolls internally without dragging the illustration panel along with it
(this was a real bug on Register — don't reintroduce `min-h-screen` on the
outer wrapper).

**Verify-email / referral are not separate routes.** They're inline steps
inside `RegisterPage`'s local `step` state (`'register' → 'verify' →
'referral'`), not their own pages — there used to be standalone
`/verify-email` and `/referral` routes/pages, both were deleted as
duplicate flows. Any entry point that needs the verify step (e.g. Login
redirecting an unverified account) navigates to `/register` with
`{ state: { step: 'verify', email } }` — `RegisterPage` seeds its initial
`step` and `formData.email` from `location.state`. Don't recreate standalone
routes for these steps.

### Marquee
Infinite horizontal scroll (`animate={{ x: ['0%', '-50%'] }}`, duplicate the
item list once) on a `bg-slate-900` strip. Always gate the animation behind
`useReducedMotion()` from Framer Motion — see below.

## Motion (Framer Motion)

- Page-load elements: fade+slide up (`initial={{opacity:0,y:24}}`,
  `animate={{opacity:1,y:0}}`), staggered ~0.1s apart.
- Scroll-triggered sections: `variants` with `hidden`/`show` keys, parent
  uses `whileInView="show"` + `viewport={{once:true, margin:'-100px'}}`,
  children use the same `fadeUp` variant object (reuse the `fadeUp`/`stagger`
  constants already defined in `LandingPage.jsx` rather than
  redefining per-page).
- Hover: `whileHover={{y:-4 to -6}}` on cards, `whileHover={{scale:1.02–1.04}}`
  on buttons. Never combine `whileHover` variant-keys with an unrelated
  `animate="someOtherKey"` on the same element — that conflict silently
  breaks the scroll-in animation (this happened once with the subject-card
  hover reveal; the fix was to move hover state to a plain CSS
  `group`/`group-hover` on the parent instead of stacking two Framer Motion
  interaction states on one element).
- Looping animations (marquee, floating logo) **must** check
  `useReducedMotion()` and skip the loop (pass `undefined` instead of the
  animate target) when true.

## File & naming conventions

- **Pages** live in `src/pages/`, one file per route, PascalCase, always
  suffixed `Page` (`LoginPage.jsx`, `AddChildPage.jsx`). The default export
  name matches the filename exactly.
- **Components** live in `src/components/<domain>/`, grouped by where
  they're used, not by type:
  - `components/landing/` — only used on the marketing landing page
    (`WaveDivider`, `StickerBadge`, `MobileNav`, `Footer`)
  - `components/auth/` — only used on auth-flow pages (`AuthLayout`, `AuthHero`)
  - `components/ui/` — generic, reusable anywhere (`AlertBanner`, `SubmitButton`,
    `IconInput`, `CodeInput`, `StepIndicator`)
  Same rule as pages: filename and default-export name match, PascalCase.
  If you build a one-off, page-specific piece of markup, it does not need
  its own file — only extract to `components/` once a second page needs the
  same pattern (this is how `AlertBanner`/`SubmitButton`/`IconInput` came to
  exist: they were copy-pasted across 6+ auth pages before being extracted).
- Don't add lowercase-filename components (`navbar.jsx`, `sections.jsx`
  existed briefly and were dead weight — deleted). Every component file is
  PascalCase to match its export.

## Component inventory

**Landing** (`src/components/landing/`)
- `WaveDivider.jsx` — section transition curve
- `StickerBadge.jsx` — floating rotated info chip
- `MobileNav.jsx` — hamburger + slide-down sheet nav
- `Footer.jsx` — 4-column dark footer (brand/social, explore links,
  subjects, contact) + bottom bar

**Auth** (`src/components/auth/`)
- `AuthLayout.jsx` — split-screen auth page wrapper (see Layout patterns above)
- `AuthHero.jsx` — the icon-circle + title + subtitle block at the top of an
  auth card (`<AuthHero icon iconBg iconColor title subtitle />`)

**UI primitives** (`src/components/ui/`) — used across auth pages and
anywhere else a form/status pattern repeats:
- `AlertBanner.jsx` — `<AlertBanner variant="success"|"error">message</AlertBanner>`,
  replaces the hand-rolled `rounded-xl bg-emerald-50/red-50` blocks that used
  to be copy-pasted into every form
- `SubmitButton.jsx` — `<SubmitButton loading loadingText variant="primary"|"amber">`,
  full-width pill button with a built-in `Loader2` spinner state. `type="submit"`
  by default; pass `type="button"` in props to override (e.g. the Child Login
  CTA on the login page)
- `IconInput.jsx` — `<IconInput icon={Mail} label type value onChange rightElement />`,
  the labeled leading-icon input pattern (`rightElement` slot for a
  password-visibility toggle button)
- `CodeInput.jsx` — centered, tracking-widest numeric/text code entry
  (verification codes, referral codes)
- `StepIndicator.jsx` — `<StepIndicator steps={[...]} currentIndex={n} />`,
  the numbered-circle progress bar used in Register's 3-step flow

When you need a new form pattern, check this list first — most auth-page
needs are already covered. Only build a new one-off if none of these fit.

## Accessibility rules

- Every form `<input>` needs a real `<label htmlFor>` (visually hidden with
  `sr-only` is fine) — placeholder text alone is not a label.
- Back-navigation icon buttons need `aria-label`.
- Any infinitely-looping animation must respect `prefers-reduced-motion`
  (see Motion section above).
- Mobile nav must be reachable — never `hidden md:flex` a nav with no
  fallback trigger (this was a real bug, now fixed via `MobileNav`).

## Known intentional deviations

- `SchoolsPage` is a full-bleed Google Maps utility page — it keeps a
  functional dark header bar and doesn't use the cream/pastel card system
  for the map controls, since it's a tool, not a content page. It still
  uses brand indigo instead of the old purple accent.
- `MockAttemptPage`'s question palette (`STATUS_STYLES`) uses raw
  `purple-500`/`purple-50` for "Marked for Review" and `emerald`/`orange`/`red`
  for other exam states — a deliberate exception to the "no raw purple"
  color rule. This is a functional exam-status convention shared across
  every major test-taking platform (Testbook, JEE/CAT portals, etc.), not a
  brand-color choice, and every status also carries a distinct icon
  (`Bookmark`/`CheckCircle2`/etc.) so it isn't color-only. Don't reskin this
  to pastel tokens — legibility and instant recognition matter more than
  palette consistency in an actual exam-taking screen.

## Removed pages — don't recreate these

A cleanup pass deleted genuinely dead/duplicate pages. If you're tempted to
add one of these back, check first — they were removed on purpose:

- **`WelcomePage.jsx`** — a mobile-app-style intro screen that duplicated
  `LandingPage`'s job (hero + "Get Started" CTA) in a lesser design. Nothing
  linked to it after `LandingPage` became the `/` route; deleted rather than
  left as an orphaned, unreachable page.
- **`VerifyEmailPage.jsx` / `ReferralPage.jsx`** — used to be standalone
  `/verify-email` and `/referral` routes duplicating steps that already
  existed inline inside `RegisterPage`'s `step` state. See the Auth
  split-screen section above for how verify/referral work now.
- The original pre-redesign `LandingPage.jsx` (indigo/purple gradient,
  centered generic-SaaS layout) — fully replaced by the current
  `LandingPage.jsx` (the file was renamed, not left as a second file).
- `src/components/ui/{Button,Card,FormInput,PageHeader,PageLayout}.jsx`,
  `src/components/navbar.jsx`, `src/components/sections.jsx` — an older,
  unused component set (different blue color scheme, never imported
  anywhere). Deleted rather than migrated, since the current `ui/` set
  (see Component inventory) already covers the same needs and matches the
  actual design system.
- `src/App.css`, `src/assets/{hero.png,react.svg,vite.svg}` — leftover Vite
  scaffold boilerplate, never referenced by any page.

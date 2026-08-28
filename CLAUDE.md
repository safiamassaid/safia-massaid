# Safia Massaid — Portfolio

Static portfolio site deployed to **Netlify** at `https://massaid-safia.netlify.app/`.

**There is no build step and no package manager.** The `.html` files in this repo are
exactly what ships. Node is used only by the generators in `tools/`, which write HTML
into the pages — they are developer conveniences, not a deployment dependency.

---

## Layout

```
index.html            Homepage — hero, about, services, experience, skills, projects, docs
projects.html         Full project archive (57), searchable and filterable
docs.html             Full documentation library (21 PDFs)
details/              18 case-study pages for development projects
designdetail/         10 case-study pages for UI/UX work
service/                4 service pages, all generated
doc/gp, doc/test      The PDFs themselves
assets/css/           main.css (site chrome) + portfolio.css (project/doc components)
assets/js/            main.js (header/mobile menu) + portfolio.js (everything else)
assets/data/          projects.js, docs.js — the single sources of truth
assets/img/           Screenshots and photography
tools/                Generators and the link checker
```

---

## The one rule that matters

**Never hand-edit a project or document card in the HTML.**

Cards are generated from `assets/data/projects.js` and `assets/data/docs.js` into
regions marked by sentinel comments:

```html
<!-- PF:PROJECTS:START -->   ...generated...   <!-- PF:PROJECTS:END -->
```

Edit the data file, then run the generator. Anything you type between the sentinels is
overwritten on the next run.

```bash
node tools/sync-header.js        # copies the header from index.html to all 35 other pages
node tools/build-cards.js        # cards, docs, footer, lightbox — all pages
node tools/build-detail-pages.js # shared chrome on the 28 case-study pages
node tools/build-service-pages.js# rebuilds the 4 service pages from their content blocks
node tools/build-seo.js          # every <head> meta tag + JSON-LD, all 35 pages
node tools/build-alt.js          # alt text + lazy loading on case-study images
node tools/build-sitemap.js      # sitemap.xml from the pages on disk
node tools/check-links.js        # verifies every local href/src — run before deploying
```

**index.html owns the header.** Edit it there and run `sync-header.js`; every other page
gets it with the right relative depth and its own nav item marked current. Editing a
header anywhere else is how the 35 copies drifted apart in the first place.

`build-cards.js` and `build-detail-pages.js` are idempotent — re-running them when
nothing changed reports `unchanged`.

### One list, one filter row

There are no Development/Design tabs. Every project lives in a single panel and
**UI/UX is a category chip like any other** — the row of chips under the heading is the
only control, matching the document tabs.

That forces one rule: **the homepage renders the whole list** — it just doesn't reveal all
of it. `HOME_STEP` in `build-cards.js` is 4, and the three featured spotlights are always
visible, so a visitor sees seven projects. Slicing the list to a curated dozen would make the
chips lie — "UI / UX Design (1)" next to 16 real design projects — and would drop the cards
out of the served markup Google reads. If the homepage ever needs to be longer or shorter,
change `HOME_STEP`; never slice the array.

The homepage panel is rendered with `more: false`, so it has no "Show more" pager: the way
forward is the **"View all 57 projects" button in the section header**, next to the title.
Same for the documents section and its "Open the library" button. The archive page keeps
its pager.

### One grid, three columns

There is no full-width spotlight any more. `renderFeatured` and the whole `.pf-featured`
component are gone: the first three projects each took a screen of their own, stacked above
a grid that was already three columns wide. Every project is a `.pf-card` now, and
`featured: true` in `projects.js` only decides running order.

The card absorbed what the spotlight used to show that it did not: the year in the eyebrow
(`Web Application · 2026`) and the `pf-metrics` pair (`v1.0 / Released`, `2 / QA reports`).
`.pf-metrics` used to be defined inside the `.pf-featured` block, so removing that block
silently unstyled it — it is a component of its own now, above `FILTER BAR`.

Breakpoints for `.pf-grid`: three columns, two under 1024px, one under **768px**. The 768
value has its own media query rather than joining the 720px block, which belongs to the
document grid and the footer.

### Adding a project

1. Add an entry to `assets/data/projects.js` (field docs are in the file header).
   `cat` picks the filter chip, `page` links a case study, `featured` promotes it to a
   spotlight (keep this to about three — one per kind of work).
2. `node tools/build-cards.js`
3. If it has a case-study page, `node tools/build-detail-pages.js` then
   `node tools/build-sitemap.js`.
4. `node tools/check-links.js`

The grids are **static HTML on purpose** — the site is indexed by Google and has a
sitemap, so cards must exist in the served markup. `projects.js` is loaded in the
browser only to drive prev/next navigation between case studies. Never render cards
from JavaScript at runtime.

---

## SEO: one generator owns every head

`tools/build-seo.js` writes the region

```html
<!-- PF:SEO:START -->   ...generated...   <!-- PF:SEO:END -->
```

into the `<head>` of all 35 pages: title, description, canonical, robots,
favicons, Open Graph, Twitter Card and JSON-LD. **No page carries a hand-written
meta tag any more** — the first run stripped them, and re-running rewrites the
region in place.

- The 8 fixed pages (home, projects, docs, the 4 service pages) get their title
  and description from `assets/data/seo.js`.
- The 28 case studies **derive** theirs from `assets/data/projects.js`, so a new
  project needs an entry there and nothing else. The generator searches
  combinations of the blurb and a suffix until one lands in the 48-62 character
  band for titles and 145-162 for descriptions, and warns about anything outside.
- `node tools/build-seo.js --check` reports without writing. It also flags
  duplicate titles or descriptions across the whole site.
- `build-detail-pages.js` deliberately no longer emits meta tags — it would
  declare each one twice. It handles stylesheets, breadcrumb and case nav only.

Loose text must never land inside `<head>`: the HTML parser closes the head at
the first non-whitespace character and pushes everything after it into the body.
That is why the "generated by" note sits in its own comment rather than trailing
the sentinel.

### The portrait

`images/safia-massaid-it-engineer.png` is the photograph, a cut-out with a real
alpha channel. It appears twice on purpose:

- visibly in the hero, standing in front of a plum arch drawn as a
  `.hero-portrait::before` pseudo-element
- as `Person.image` in the homepage JSON-LD, written as an `ImageObject` with
  width, height and caption — Google wants the dimensions before it will
  consider a photograph for a knowledge panel

The filename is descriptive rather than `safiaimg.png` because the file name is
one of the signals Google Images reads. Keep the two uses pointing at the same
file: a portrait in the markup that the structured data does not name is a much
weaker signal.

Structured data raises the odds; it does not force anything. Google decides
whether a name query gets a photograph, and it decides largely on whether the
same face and name recur across LinkedIn, GitHub and this site.

### The header bar

`.nav-item` is set in **Inter**, not Fira Code — it only looks monospace because
it is uppercase with wide tracking sitting between two things that genuinely are
mono (`.brand-role` and `.header-cta`). Softening it to 600/0.07em and colouring
it `--pf-ink-2` removed the machine-label read without touching the font.

Two accessibility fixes live in that bar and should not be undone:

- The resting nav colour and the hover/current colour used to be **isoluminant**
  (#6B5C63 vs #8C4A6B is 1.01:1) — "which page am I on" was carried by hue alone.
  `--pf-ink-2` against `--pf-accent` is a 2.04:1 luminance step, so the state
  survives greyscale.
- `.mobile-nav-link` was emitted on seven anchors per page and **styled nowhere**,
  and `sync-header.js` gives the mobile current item `nav-item is-current` without
  `nav-link` — so `.nav-link::after`, the rule carrying `content:''`, never fired
  there. The mobile current page now gets a left-edge bar instead of colour alone.

`.header-cta` sits at `10px 20px`: 20px is exactly `.pf-btn`'s horizontal padding
and `.pf-btn` is its typographic twin (10px Fira Code, .12em, uppercase), so the
ratio lands on the system's 2.0 rather than near it. **Vertical must stay 10px** —
this button is the tallest child of the bar and alone sets its 57px height, so
every 1px added here costs 2px of bar.

Dead CSS worth removing on the next pass: `.hero-stat__num` and
`.pf-nav-card__meta p` match zero pages.

### Language

Site content is English, so `<html lang>`, the metadata and `og:locale` are
English. `index.html` used to say `lang="fr"` while every other page said `en` —
that is fixed. Targeting French means translating the pages first, then flipping
`lang` / `locale` in `seo.js`; a French tag on English copy misleads Google and
makes screen readers mispronounce the whole page.

### h1

The 28 case-study pages had **no `<h1>` at all** — the project name lived in a
sidebar `<h2>`. `build-seo.js` inserts a screen-reader-only `<h1>` at the top of
`<main>` rather than touching 28 different hero designs. Give a page a visible
`<h1>` and the generator leaves it alone.

### Images

`tools/build-alt.js` wrote 168 alt descriptions and 196 `loading` attributes
across the case studies. The first image of a page stays `eager` with
`fetchpriority="high"` (it is the LCP); the rest are `lazy`. The lightbox `<img>`
keeps `alt=""` on purpose — `portfolio.js` fills it at runtime.

Share card: `images/og-cover.png` (1200x630) is rendered from `tools/og-cover.html`,
and the favicons from `tools/icon-source.html`, with headless Chrome:

```bash
chrome --headless=new --window-size=1200,630 --run-all-compositor-stages-before-draw \
       --screenshot=images/og-cover.png http://localhost:8080/tools/og-cover.html
```

`images/favicon.ico` is a 142-byte PNG-in-ICO built from `images/favicon-32.png`
— it replaced a 465 KB file that every visitor was downloading.

Three things keep the favicon reachable by Google's fetcher, and all three matter:

- **`/favicon.ico` exists at the repo root**, a copy of `images/favicon.ico`. The
  `<link rel="icon">` is the documented path, but Google's favicon crawler falls
  back to the root when it misses — and that URL used to 404.
- **`icon-192.png` is declared as a `rel="icon"`.** Google asks for a square
  favicon that is a multiple of 48px; the `.ico` is 32x32, under that bar, and the
  SVG has no intrinsic size. 192 is the only raster here that qualifies.
- **`_headers` sets the manifest MIME type.** Netlify serves `.webmanifest` as
  `application/octet-stream`, which Chrome refuses to parse.

Google reads one favicon per **domain**, from the home page, and caches it for
weeks — changing the icon is never visible in search the same day.

Both templates carry `noindex` and `tools/` is disallowed in `robots.txt`, because
everything in this repo ships to Netlify — including the folder of generators.

---

## Service pages

Four of them now, written whole on every run by `tools/build-service-pages.js`
from the `SERVICES` array at the top of that file. **Never hand-edit a page under
`service/`** — edit the array and re-run, then `build-seo.js` and `build-cards.js`.

| Page | Service |
|---|---|
| `service/service-details.html` | Web Development |
| `service/servicedes.html` | UI/UX Design |
| `service/servicegest.html` | Project Management |
| `service/servicetest.html` | QA & Testing |

Each page runs: page head → banner → intro + deliverables + process (left) with a
sticky track-record/tools/links/CTA rail (right) → "current focus" band → the
other three services. That last block is deliberate internal linking: every
service page points at the other three, so none of them is a dead end.

The deliverable cards reuse `.pmd-card` from the homepage rather than defining a
second look for the same idea. Page-specific layout lives under `svp-` in
`portfolio.css`.

### Copy rules

The `SERVICES` blocks are the site's only sales copy, so they are held to the
same standard as everything else here:

- **Claim nothing the site cannot show.** Every number in a "track record" panel
  and every example in the prose points at a real project or a real document —
  the two QA reports on the medical system, the Locust run on the Flask service,
  the ten delivery plans in the library.
- **`focus` is not a trend list.** It is three things that genuinely change the
  outcome in that discipline, each tied to work actually done here.
- No superlatives, no "passionate about", no invented metrics. A made-up "96%
  pass rate" in the QA banner was caught and replaced with the six reports that
  actually exist.

### Banners

`assets/img/service-{web,uiux,pm,qa}.png`, 1200x360, rendered from
`tools/service-banner.html?v=<key>` with headless Chrome:

```bash
chrome --headless=new --window-size=1200,360 --run-all-compositor-stages-before-draw \
       --screenshot=assets/img/service-web.png \
       http://localhost:8080/tools/service-banner.html?v=web
```

They are abstract diagrams — a window and a stack, three artboards, a Gantt, a
test run — drawn in the brand palette. That replaced three stock photographs
totalling **2.8 MB** with four graphics totalling **252 KB**, and it means the
banner says what the service is instead of showing an unrelated desk.

`assets/img/service.jpg`, `graphe.jpg` and `pexels-fauxels-3183153.jpg` are now
unreferenced and can be deleted.

---

## Netlify is case-sensitive

Netlify serves from Linux. `doc/gp/BookSwap.pdf` and `doc/gp/bookswap.pdf` are
different files there, but the same file on Windows — so a link can work locally and
404 in production. Three PDF links and one detail-page link had exactly this bug.

`tools/check-links.js` reports case mismatches separately from missing files. **Run it
before every deploy.** Filenames with spaces or accents are fine; the generators
percent-encode relative paths (`bénévolat.pdf` → `b%C3%A9n%C3%A9volat.pdf`) while
leaving absolute URLs alone.

---

## Design system

Brand colour is `#8C4A6B` (plum) and predates this code — keep it. Tokens live on
`:root` in `assets/css/portfolio.css`:

| Token | Role |
|---|---|
| `--pf-ink` `--pf-muted` `--pf-faint` | text, warmed slightly toward the plum |
| `--pf-line` `--pf-ground` `--pf-surface` | borders and grounds |
| `--pf-accent` `--pf-accent-deep` | the brand plum |
| `--pf-live` | semantic only — "live demo". Never decorative. |

The neutrals are deliberately hue-biased toward the accent rather than Tailwind's stock
slate. Use the tokens; don't introduce new literal colours.

**Type**: Inter for UI and body, Fira Code for labels/eyebrows/counters, and **Fraunces**
for project and case-study titles only — the work gets an editorial voice, the chrome
stays neutral. Inter and Fira Code load via `@import` in `main.css`; Fraunces via a
`<link>` in each page head.

**Components** are namespaced `pf-` so they never collide with Tailwind utilities.
Tailwind arrives from the CDN (`cdn.tailwindcss.com`) and is used for page scaffolding;
`pf-` classes carry the cards, filters, lightbox, footer and case-study chrome.

---

## JavaScript

`assets/js/portfolio.js` is one IIFE, no dependencies, driven entirely by data
attributes on static markup:

| Attribute | Does |
|---|---|
| `data-pf-filter` + `data-cat` | category chips, with live counts |
| `data-pf-search` / `data-pf-docsearch` | text search |
| `data-pf-step` / `data-pf-more` | progressive reveal |
| `data-pf-zoom` | opens the lightbox (Esc / ← / →, focus trapped) |
| `data-pf-count` | real totals, read from `PF_PROJECTS` |
| `data-pf-casenav` | prev/next between case studies |

Counters read `window.PF_PROJECTS`, not the DOM, so they stay correct even when a
filter or the progressive reveal is hiding most of the grid.

---

## Gotchas

- `main.css` used to carry a global `img { height: 100% !important }` that stretched
  every screenshot. It is gone; cards size images with `aspect-ratio` + `object-fit`.
  Don't reintroduce a global `img` rule.
- Every page uses `.glass-header`, `.hexa-logo` and `.nav-item`, which live in
  `main.css` — a page that forgets to link it renders the hexagon logo as a plain
  square and the nav unstyled. All 28 case-study pages had exactly this bug.
- Card and featured images set `object-position: top` (featured uses `top left`) so a
  site's logo and navigation stay in frame instead of being cropped away.
- `assets/img/service.jpg`, `graphe.jpg` and `pexels-fauxels-3183153.jpg` are 4000px
  originals (0.7–1.4 MB) used as ~1200×320 banners. They should be downscaled.
- `service/qovoltis.html` was removed at the owner's request. Its URL had already been
  submitted to Google in the sitemap, so `_redirects` 301s it to the web-development
  service page rather than leaving a 404. Do not re-add it without asking.
- Headless Chrome screenshots of this site need
  `--run-all-compositor-stages-before-draw`; without it large images photograph blank.
- Local preview: `python -m http.server 8080`. Relative paths need a server; opening
  the files directly with `file://` will not resolve them the same way.

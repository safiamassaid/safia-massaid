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
service/               4 service pages (3 services + the Qovoltis client case study)
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
node tools/build-service-pages.js# rebuilds the 3 service pages from their content blocks
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

That forces one rule: **the homepage renders the whole list**, revealed 9 at a time via
`HOME_STEP` in `build-cards.js`. Slicing the list to a curated dozen would make the chips
lie — "UI / UX Design (1)" next to 16 real design projects. If the homepage ever needs to
be shorter, lower `HOME_STEP`; never slice the array.

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
- `service/qovoltis.html` is a modal-style page with no site header, so `sync-header.js`
  skips it and reports it every run. That is expected, not a failure.
- Headless Chrome screenshots of this site need
  `--run-all-compositor-stages-before-draw`; without it large images photograph blank.
- Local preview: `python -m http.server 8080`. Relative paths need a server; opening
  the files directly with `file://` will not resolve them the same way.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Safia Massaid's portfolio: a static site deployed to **Netlify** at `https://massaid-safia.netlify.app/`.

**There is no build step and no package manager.** The `.html` files in this repo are
exactly what ships. Node is used only by the generators in `tools/`, which write HTML
into the pages — they are developer conveniences, not a deployment dependency.

---

## Contexte et règles de travail

Rédigé par Safia Massaid, à qui appartient ce site. **Ces règles priment sur tout le
reste de ce fichier.** Réponds-lui en français.

### Le projet

Portfolio personnel de Safia Massaid, en ligne sur https://massaid-safia.netlify.app/
(hébergé sur Netlify, déployé depuis le dépôt GitHub `safiamassaid/safia-massaid`).
Site en anglais. Sections : Hero, About, Services, Experience, Stack, Deliverables,
Selected work (grille filtrable), Documentation (21 documents), Contact.

Dans `index.html`, ces sections correspondent à `#home`, `#about`, `#services`,
`#experience`, `#skills` (Stack), `section.pmd` (Deliverables), `#projects` (Selected
work), `#docs` et `#contact`. Attention à l'ordre réel dans la page : `#contact` vient
juste après `#services`, avant `#experience`, et non à la fin.

### L'objectif

Je me repositionne comme **Technical Project Manager / IT Project Manager** (background
dev full-stack, UI/UX, QA). Le portfolio doit parler aux **recruteurs (Canada, pays du
Golfe)**, pas aux clients freelance.

Priorités, dans l'ordre : clarté du positionnement PM, référencement (SEO),
performance, accessibilité.

### Comment travailler avec moi

- Je ne code pas moi-même : explique-moi chaque changement en français simple, en une
  ou deux phrases.
- Avant toute modification importante, propose-moi un plan et attends mon accord.
  Un passage des générateurs de `tools/` peut réécrire jusqu'à 35 pages : il compte
  comme une modification importante.
- Ne touche pas au design global sans me demander.
- Garde les fichiers lourds (PDF, images) hors des modifications sauf demande
  explicite. Cela vaut aussi pour les re-rendus d'images décrits plus bas (og-cover,
  bannières, icônes) et pour la suppression des images inutilisées.
- Après chaque tâche, dis-moi comment vérifier le résultat en local
  (`python -m http.server 8093` à la racine du dépôt, puis http://localhost:8093/ dans
  le navigateur ; voir **Gotchas** pour le choix du port).

---

## Layout

```
index.html            Homepage — hero, about, services, experience, skills, projects, docs
projects.html         Full project archive (49), searchable and filterable
docs.html             Full documentation library (21 PDFs)
details/              18 case-study pages for development projects
designdetail/         10 case-study pages for UI/UX work
service/              4 service pages, all generated
doc/gp, doc/test      The PDFs themselves
assets/css/           main.css (site chrome) + portfolio.css (project/doc components)
assets/js/            main.js (header/mobile menu) + portfolio.js (everything else)
assets/data/          projects.js, docs.js, seo.js — the single sources of truth
assets/img/           Project screenshots + the four service banners
images/               Portrait, og-cover, favicon/icon set
tools/                Generators, the link checker, and three HTML render templates
```

That is 35 real pages: index, projects and docs, plus 28 case studies and 4 service
pages. `googlef60eb449e06e57e3.html` at the root is the Search Console ownership proof:
keep it, and keep it out of the sitemap. `assets/js/index.js` is loaded by no page. It
is left over from the old tab layout.

Total counts aren't fixed: the generators print the real ones
(`49 projects — 33 development, 16 design`), so trust that output over any number
in this file.

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

| Region | Owner | Where |
|---|---|---|
| `PROJECTS`, `DOCS` | `build-cards.js` | index.html |
| `ARCHIVE` | `build-cards.js` | projects.html |
| `DOCSARCHIVE` | `build-cards.js` | docs.html |
| `FOOTER`, `LIGHTBOX` | `build-cards.js` | all 35 pages |
| `SEO` | `build-seo.js` | all 35 `<head>`s |

`build-cards.js` renders document cards through `tools/doc-cards.js`, a module
rather than a standalone script.

```bash
node tools/sync-header.js         # copies the header from index.html to the 34 other pages
node tools/build-cards.js         # cards, docs, footer, lightbox — all pages
node tools/build-detail-pages.js  # stylesheets, breadcrumb, case nav on the 28 case studies
node tools/build-service-pages.js # rebuilds the 4 service pages from their content blocks
node tools/build-seo.js [--check] # every <head> meta tag + JSON-LD, all 35 pages
node tools/build-alt.js [--check] # alt text + lazy loading on case-study images
node tools/build-sitemap.js       # sitemap.xml from the pages on disk
node tools/build-icons.js <m>     # favicons + .ico, from the 512px masters
node tools/check-links.js         # verifies every local href/src — run before deploying
```

There are no tests and no linter. `--check` on build-seo and build-alt, plus
`check-links.js`, are the only verification, and all three write nothing.

### Run order

The generators overwrite each other's output, so order matters. The full pass is:

```bash
node tools/build-service-pages.js   # writes service/ whole, with an empty SEO region
node tools/sync-header.js           # marks "Services" current on those 4 pages
node tools/build-detail-pages.js
node tools/build-seo.js             # refills every SEO region
node tools/build-alt.js
node tools/build-cards.js           # refills footer + lightbox
node tools/build-sitemap.js
node tools/check-links.js
```

`build-service-pages.js` copies the header out of index.html as it is, with no
`is-current`, and its closing message tells you to run only build-seo and build-cards. If
you skip `sync-header.js` after it, the service pages ship with no nav item marked current.

**index.html owns the header.** Edit it there and run `sync-header.js`; every other page
gets it with the right relative depth and its own nav item marked current. Editing a
header anywhere else is how the copies drifted apart in the first place.

### Reading generator output on Windows

The generators are idempotent in content, but their reports can still say pages changed:

- This checkout has `core.autocrlf=true` and no `.gitattributes`, so pages arrive with
  CRLF line endings and the generators write LF. On the first run, `build-seo.js --check`
  reports all 35 pages as changed even when nothing has, and the regions they write
  come out with mixed line endings. Git normalises line endings on commit, so `git diff`
  is the real test of whether anything changed, not the generator's own report.
- `build-cards.js` prints `unchanged` per grid region, but `written footer x35` and
  `written lightbox x35` appear on every run, changed or not.

### One list, one filter row

There are no Development/Design tabs. Every project lives in a single panel and
**UI/UX is a category chip like any other** — the row of chips under the heading is the
only control, matching the document tabs.

That forces one rule: **the homepage renders the whole list** — it just doesn't reveal all
of it. `HOME_STEP` in `build-cards.js` is 6, so a visitor sees two full rows of the
three-column grid. Slicing the list to a curated dozen would make the
chips lie — "UI / UX Design (1)" next to 16 real design projects — and would drop the cards
out of the served markup Google reads. If the homepage ever needs to be longer or shorter,
change `HOME_STEP`; never slice the array.

The homepage panel is rendered with `more: false`, so it has no "Show more" pager: the way
forward is the **"View all projects" button in the section header**, next to the title.
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

1. Add an entry to `assets/data/projects.js` (field docs are in the file header, but
   two of them are stale: `track` no longer picks a tab, and `featured` no longer makes
   a spotlight). `cat` picks the filter chip, `page` links a case study, `metrics` adds
   the value/label pair to the card, and `featured` moves the project to the front of
   the grid (keep this to about three, one per kind of work).
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

- The 7 fixed pages (home, projects, docs, the 4 service pages) get their title
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

`images/safia-massaid.png` is the photograph, a cut-out with a real
alpha channel. It appears twice on purpose:

- visibly in the hero, standing in front of a **pale blue** arch (`#EEF3FF`)
  drawn as a `.hero-portrait::before` pseudo-element. This arch was rose first,
  and that is the interesting part: the hijab in the photograph is peach, so a
  rose arch put the same hue on both sides of the silhouette and the two blended
  into one pink mass. A cool ground is the hijab's complement, so the warm half
  of the portrait separates instead of dissolving, and the blazer is read against
  a tint of its own navy. **The warmth in this hero comes from the photograph, so
  the CSS does not supply any.** Don't "warm it up" — that is the bug, not a fix.
  Below about `#F4F7FF` the arch stops reading as a shape against the
  `--pf-ground` page, so it can't go much paler either.
  `tools/og-cover.html` repeats the same three values so the share card matches
  the page a click later — change one, change both
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
  (the old #6B5C63 against the old plum was 1.01:1) — "which page am I on" was
  carried by hue alone. There is a luminance step now, but it runs the **opposite
  way** from the plum era: the plum was lighter than the nav text, the navy is
  darker than any readable body colour. So the resting item is `--pf-nav-rest`
  (`#657090`, a mid-slate) and the current one is `--pf-accent`. Measured:
  **4.91:1** resting against the bar, **10.36:1** current, **2.11:1** between the
  two, so the state survives greyscale. Do not point `.nav-item` back at
  `--pf-ink-2` — it is near-black, and near-black against navy is 1.25:1.
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

**Ten image assets are baked from the palette and do not follow a CSS edit.** A
colour change is only half-done until they are re-rendered: `images/og-cover.png`,
the four `assets/img/service-*.png` banners, and the icon set
(`favicon.svg`, `favicon-32.png`, `icon-192.png`, `icon-512.png`,
`apple-touch-icon.png`, plus `favicon.ico` and its root copy — the last five come
from `tools/build-icons.js`, see below). Nothing in `check-links.js` catches a
banner that is still the old colour — it resolves fine, it is just wrong.

Share card: `images/og-cover.png` (1200x630) is rendered from `tools/og-cover.html`,
and the favicons from `tools/icon-source.html`, with headless Chrome:

```bash
chrome --headless=new --window-size=1200,630 --run-all-compositor-stages-before-draw \
       --screenshot=images/og-cover.png http://localhost:8080/tools/og-cover.html
```

`images/favicon.ico` is a ~390-byte PNG-in-ICO — a 6-byte header plus one
16-byte directory entry wrapped round `images/favicon-32.png`. It replaced a
465 KB file that every visitor was downloading. `tools/build-icons.js` emits it
and the root copy; don't hand-roll it.

### The icon set is one mark, and Chrome cannot render it small

The hexagon is the brand mark and it must be **the same hexagon** in three
places or the site ships two logos: `.hexa-logo` in `main.css` (a `clip-path` at
25/75/100/75/25/0 %), `images/favicon.svg`, and `tools/icon-source.html`. The
polygon `16,0 48,0 64,32 48,64 16,64 0,32` on a 64-unit viewBox is that
clip-path. They drifted once: the icon template drew the chevrons on a
**full-bleed navy square with no hexagon at all**, so every PNG and the `.ico`
disagreed with the SVG and the header.

That drift hid a second bug. **Headless Chrome on Windows cannot render a window
narrower than ~500px.** Ask for `--window-size=32,32` and it renders at the
minimum width and returns the top-left 32x32 **crop** — exiting 0 and reporting
"bytes written". For a centred hexagon that crop is a fully transparent tile; for
the old solid square it was still a solid square, which is why nobody noticed.

So Chrome renders **one 512px master per variant** and `tools/build-icons.js`
box-filters it down (better small sizes than Chrome's own 32px raster, too):

```bash
chrome --headless=new --window-size=512,512 --default-background-color=00000000 \
       --run-all-compositor-stages-before-draw \
       --screenshot=images/icon-512.png http://localhost:8080/tools/icon-source.html
chrome ... --screenshot=/tmp/apple-master.png \
       'http://localhost:8080/tools/icon-source.html?v=solid'
node tools/build-icons.js /tmp/apple-master.png
```

`--default-background-color=00000000` is required or Chrome composites the
hexagon onto white and the transparency is lost. `?v=solid` gives an opaque
white ground with the hexagon inset — **apple-touch-icon only**: iOS clips to a
rounded square and composites a transparent icon onto black, so Apple's icon
must carry its own ground. Everything else stays transparent.

The generator refuses to build from a bad master: a correct hexagon covers
**~75%** of its box (four 16x32 corner triangles removed from 64x64), so
anything outside 60-85% is assumed to be a Chrome crop and throws.

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
`service/`**. Edit the array and re-run, then run `sync-header.js`, `build-seo.js` and
`build-cards.js`, in that order (see **Run order**).

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

## The CV

`Safia_Massaid.pdf` at the root is the CV that the hero, the contact block and the
footer's "Download CV" link to. It is printed from `tools/cv.html` and is no longer a
Word export:

```bash
chrome --headless=new --no-pdf-header-footer \
       --print-to-pdf=Safia_Massaid.pdf http://localhost:8093/tools/cv.html
```

Edit the text in the template, never the PDF, and keep it to **one page**: Chrome
prints a second page without warning, so count pages after every edit. Every claim in
it must match `index.html`, the same way service copy has to (see **Copy rules**),
because a recruiter reads both. Title, years of experience, roles, dates and mobility
are the fields that drifted last time.

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

The palette is **two colours doing two different jobs**, taken from what the
owner actually wears in the hero portrait:

- **Navy `#1E3A8A`** — authority, structure, the engineering and project-management
  read. It carries everything structural: links, buttons, eyebrows, the dot grid,
  the current nav item, focus rings.
- **Rose `#F472B6`** — the counterweight, and it appears on **dark grounds
  only**. See below; the rule is narrower than it looks.

It replaced a plum `#8C4A6B` that predated the code. That swap is done — 266
literals across 44 files — so there should be no plum left anywhere; if you find
some, it is a bug, not a survivor.

Tokens live on `:root` in `assets/css/portfolio.css`:

| Token | Role |
|---|---|
| `--pf-ink` `--pf-muted` `--pf-faint` | text, cooled slightly toward the navy |
| `--pf-line` `--pf-ground` `--pf-surface` | borders and grounds |
| `--pf-accent` `--pf-accent-deep` | the brand navy |
| `--pf-rose` `--pf-rose-line` | the warm counterweight, dark grounds only |
| `--pf-nav-rest` | resting header nav — see **The header bar** |
| `--pf-live` | semantic only — "live demo". Never decorative. |

The neutrals are deliberately hue-biased toward the accent rather than Tailwind's stock
slate. Use the tokens; don't introduce new literal colours.

### Where the rose is allowed

**On dark grounds, and nowhere else.** That is the whole rule, and it has a
reason behind it rather than being a quota: the navy cannot separate itself from
a navy slab, so the footer and the two dark panels (`.ct-pitch`, `.svp-next`)
need a second colour or they read as one dead surface. On a light ground the
navy separates perfectly well, so there is nothing for the rose to do there.

That comes to the footer's hexagon mark, its top hairline, its mail and social
hovers and focus ring, and the corner blooms on the three dark panels. If you are
about to put rose on a white ground, you are about to make the site pink.

Two things to know before touching it:

- **`--pf-rose` never carries text or a lone icon on a light ground** — it is
  2.65:1 on white. If rose type is ever needed the value is `#A83070` (6.3:1);
  don't darken `#F472B6` by eye.
- **An accent-coloured bloom on a dark panel has to be rose, not navy.** Under the
  plum the accent was a mid-tone, so a plum bloom lifted a near-black slab. The
  navy is dark: a navy bloom on a navy slab is the same dead slab. That trap
  caught the footer's hexagon mark, its top hairline, the mail hover, the social
  hover and the focus ring — five things, all navy-on-navy for a moment.

**The hero has no rose at all, on purpose** — see **The portrait** above. That was
the obvious place for it and it was wrong.

**Never introduce a third hue.** Every colour on the page is navy, rose, a neutral
biased toward the navy, or `--pf-live`.

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
| `data-pf-doctab` + `data-pf-docpanel` | document category tabs |
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
- Card images set `object-position: top center` so a site's logo and navigation stay
  in frame instead of being cropped away.
- `build-sitemap.js` takes each `<lastmod>` from the file's modification time on disk.
  A clone, checkout or bulk generator run sets those times all at once. In the
  committed sitemap all 35 entries say `2026-09-09`. Treat `lastmod` as "when this
  checkout last touched the file", not as when the content changed.
- Hand-written counts outside the sentinels go stale. Right now `index.html` still says
  `41` development projects in its served markup, where the real figure is 33.
  `portfolio.js` corrects it at runtime, but Google and no-JS visitors read the stale
  number.
- `service/qovoltis.html` was removed at the owner's request. Its URL had already been
  submitted to Google in the sitemap, so `_redirects` 301s it to the web-development
  service page rather than leaving a 404. Do not re-add it without asking.
- Headless Chrome screenshots of this site need
  `--run-all-compositor-stages-before-draw`; without it large images photograph blank.
- Local preview: `python -m http.server <port>`. Relative paths need a server; opening
  the files directly with `file://` will not resolve them the same way. **On the owner's
  machine Docker already listens on 8080 and 8000**, and `localhost:8080` answers
  `Not found.` instead of serving the site. Use 8093. The `:8080` URLs in the Chrome
  commands above need the same substitution.

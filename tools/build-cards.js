#!/usr/bin/env node
/* ============================================================
   build-cards.js
   ------------------------------------------------------------
   Generates the static project markup from assets/data/projects.js
   and splices it into the pages between sentinel comments:

       <!-- PF:<REGION>:START -->  ...generated...  <!-- PF:<REGION>:END -->

   The output is plain HTML committed to the repo — the site has no
   build step and the grids must stay crawlable. Re-run this after
   editing assets/data/projects.js:

       node tools/build-cards.js

   Regions written:
     PROJECTS   #projects panels on index.html (curated selection)
     ARCHIVE    the full grid on projects.html
     FOOTER     shared footer, on every page that carries a sentinel
     LIGHTBOX   the lightbox dialog, on every page with a sentinel
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NL = String.fromCharCode(10);
const PROJECTS = require(path.join(ROOT, 'assets/data/projects.js'));
const makeDocs = require('./doc-cards.js');

/* The homepage renders every project so the category filters report real
   counts, but only reveals HOME_STEP of them. The grid is three columns
   wide, so 6 fills two complete rows with no orphan. Slicing the array
   instead would make "UI / UX Design (1)" appear next to 16 actual design
   projects, and would drop the cards out of the markup Google reads.
   Everything past the fold is one click away in the archive, linked from
   the section header. */
const HOME_STEP = 6;

/* ============================================================
   Helpers
   ============================================================ */

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* Encode a RELATIVE path for use in an href/src: keeps the slashes but
   escapes spaces and accents, so filenames like "rapport_tests 2.pdf"
   and "bénévolat.pdf" resolve on a case-sensitive host.
   Absolute URLs are already encoded — passing them through would turn
   "https://" into "https%3A//". */
const isAbsolute = (p) => /^(https?:)?\/\//i.test(p) || /^(mailto|tel):/i.test(p);

const url = (p) => (isAbsolute(p) ? p : p.split('/').map(encodeURIComponent).join('/'));

const rel = (base, p) => (!p ? '' : isAbsolute(p) ? p : base + url(p));

const { renderDocs } = makeDocs({ esc, rel });

/* Searchable haystack — lower-cased so the filter can do a plain indexOf */
const haystack = (p) =>
  [p.title, p.catLabel, p.desc, p.year, ...(p.stack || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/* The card's primary destination, most specific first */
function primary(p) {
  if (p.page) return { href: p.page, label: 'Case study', icon: 'bi-arrow-right', internal: true };
  if (p.live) return { href: p.live, label: 'Live demo', icon: 'bi-arrow-up-right', internal: false };
  if (p.repo) return { href: p.repo, label: 'Source', icon: 'bi-arrow-up-right', internal: false };
  if (p.figma) return { href: p.figma, label: 'Open in Figma', icon: 'bi-arrow-up-right', internal: false };
  return null;
}

/* Secondary actions — everything that isn't already the primary */
function secondary(p) {
  const out = [];
  const first = primary(p);
  const add = (href, label, icon) => {
    if (href && (!first || first.href !== href)) out.push({ href, label, icon });
  };
  add(p.live, 'Live demo', 'bi-arrow-up-right');
  add(p.repo, 'Source', 'bi-github');
  add(p.figma, 'Figma', 'bi-arrow-up-right');
  return out;
}

function badge(p) {
  if (p.live) return { cls: 'pf-card__badge--live', text: 'Live' };
  if (p.page) return { cls: 'pf-card__badge--case', text: 'Case study' };
  if (p.repo) return { cls: '', text: 'Source' };
  if (p.figma) return { cls: '', text: 'Figma' };
  return { cls: '', text: 'Preview' };
}

function zoomButton(p, base, indent) {
  return [
    `${indent}<button class="pf-card__zoom" type="button"`,
    `${indent}        data-pf-zoom="${esc(rel(base, p.thumb))}"`,
    `${indent}        data-pf-caption="${esc(p.title)}"`,
    `${indent}        aria-label="Preview ${esc(p.title)} screenshot">`,
    `${indent}  <i class="bi bi-arrows-angle-expand" aria-hidden="true"></i>`,
    `${indent}</button>`
  ].join('\n');
}

function chips(p, indent) {
  if (!p.stack || !p.stack.length) return '';
  const items = p.stack
    .slice(0, 4)
    .map((s) => `${indent}  <li class="pf-chip">${esc(s)}</li>`)
    .join('\n');
  return `${indent}<ul class="pf-chips">\n${items}\n${indent}</ul>`;
}

function actions(p, base, indent) {
  const first = primary(p);
  const rest = secondary(p);
  const rows = [];

  if (first) {
    const target = first.internal ? '' : ' target="_blank" rel="noopener"';
    rows.push(
      `${indent}<a class="pf-action pf-action--primary" href="${esc(rel(base, first.href))}"${target}>` +
        `${esc(first.label)} <i class="bi ${first.icon}" aria-hidden="true"></i></a>`
    );
  } else {
    rows.push(
      `${indent}<button class="pf-action pf-action--primary" type="button" ` +
        `data-pf-zoom="${esc(rel(base, p.thumb))}" data-pf-caption="${esc(p.title)}">` +
        `Preview <i class="bi bi-arrows-angle-expand" aria-hidden="true"></i></button>`
    );
  }

  rest.forEach((a) => {
    rows.push(
      `${indent}<a class="pf-action" href="${esc(a.href)}" target="_blank" rel="noopener">` +
        `${esc(a.label)} <i class="bi ${a.icon}" aria-hidden="true"></i></a>`
    );
  });

  return rows.join('\n');
}

/* ============================================================
   Card
   ============================================================ */

/* The version / QA-report pair the spotlights used to show. Now that every
   project renders as a card, the card carries it when the data has it. */
function metricsList(p, i) {
  const rows = (p.metrics || [])
    .map((m) => `${i}  <li><b>${esc(m.value)}</b><span>${esc(m.label)}</span></li>`)
    .join(NL);
  return rows ? `${i}<ul class="pf-metrics">${NL}${rows}${NL}${i}</ul>` : '';
}

function renderCard(p, base, pad) {
  const i = ' '.repeat(pad);
  const b = badge(p);
  const first = primary(p);

  // Preview-only cards make the title a button so the whole card is still
  // a single, keyboard-reachable target — it just opens the lightbox.
  const titleInner = first
    ? `<a class="pf-card__link" href="${esc(rel(base, first.href))}"${
        first.internal ? '' : ' target="_blank" rel="noopener"'
      }>${esc(p.title)}</a>`
    : `<button class="pf-card__link" type="button" data-pf-zoom="${esc(
        rel(base, p.thumb)
      )}" data-pf-caption="${esc(p.title)}">${esc(p.title)}</button>`;

  return [
    `${i}<article class="pf-card" data-cat="${esc(p.cat)}" data-search="${esc(haystack(p))}">`,
    `${i}  <div class="pf-card__media">`,
    `${i}    <img src="${esc(rel(base, p.thumb))}"`,
    `${i}         alt="${esc(p.title)} — ${esc(p.catLabel)} interface"`,
    `${i}         loading="lazy" decoding="async">`,
    zoomButton(p, base, `${i}    `),
    `${i}    <span class="pf-card__badge ${b.cls}">${esc(b.text)}</span>`,
    `${i}  </div>`,
    `${i}  <div class="pf-card__body">`,
    `${i}    <p class="pf-eyebrow">${esc(p.catLabel)} &middot; ${esc(p.year)}</p>`,
    `${i}    <h3 class="pf-card__title">${titleInner}</h3>`,
    `${i}    <p class="pf-card__desc">${esc(p.desc)}</p>`,
    chips(p, `${i}    `),
    metricsList(p, `${i}    `),
    `${i}  </div>`,
    `${i}  <div class="pf-card__foot">`,
    actions(p, base, `${i}    `),
    `${i}  </div>`,
    `${i}</article>`
  ]
    .filter(Boolean)
    .join('\n');
}

/* ============================================================
   Filter bar
   ============================================================ */

const FILTERS = [
  { key: 'all', label: 'All', icon: 'bi-grid' },
  { key: 'webapp', label: 'Web apps', icon: 'bi-window-stack' },
  { key: 'website', label: 'Websites', icon: 'bi-globe2' },
  { key: 'desktop', label: 'Desktop', icon: 'bi-pc-display' },
  { key: 'mobile', label: 'Mobile', icon: 'bi-phone' },
  { key: 'backend', label: 'Backend & QA', icon: 'bi-hdd-network' },
  { key: 'uiux', label: 'UI / UX Design', icon: 'bi-palette' }
];

function renderFilters(pad, withSearch) {
  const i = ' '.repeat(pad);

  const buttons = FILTERS.map(
    (f) =>
      `${i}  <button class="pf-filter" type="button" role="tab" data-pf-filter="${f.key}"` +
      ` aria-pressed="${f.key === 'all' ? 'true' : 'false'}"` +
      ` aria-selected="${f.key === 'all' ? 'true' : 'false'}">` +
      `<i class="bi ${f.icon}" aria-hidden="true"></i> ${f.label}` +
      ` <span class="pf-filter__n"></span></button>`
  ).join(NL);

  const search = withSearch
    ? [
        `${i}  <div class="pf-search">`,
        `${i}    <i class="bi bi-search" aria-hidden="true"></i>`,
        `${i}    <label class="pf-sr" for="pf-search-input">Search projects</label>`,
        `${i}    <input id="pf-search-input" type="search" data-pf-search` +
          ` placeholder="Search projects, tech, year...">`,
        `${i}  </div>`
      ].join(NL)
    : '';

  return [
    `${i}<div class="pf-filterbar" role="tablist" aria-label="Project category">`,
    buttons,
    search,
    `${i}</div>`
  ]
    .filter(Boolean)
    .join(NL);
}

/* ============================================================
   Panel
   ============================================================ */

function renderPanel(opts) {
  const {
    base = '',
    pad = 6,
    limit = 0,
    step = 0,
    withSearch = false,
    // The homepage is a selection, not a pager: its way forward is the
    // archive link in the section header, so it gets no "show more".
    more = true
  } = opts;
  const i = ' '.repeat(pad);

  // One list. UI/UX is a category chip, not a separate tab — the visitor
  // filters instead of choosing a track first.
  // One grid, three columns. The spotlights used to be full-width rows
  // stacked above it, which meant the first three projects each took a
  // screen of their own. `featured` now only decides running order.
  let grid = PROJECTS.filter((p) => p.featured)
    .concat(PROJECTS.filter((p) => !p.featured));
  if (limit) grid = grid.slice(0, limit);

  return [
    `${i}<div data-pf-panel="all" data-pf-label="projects"${step ? ` data-pf-step="${step}"` : ''}>`,
    renderFilters(pad + 2, withSearch),
    `${i}  <div class="pf-grid">`,
    grid.map((p) => renderCard(p, base, pad + 4)).join(NL + NL),
    `${i}  </div>`,
    `${i}  <div class="pf-empty" data-pf-empty>`,
    `${i}    <i class="bi bi-search" aria-hidden="true"></i>`,
    `${i}    <p>No project matches that filter yet. Try another category or clear the search.</p>`,
    `${i}  </div>`,
    step && more
      ? [
          `${i}  <div class="pf-more-wrap" data-pf-more-wrap>`,
          `${i}    <button class="pf-more" type="button" data-pf-more>`,
          `${i}      Show <span data-pf-more-count></span> more <i class="bi bi-arrow-down" aria-hidden="true"></i>`,
          `${i}    </button>`,
          `${i}  </div>`
        ].join(NL)
      : '',
    `${i}</div>`
  ]
    .filter(Boolean)
    .join(NL);
}

/* ============================================================
   Footer + lightbox
   ============================================================ */

function renderFooter(base, pad) {
  const i = ' '.repeat(pad);
  const year = 2026; // stamped, not computed — keeps output deterministic
  const home = base + 'index.html';

  /* Three link columns, described once so the markup below stays flat */
  const columns = [
    ['Work', [
      ['All projects', base + 'projects.html'],
      ['UI / UX design', base + 'projects.html#design'],
      ['Documentation', base + 'docs.html']
    ]],
    ['Services', [
      ['Web development', base + 'service/service-details.html'],
      ['UI / UX design', base + 'service/servicedes.html'],
      ['Project management', base + 'service/servicegest.html'],
      ['QA & testing', base + 'service/servicetest.html'],
      ['Start a project', home + '#contact']
    ]],
    ['Profile', [
      ['About', home + '#about'],
      ['Experience', home + '#experience'],
      ['Skills', home + '#skills'],
      ['Contact', home + '#contact']
    ]]
  ];

  const nav = columns
    .map(([title, links]) => `${i}      <nav class="pf-footer__col" aria-label="${title}">
${i}        <h4>${title}</h4>
${i}        <ul>
${links.map(([label, href]) => `${i}          <li><a href="${href}">${label}</a></li>`).join('\n')}
${i}        </ul>
${i}      </nav>`)
    .join('\n\n');

  return `${i}<footer class="pf-footer">
${i}  <div class="pf-footer__inner">
${i}    <div class="pf-footer__top">

${i}      <div class="pf-footer__brand">
${i}        <a class="pf-footer__lockup" href="${home}#home" aria-label="Safia Massaid — home">
${i}          <svg class="pf-footer__mark" viewBox="0 0 64 64" aria-hidden="true">
${i}            <polygon points="16,0 48,0 64,32 48,64 16,64 0,32" fill="currentColor"/>
${i}            <g fill="none" stroke="#1C1418" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
${i}              <polyline points="40,48 52,32 40,16"/>
${i}              <polyline points="24,16 12,32 24,48"/>
${i}            </g>
${i}          </svg>
${i}          <span>
${i}            <h3>Safia Massaid</h3>
${i}            <span class="pf-footer__role">IT Engineer &amp; Project Manager</span>
${i}          </span>
${i}        </a>

${i}        <p>I build web, desktop and mobile products end to end — from specification and
${i}          architecture through to testing, documentation and release.</p>

${i}        <a class="pf-footer__mail" href="mailto:massaidsafia2@gmail.com">
${i}          <i class="bi bi-envelope" aria-hidden="true"></i> massaidsafia2@gmail.com
${i}        </a>

${i}        <div class="pf-footer__social">
${i}          <a href="https://github.com/safiamassaid" target="_blank" rel="noopener" aria-label="GitHub"><i class="bi bi-github" aria-hidden="true"></i></a>
${i}          <a href="https://gitlab.com/safia1704832" target="_blank" rel="noopener" aria-label="GitLab"><i class="bi bi-gitlab" aria-hidden="true"></i></a>
${i}          <a href="https://www.linkedin.com/in/safia-massaid/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a>
${i}          <a href="mailto:massaidsafia2@gmail.com" aria-label="Email"><i class="bi bi-envelope" aria-hidden="true"></i></a>
${i}        </div>
${i}      </div>

${nav}

${i}    </div>

${i}    <div class="pf-footer__bottom">
${i}      <p>&copy; ${year} Safia Massaid — All rights reserved.</p>
${i}      <span class="pf-footer__status">Available for new projects</span>
${i}      <a class="pf-footer__top-link" href="#home">
${i}        Back to top <i class="bi bi-arrow-up" aria-hidden="true"></i>
${i}      </a>
${i}    </div>
${i}  </div>
${i}</footer>`;
}

function renderLightbox(pad) {
  const i = ' '.repeat(pad);
  return `${i}<div class="pf-lightbox" id="pf-lightbox" role="dialog" aria-modal="true"
${i}     aria-label="Project screenshot" aria-hidden="true">
${i}  <div class="pf-lightbox__frame">
${i}    <button class="pf-lightbox__btn pf-lightbox__close" type="button"
${i}            data-pf-lightbox-close aria-label="Close preview">
${i}      <i class="bi bi-x-lg" aria-hidden="true"></i>
${i}    </button>
${i}    <img class="pf-lightbox__img" data-pf-lightbox-img src="" alt="">
${i}    <div class="pf-lightbox__bar">
${i}      <p class="pf-lightbox__caption" data-pf-lightbox-caption></p>
${i}      <div class="pf-lightbox__nav" data-pf-lightbox-nav>
${i}        <span class="pf-lightbox__count" data-pf-lightbox-count></span>
${i}        <button class="pf-lightbox__btn" type="button" data-pf-lightbox-prev aria-label="Previous project">
${i}          <i class="bi bi-chevron-left" aria-hidden="true"></i>
${i}        </button>
${i}        <button class="pf-lightbox__btn" type="button" data-pf-lightbox-next aria-label="Next project">
${i}          <i class="bi bi-chevron-right" aria-hidden="true"></i>
${i}        </button>
${i}      </div>
${i}    </div>
${i}  </div>
${i}</div>`;
}

/* ============================================================
   Splicing
   ============================================================ */

function splice(file, region, content) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return false;

  const src = fs.readFileSync(full, 'utf8');
  const open = `<!-- PF:${region}:START -->`;
  const close = `<!-- PF:${region}:END -->`;
  const a = src.indexOf(open);
  const b = src.indexOf(close);
  if (a === -1 || b === -1) return false;

  const out = src.slice(0, a + open.length) + '\n' + content + '\n' + src.slice(b);
  if (out !== src) {
    fs.writeFileSync(full, out, 'utf8');
    return true;
  }
  return 'unchanged';
}

/* ============================================================
   Run
   ============================================================ */

function main() {
  const report = [];

  // --- Homepage: curated selection, no search, no pagination ---
  const home = renderPanel({ pad: 6, step: HOME_STEP, more: false });
  report.push(['index.html', 'PROJECTS', splice('index.html', 'PROJECTS', home)]);

  // --- Archive: everything, searchable, paginated ---
  const archive = renderPanel({ pad: 6, step: 12, withSearch: true });
  report.push(['projects.html', 'ARCHIVE', splice('projects.html', 'ARCHIVE', archive)]);

  // --- Documents: compact on the homepage, full text on the archive ---
  report.push(['index.html', 'DOCS',
    splice('index.html', 'DOCS', renderDocs({ pad: 8 }))]);
  report.push(['docs.html', 'DOCSARCHIVE',
    splice('docs.html', 'DOCSARCHIVE',
      renderDocs({ pad: 6, withDesc: true, withSearch: true }))]);

  // --- Shared chrome, on every page that opted in ---
  const pages = [
    ...['index.html', 'projects.html', 'docs.html'].map((f) => [f, '']),
    ...fs
      .readdirSync(path.join(ROOT, 'details'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => ['details/' + f, '../']),
    ...fs
      .readdirSync(path.join(ROOT, 'designdetail'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => ['designdetail/' + f, '../']),
    ...fs
      .readdirSync(path.join(ROOT, 'service'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => ['service/' + f, '../'])
  ];

  let footers = 0;
  let boxes = 0;
  pages.forEach(([file, base]) => {
    if (splice(file, 'FOOTER', renderFooter(base, 2))) footers++;
    if (splice(file, 'LIGHTBOX', renderLightbox(2))) boxes++;
  });

  report.forEach(([file, region, res]) => {
    console.log(
      `${res === true ? 'written  ' : res === 'unchanged' ? 'unchanged' : 'SKIPPED  '} ${file} [${region}]`
    );
  });
  console.log(`written   footer  x${footers}`);
  console.log(`written   lightbox x${boxes}`);
  console.log(
    `\n${PROJECTS.length} projects — ` +
      `${PROJECTS.filter((p) => p.track === 'dev').length} development, ` +
      `${PROJECTS.filter((p) => p.track === 'design').length} design`
  );
}

main();

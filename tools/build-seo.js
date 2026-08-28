#!/usr/bin/env node
/* ============================================================
   build-seo.js
   ------------------------------------------------------------
   Owns every SEO tag on every page. Rewrites the region

       <!-- PF:SEO:START -->  …  <!-- PF:SEO:END -->

   inside <head>: title, description, canonical, robots, favicons,
   Open Graph, Twitter Card and JSON-LD. Also normalises <html lang>
   and guarantees exactly one <h1> per case-study page.

   Titles and descriptions for index/projects/docs/service pages come
   from assets/data/seo.js. The 28 case studies derive theirs from
   assets/data/projects.js, so adding a project needs no new metadata.

   On the first run it strips the older hand-written meta tags it is
   replacing, so nothing ends up declared twice.

       node tools/build-seo.js
       node tools/build-seo.js --check     (report only, writes nothing)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEO = require(path.join(ROOT, 'assets/data/seo.js'));
const PROJECTS = require(path.join(ROOT, 'assets/data/projects.js'));

const CHECK = process.argv.includes('--check');
const SITE = SEO.site;
const START = '<!-- PF:SEO:START -->';
const END = '<!-- PF:SEO:END -->';

const TITLE_MIN = 48, TITLE_MAX = 62;
const DESC_MIN = 145, DESC_MAX = 162;

const warnings = [];

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Percent-encode path segments but leave the scheme alone */
const urlOf = (rel) => SITE + rel.split('/').map(encodeURIComponent).join('/');

const squash = (s) => String(s).replace(/\s+/g, ' ').trim();

/* Cut on a word boundary so a title never ends mid-word */
function clamp(text, max) {
  const s = squash(text);
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:—-]$/, '') + '…';
}

/* Descriptions are read by humans in the search results, so an overlong
   one is cut at the end of a clause and closed with a full stop rather
   than trailing off mid-sentence with an ellipsis. */
function clampSentence(text, min, max) {
  const s = squash(text);
  if (s.length <= max) return s;

  const window = s.slice(0, max);
  let best = -1;
  ['; ', ' — ', ' – '].forEach((sep) => {
    const at = window.lastIndexOf(sep);
    if (at > best) best = at;
  });
  const dot = window.lastIndexOf('. ');
  if (dot > min) return s.slice(0, dot + 1);

  if (best >= min) return s.slice(0, best).replace(/[,;:—–\s]+$/, '') + '.';
  return clamp(s, max);
}

/* Pick the candidate that lands in the band, else the closest to it */
function pick(candidates, min, max) {
  const inBand = candidates.filter((c) => c.length >= min && c.length <= max);
  if (inBand.length) return inBand.sort((a, b) => b.length - a.length)[0];
  const mid = (min + max) / 2;
  return candidates.slice().sort(
    (a, b) => Math.abs(a.length - mid) - Math.abs(b.length - mid)
  )[0];
}

/* ------------------------------------------------------------
   Derived metadata for the 28 case studies
   ------------------------------------------------------------ */

function caseTitle(p) {
  const n = SEO.name;
  return pick([
    `${p.title} (${p.year}) — ${p.catLabel} Case Study | ${n}`,
    `${p.title} — ${p.catLabel} Case Study | ${n}`,
    `${p.title} — ${p.catLabel} Project | ${n}`,
    `${p.title} (${p.year}) — ${p.catLabel} | ${n}`,
    `${p.title} — ${p.catLabel} | ${n}`,
    `${p.title} — Case Study | ${n}`,
    `${p.title} | ${n}`
  ].map((t) => clamp(t, TITLE_MAX)), TITLE_MIN, TITLE_MAX);
}

/* Whole-sentence variants of a project blurb: the long version, the short
   one-liner, and each cumulative prefix of the long version. Never cuts on
   a comma — doing that truncates an enumeration into nonsense
   ("patient files." out of "patient files, appointments, prescriptions"). */
function baseVariants(p) {
  const long = squash(p.long || p.desc);
  const short = squash(p.desc);
  const out = [long, short];

  let acc = '';
  long.split(/(?<=\.)\s+/).forEach((sentence) => {
    acc = acc ? acc + ' ' + sentence : sentence;
    if (acc !== long) out.push(acc);
  });

  return out.filter((v, i, a) => v && a.indexOf(v) === i);
}

function caseDescription(p) {
  const base = squash(p.long || p.desc);
  const stack3 = (p.stack || []).slice(0, 3).join(', ');
  const stack2 = (p.stack || []).slice(0, 2).join(' and ');

  const tails = [
    ` ${p.catLabel} built with ${stack3} (${p.year}) — case study by ${SEO.name}, IT engineer.`,
    ` ${p.catLabel} built with ${stack3} (${p.year}) — case study by ${SEO.name}.`,
    ` ${p.catLabel} built with ${stack3}, ${p.year} — case study by ${SEO.name}.`,
    ` ${p.catLabel} built with ${stack2} (${p.year}) — case study by ${SEO.name}.`,
    ` ${p.catLabel}, ${p.year} — case study by ${SEO.name}, IT engineer.`,
    ` ${p.catLabel} built with ${stack3}, ${p.year}.`,
    ` ${p.catLabel} built with ${stack2}, ${p.year}.`,
    ` ${p.catLabel}, ${p.year}. Case study by ${SEO.name}.`,
    ` ${p.catLabel} case study by ${SEO.name}, ${p.year}.`,
    ` ${p.catLabel} case study, ${p.year}.`,
    ` ${p.catLabel} project, ${p.year}.`,
    ` ${p.catLabel}, ${p.year}.`,
    ''
  ];

  // Every clause-length of the blurb crossed with every tail; the picker
  // keeps whichever combination lands in the 145-162 band.
  const candidates = [];
  baseVariants(p).forEach((b) => {
    tails.forEach((t) => candidates.push(squash(b + t)));
  });

  return clampSentence(pick(candidates, DESC_MIN, DESC_MAX), DESC_MIN, DESC_MAX);
}

/* ------------------------------------------------------------
   The page list
   ------------------------------------------------------------ */

const byPage = new Map(PROJECTS.filter((p) => p.page).map((p) => [p.page, p]));

function collectPages() {
  const out = [];

  Object.keys(SEO.pages).forEach((file) => {
    const cfg = SEO.pages[file];
    out.push({
      file,
      title: cfg.title,
      description: cfg.description,
      type: cfg.type || 'website',
      image: cfg.image || SEO.ogImage,
      imageAlt: cfg.imageAlt || SEO.ogImageAlt,
      priority: cfg.priority,
      changefreq: cfg.changefreq,
      kind: file === 'index.html' ? 'home' : (file.startsWith('service/') ? 'service' : 'collection')
    });
  });

  ['details', 'designdetail'].forEach((dir) => {
    fs.readdirSync(path.join(ROOT, dir))
      .filter((f) => f.endsWith('.html'))
      .sort()
      .forEach((f) => {
        const file = dir + '/' + f;
        const p = byPage.get(file);
        if (!p) {
          warnings.push(`${file} — aucune entrée dans projects.js, page ignorée`);
          return;
        }
        out.push({
          file,
          project: p,
          title: caseTitle(p),
          description: caseDescription(p),
          type: 'article',
          image: p.thumb,
          imageAlt: `${p.title} — ${p.catLabel} screenshot`,
          priority: SEO.caseStudy.priority,
          changefreq: SEO.caseStudy.changefreq,
          kind: 'case'
        });
      });
  });

  return out;
}

/* ------------------------------------------------------------
   JSON-LD
   ------------------------------------------------------------ */

const PERSON_ID = SITE + '#person';
const SITE_ID = SITE + '#website';

function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SEO.name,
    url: SITE,
    /* An ImageObject rather than a bare URL: Google wants the dimensions
       before it will consider a photograph for a knowledge panel. */
    image: {
      '@type': 'ImageObject',
      '@id': SITE + '#portrait',
      url: urlOf(SEO.portrait),
      contentUrl: urlOf(SEO.portrait),
      width: SEO.portraitWidth,
      height: SEO.portraitHeight,
      caption: SEO.name + ' — ' + SEO.jobTitle
    },
    jobTitle: SEO.jobTitle,
    email: 'mailto:' + SEO.email,
    description: SEO.pages['index.html'].description,
    worksFor: { '@type': 'Organization', name: SEO.employer },
    knowsAbout: SEO.knowsAbout,
    knowsLanguage: SEO.knowsLanguage,
    sameAs: SEO.sameAs
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE,
    name: SEO.name + ' — Portfolio',
    description: SEO.pages['index.html'].description,
    inLanguage: SEO.lang,
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID }
  };
}

function crumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url
    }))
  };
}

function jsonLd(page) {
  const graph = [];

  if (page.kind === 'home') {
    graph.push(personNode(), websiteNode());
  } else {
    graph.push({ '@type': 'WebSite', '@id': SITE_ID, url: SITE, name: SEO.name + ' — Portfolio' });
  }

  if (page.kind === 'case') {
    const p = page.project;
    graph.push({
      '@type': 'CreativeWork',
      '@id': urlOf(page.file) + '#work',
      name: p.title,
      headline: page.title,
      description: page.description,
      url: urlOf(page.file),
      image: urlOf(p.thumb),
      dateCreated: String(p.year),
      inLanguage: SEO.lang,
      genre: p.catLabel,
      keywords: (p.stack || []).join(', '),
      creator: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
      isPartOf: { '@id': SITE_ID }
    });
    graph.push(crumbs([
      { name: 'Home', url: SITE },
      { name: 'Projects', url: urlOf('projects.html') },
      { name: p.title, url: urlOf(page.file) }
    ]));
  }

  if (page.kind === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': urlOf(page.file) + '#service',
      name: page.title.split('—')[0].trim(),
      description: page.description,
      url: urlOf(page.file),
      serviceType: page.title.split('—')[0].trim(),
      provider: { '@id': PERSON_ID },
      areaServed: 'Worldwide',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: urlOf('index.html') + '#contact'
      }
    });
    graph.push(crumbs([
      { name: 'Home', url: SITE },
      { name: page.title.split('—')[0].trim(), url: urlOf(page.file) }
    ]));
  }

  if (page.kind === 'collection') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': urlOf(page.file) + '#page',
      name: page.title,
      description: page.description,
      url: urlOf(page.file),
      inLanguage: SEO.lang,
      isPartOf: { '@id': SITE_ID },
      about: { '@id': PERSON_ID }
    });
    graph.push(crumbs([
      { name: 'Home', url: SITE },
      { name: page.title.split('—')[0].trim(), url: urlOf(page.file) }
    ]));
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

/* ------------------------------------------------------------
   The generated region
   ------------------------------------------------------------ */

function region(page) {
  const depth = page.file.includes('/') ? '../' : './';
  const canonical = page.file === 'index.html' ? SITE : urlOf(page.file);
  const image = /^https?:/.test(page.image) ? page.image : urlOf(page.image);
  const isDefaultCard = page.image === SEO.ogImage;

  const L = [];
  // The note gets its own comment: loose text inside <head> makes the HTML
  // parser close the head early and push every tag after it into the body.
  L.push('  ' + START);
  L.push('  <!-- generated by tools/build-seo.js — edit assets/data/seo.js instead -->');
  L.push(`  <title>${esc(page.title)}</title>`);
  L.push(`  <meta name="description" content="${esc(page.description)}">`);
  L.push(`  <meta name="author" content="${esc(SEO.name)}">`);
  L.push('  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">');
  L.push(`  <link rel="canonical" href="${canonical}">`);
  L.push('');
  // Google veut un favicon carre, idealement un multiple de 48px : icon-192.png
  // est le seul raster qui coche cette case (le .ico est en 32x32, sous la
  // recommandation). Les trois sont declares — les navigateurs prennent le SVG,
  // Google prend le 192.
  L.push(`  <link rel="icon" href="${depth}images/favicon.ico" sizes="32x32">`);
  L.push(`  <link rel="icon" type="image/png" sizes="192x192" href="${depth}images/icon-192.png">`);
  L.push(`  <link rel="icon" type="image/svg+xml" href="${depth}images/favicon.svg">`);
  L.push(`  <link rel="apple-touch-icon" href="${depth}images/apple-touch-icon.png">`);
  L.push(`  <link rel="manifest" href="${depth}site.webmanifest">`);
  L.push(`  <meta name="theme-color" content="${SEO.themeColor}">`);
  L.push('');
  L.push(`  <meta property="og:type" content="${page.type}">`);
  L.push(`  <meta property="og:site_name" content="${esc(SEO.name)}">`);
  L.push(`  <meta property="og:locale" content="${SEO.locale}">`);
  L.push(`  <meta property="og:url" content="${canonical}">`);
  L.push(`  <meta property="og:title" content="${esc(page.title)}">`);
  L.push(`  <meta property="og:description" content="${esc(page.description)}">`);
  L.push(`  <meta property="og:image" content="${image}">`);
  if (isDefaultCard) {
    L.push('  <meta property="og:image:width" content="1200">');
    L.push('  <meta property="og:image:height" content="630">');
  }
  L.push(`  <meta property="og:image:alt" content="${esc(page.imageAlt)}">`);
  L.push('  <meta name="twitter:card" content="summary_large_image">');
  L.push(`  <meta name="twitter:title" content="${esc(page.title)}">`);
  L.push(`  <meta name="twitter:description" content="${esc(page.description)}">`);
  L.push(`  <meta name="twitter:image" content="${image}">`);
  L.push(`  <meta name="twitter:image:alt" content="${esc(page.imageAlt)}">`);
  L.push('');
  L.push('  <script type="application/ld+json">');
  L.push(jsonLd(page).split('\n').map((l) => '  ' + l).join('\n'));
  L.push('  </script>');
  L.push('  ' + END);

  return L.join('\n');
}

/* ------------------------------------------------------------
   Legacy tag removal — runs once, before the region exists
   ------------------------------------------------------------ */

const LEGACY = [
  /^[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n?/gim,
  /^[ \t]*<meta\s+name=["'](?:description|author|robots|theme-color)["'][^>]*>[ \t]*\r?\n?/gim,
  /^[ \t]*<meta\s+property=["']og:[^"']*["'][^>]*>[ \t]*\r?\n?/gim,
  /^[ \t]*<meta\s+name=["']twitter:[^"']*["'][^>]*>[ \t]*\r?\n?/gim,
  /^[ \t]*<link\s+rel=["'](?:canonical|icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>[ \t]*\r?\n?/gim,
  /^[ \t]*<link\s+rel=["'][^"']*icon[^"']*["'][^>]*>[ \t]*\r?\n?/gim,
  /^[ \t]*<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>[ \t]*\r?\n?/gim
];

function stripLegacy(head) {
  let h = head;
  LEGACY.forEach((re) => { h = h.replace(re, ''); });
  // Comments that only introduced the tags we just removed
  h = h.replace(/^[ \t]*<!--\s*(?:Open Graph \/ Twitter|Shared chrome|SEO)\s*-->[ \t]*\r?\n?/gim, '');
  return h.replace(/\n{3,}/g, '\n\n');
}

/* ------------------------------------------------------------
   One page
   ------------------------------------------------------------ */

function applyRegion(s, page) {
  const block = region(page);

  if (s.includes(START) && s.includes(END)) {
    const a = s.indexOf(START);
    const b = s.indexOf(END) + END.length;
    const lineStart = s.lastIndexOf('\n', a) + 1;
    return s.slice(0, lineStart) + block + s.slice(b);
  }

  // First run: clean the old tags out of <head>, then insert.
  const hEnd = s.indexOf('</head>');
  if (hEnd === -1) return null;
  const hStart = s.indexOf('<head');
  const head = s.slice(hStart, hEnd);
  const cleaned = stripLegacy(head);
  s = s.slice(0, hStart) + cleaned + s.slice(hEnd);

  // Anchor after the viewport meta so charset/viewport stay first.
  const vp = s.match(/^[ \t]*<meta\s+name=["']viewport["'][^>]*>[ \t]*\r?\n/im);
  if (vp) {
    const at = s.indexOf(vp[0]) + vp[0].length;
    return s.slice(0, at) + '\n' + block + '\n' + s.slice(at);
  }
  const cs = s.match(/^[ \t]*<meta\s+charset[^>]*>[ \t]*\r?\n/im);
  if (cs) {
    const at = s.indexOf(cs[0]) + cs[0].length;
    return s.slice(0, at) + '\n' + block + '\n' + s.slice(at);
  }
  return s.replace('</head>', block + '\n</head>');
}

/* Exactly one <h1>. Case-study pages ship with none: their project name
   lives in a sidebar <h2>, so the document had no top-level heading at
   all. A screen-reader-only <h1> at the top of <main> gives the page one
   without touching 28 different hero designs. */
function ensureH1(s, page) {
  if (page.kind !== 'case') return s;
  if (/<h1[\s>]/i.test(s)) return s;

  const p = page.project;
  const h1 = `    <h1 class="pf-sr">${esc(p.title)} — ${esc(p.catLabel)} case study by ${esc(SEO.name)}</h1>\n`;

  const m = s.match(/<main[^>]*>\s*\r?\n?/i);
  if (m) {
    const at = s.indexOf(m[0]) + m[0].length;
    return s.slice(0, at) + h1 + s.slice(at);
  }
  const b = s.match(/<body[^>]*>\s*\r?\n?/i);
  if (b) {
    const at = s.indexOf(b[0]) + b[0].length;
    return s.slice(0, at) + h1 + s.slice(at);
  }
  return s;
}

function setLang(s) {
  if (/<html[^>]*\blang=/i.test(s)) {
    return s.replace(/(<html[^>]*\blang=["'])[^"']*(["'])/i, '$1' + SEO.lang + '$2');
  }
  return s.replace(/<html/i, '<html lang="' + SEO.lang + '"');
}

/* ------------------------------------------------------------
   Run
   ------------------------------------------------------------ */

function main() {
  const pages = collectPages();
  let written = 0, unchanged = 0;

  pages.forEach((page) => {
    const full = path.join(ROOT, page.file);
    if (!fs.existsSync(full)) { warnings.push(page.file + ' — fichier absent'); return; }

    const before = fs.readFileSync(full, 'utf8');
    let s = applyRegion(before, page);
    if (s === null) { warnings.push(page.file + ' — pas de </head>, ignoré'); return; }
    s = setLang(s);
    s = ensureH1(s, page);

    const h1n = (s.match(/<h1[\s>]/gi) || []).length;
    if (h1n !== 1) warnings.push(`${page.file} — ${h1n} balises <h1>`);
    if (page.title.length < TITLE_MIN || page.title.length > TITLE_MAX)
      warnings.push(`${page.file} — titre ${page.title.length} car. « ${page.title} »`);
    if (page.description.length < DESC_MIN || page.description.length > DESC_MAX)
      warnings.push(`${page.file} — description ${page.description.length} car.`);

    if (s === before) { unchanged++; return; }
    if (!CHECK) fs.writeFileSync(full, s, 'utf8');
    written++;
  });

  // Duplicate detection across the whole site
  const byTitle = {}, byDesc = {};
  pages.forEach((p) => {
    (byTitle[p.title] = byTitle[p.title] || []).push(p.file);
    (byDesc[p.description] = byDesc[p.description] || []).push(p.file);
  });
  Object.keys(byTitle).forEach((t) => {
    if (byTitle[t].length > 1) warnings.push('titre dupliqué « ' + t +' » : ' + byTitle[t].join(', '));
  });
  Object.keys(byDesc).forEach((d) => {
    if (byDesc[d].length > 1) warnings.push('description dupliquée : ' + byDesc[d].join(', '));
  });

  console.log(
    (CHECK ? 'check    ' : 'written  ') + written + ' pages, ' + unchanged + ' unchanged'
  );
  if (warnings.length) {
    console.log('\n' + warnings.length + ' avertissement(s):');
    warnings.forEach((w) => console.log('  - ' + w));
  } else {
    console.log('\nAucun avertissement — titres, descriptions et h1 conformes.');
  }
}

main();

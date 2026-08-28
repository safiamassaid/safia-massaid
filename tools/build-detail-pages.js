#!/usr/bin/env node
/* ============================================================
   build-detail-pages.js
   ------------------------------------------------------------
   Brings every case-study page under details/ and designdetail/
   onto the shared chrome:

     - links assets/css/main.css + portfolio.css
       (they used .glass-header / .hexa-logo / .status-dot without
        ever loading the stylesheet that defines them, so the logo
        rendered as a plain square and the header had no blur)
     - adds description / canonical / Open Graph / favicon
     - inserts a breadcrumb and a prev/next case-study nav
     - adds the footer + lightbox sentinels for build-cards.js

   Idempotent: re-running only fills in what is missing.

       node tools/build-detail-pages.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECTS = require(path.join(ROOT, 'assets/data/projects.js'));
const SITE = 'https://massaid-safia.netlify.app/';

const byPage = new Map(PROJECTS.filter((p) => p.page).map((p) => [p.page, p]));

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const url = (p) => p.split('/').map(encodeURIComponent).join('/');

/* ------------------------------------------------------------
   Fragments
   ------------------------------------------------------------ */

/* Stylesheets only. Every meta tag — title, description, canonical,
   Open Graph, Twitter, favicons, JSON-LD — belongs to tools/build-seo.js,
   which owns the PF:SEO region of the head. Emitting them here too would
   declare each one twice. Run build-seo.js after adding a page. */
function headBlock(p, file) {
  return `
  <!-- Shared chrome -->

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap">

  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/portfolio.css">
`;
}

function crumb(p, pad) {
  const i = ' '.repeat(pad);
  return `${i}<nav class="pf-crumb" aria-label="Breadcrumb">
${i}  <a href="../index.html">Home</a>
${i}  <i class="bi bi-chevron-right" aria-hidden="true"></i>
${i}  <a href="../projects.html">Projects</a>
${i}  <i class="bi bi-chevron-right" aria-hidden="true"></i>
${i}  <span aria-current="page">${esc(p.title)}</span>
${i}</nav>
`;
}

function caseNav(p) {
  return `
  <!-- Continue browsing -->
  <section class="px-4 pb-20 bg-slate-50/50">
    <div class="max-w-7xl mx-auto">
      <div class="pf-prevnext" data-pf-casenav="${esc(p.slug)}" data-pf-base="../"></div>
      <div class="pf-more-wrap">
        <a class="pf-more" href="../projects.html">
          Back to all projects <i class="bi bi-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  </section>

  <!-- PF:FOOTER:START -->
  <!-- PF:FOOTER:END -->

  <!-- PF:LIGHTBOX:START -->
  <!-- PF:LIGHTBOX:END -->
`;
}

const SCRIPTS = `  <script src="../assets/data/projects.js"></script>
  <script src="../assets/js/portfolio.js"></script>
`;

/* ------------------------------------------------------------
   Transform
   ------------------------------------------------------------ */

function transform(file) {
  const full = path.join(ROOT, file);
  const p = byPage.get(file);
  if (!p) return 'no data';

  let s = fs.readFileSync(full, 'utf8');
  const before = s;

  // --- head ---
  if (!s.includes('assets/css/portfolio.css')) {
    s = s.replace('</head>', headBlock(p, file) + '</head>');
  }

  // Bootstrap Icons power the breadcrumb, footer and lightbox controls.
  if (!s.includes('bootstrap-icons')) {
    s = s.replace(
      '</head>',
      '  <link rel="stylesheet"\n' +
        '    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">\n</head>'
    );
  }

  // --- breadcrumb, above the page title ---
  if (!s.includes('pf-crumb')) {
    const anchor = s.match(/([ \t]*)<div class="max-w-7xl mx-auto">\n/);
    if (anchor) {
      const pad = anchor[1].length + 2;
      s = s.replace(anchor[0], anchor[0] + crumb(p, pad));
    } else {
      // flask-redis: replace its hand-rolled breadcrumb with the component
      s = s.replace(
        /[ \t]*<div class="font-mono text-\[11px\] tracking-\[\.1em\] text-gray-400 mb-5">[\s\S]*?<\/div>\n/,
        crumb(p, 8)
      );
    }
  }

  // --- prev/next + footer + lightbox ---
  if (!s.includes('data-pf-casenav')) {
    if (s.includes('</main>')) {
      s = s.replace('</main>', '</main>\n' + caseNav(p));
    } else {
      // No <main>: attach after the last closing section instead
      const last = s.lastIndexOf('</section>');
      s = s.slice(0, last + 10) + '\n' + caseNav(p) + s.slice(last + 10);
    }
  }

  // --- scripts ---
  if (!s.includes('assets/js/portfolio.js')) {
    s = s.replace('</body>', SCRIPTS + '</body>');
  }
  if (!s.includes('assets/js/main.js')) {
    s = s.replace(SCRIPTS, '  <script src="../assets/js/main.js"></script>\n' + SCRIPTS);
  }

  if (s === before) return 'unchanged';
  fs.writeFileSync(full, s, 'utf8');
  return 'updated';
}

/* ------------------------------------------------------------ */

const files = []
  .concat(fs.readdirSync(path.join(ROOT, 'details')).map((f) => 'details/' + f))
  .concat(fs.readdirSync(path.join(ROOT, 'designdetail')).map((f) => 'designdetail/' + f))
  .filter((f) => f.endsWith('.html'));

const tally = {};
files.forEach((f) => {
  const res = transform(f);
  tally[res] = (tally[res] || 0) + 1;
  if (res === 'no data') console.log('  ! no project entry for ' + f);
});

Object.keys(tally).forEach((k) => console.log(String(tally[k]).padStart(3) + '  ' + k));

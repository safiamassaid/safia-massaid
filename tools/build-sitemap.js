#!/usr/bin/env node
/* ============================================================
   build-sitemap.js
   ------------------------------------------------------------
   Regenerates sitemap.xml from the pages actually on disk, so it
   can never drift from the site. Run after adding a page:

       node tools/build-sitemap.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://massaid-safia.netlify.app/';
const LASTMOD = '2026-08-21'; // stamped by hand so re-runs are deterministic

/* Pages Google should not spend crawl budget on */
const SKIP = new Set(['googlef60eb449e06e57e3.html']);

const urls = [];

const add = (loc, priority, changefreq) =>
  urls.push({ loc, priority, changefreq });

add('', '1.0', 'monthly');                       // homepage
add('projects.html', '0.9', 'monthly');
add('docs.html', '0.8', 'monthly');

['details', 'designdetail', 'service'].forEach((dir) => {
  fs.readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith('.html') && !SKIP.has(f))
    .sort()
    .forEach((f) => add(dir + '/' + f, dir === 'service' ? '0.6' : '0.7', 'yearly'));
});

const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n' +
  urls
    .map(
      (u) =>
        '  <url>\n' +
        '    <loc>' + SITE + enc(u.loc) + '</loc>\n' +
        '    <lastmod>' + LASTMOD + '</lastmod>\n' +
        '    <changefreq>' + u.changefreq + '</changefreq>\n' +
        '    <priority>' + u.priority + '</priority>\n' +
        '  </url>\n'
    )
    .join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml written — ' + urls.length + ' URLs');

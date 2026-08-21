#!/usr/bin/env node
/* ============================================================
   check-links.js
   ------------------------------------------------------------
   Resolves every local href/src on every page the way a browser
   would — relative to the page that contains it — and reports any
   that do not exist on disk.

   Also flags case mismatches explicitly. The site is hosted on
   Netlify (Linux), where doc/gp/BookSwap.pdf and bookswap.pdf are
   different files, so a link that works on Windows can still 404
   in production.

       node tools/check-links.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* --- collect every html page --- */
const pages = [];
(function walk(dir) {
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((e) => {
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (!['assets', 'images', 'doc', 'node_modules', 'tools', '.git'].includes(e.name)) walk(rel);
    } else if (e.name.endsWith('.html')) {
      pages.push(rel);
    }
  });
})('');

/* --- an index of real paths, lower-cased, to detect case-only misses --- */
const realPaths = new Map();
(function index(dir) {
  fs.readdirSync(path.join(ROOT, dir || '.'), { withFileTypes: true }).forEach((e) => {
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (!['node_modules', '.git'].includes(e.name)) index(rel);
    } else {
      realPaths.set(rel.toLowerCase(), rel);
    }
  });
})('');

const ATTR = /(?:href|src)="([^"]+)"/g;

let checked = 0;
const missing = [];
const caseMismatch = [];

pages.forEach((page) => {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const dir = path.posix.dirname(page) === '.' ? '' : path.posix.dirname(page);

  let m;
  while ((m = ATTR.exec(html))) {
    let target = m[1].trim();

    // skip anything that isn't a local file reference
    if (!target || /^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(target)) continue;
    if (target.startsWith('//')) continue;

    target = target.split('#')[0].split('?')[0];
    if (!target) continue;

    let decoded;
    try {
      decoded = decodeURIComponent(target);
    } catch (e) {
      decoded = target;
    }

    const resolved = path.posix
      .normalize(dir ? dir + '/' + decoded : decoded)
      .replace(/^\.\//, '');

    checked++;

    if (fs.existsSync(path.join(ROOT, resolved))) {
      // exists — but does the case match what is on disk?
      const onDisk = realPaths.get(resolved.toLowerCase());
      if (onDisk && onDisk !== resolved) {
        caseMismatch.push({ page, link: m[1], resolved, onDisk });
      }
      continue;
    }

    const onDisk = realPaths.get(resolved.toLowerCase());
    if (onDisk) caseMismatch.push({ page, link: m[1], resolved, onDisk });
    else missing.push({ page, link: m[1], resolved });
  }
});

console.log('pages scanned : ' + pages.length);
console.log('local links   : ' + checked);

if (caseMismatch.length) {
  console.log('\nCASE MISMATCH (works on Windows, 404s on Netlify):');
  caseMismatch.forEach((c) =>
    console.log('  ' + c.page + '\n     links  ' + c.resolved + '\n     ondisk ' + c.onDisk)
  );
}

if (missing.length) {
  console.log('\nMISSING (' + missing.length + '):');
  missing.forEach((x) => console.log('  ' + x.page + '  ->  ' + x.link));
}

if (!missing.length && !caseMismatch.length) console.log('\nAll local links resolve.');

process.exit(missing.length || caseMismatch.length ? 1 : 0);

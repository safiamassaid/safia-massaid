#!/usr/bin/env node
/* ============================================================
   sync-header.js
   ------------------------------------------------------------
   index.html owns the header. This copies it to every other page,
   rewriting the links for that page's depth and marking the
   current page in the nav.

   Before this existed the header was pasted into 35 files by hand,
   which is how they drifted apart. Edit it in index.html, then:

       node tools/sync-header.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* The current marker, plus the one the pages were built with before this
   tool existed, so the first sync can find and replace them too. */
const MARKERS = ['<!-- Header -->', '<!-- Header Flottant -->'];

/* Pull the header block out of a page by walking div nesting from the marker. */
function extract(html) {
  const lines = html.split('\n');

  let start = lines.findIndex((l) => MARKERS.some((m) => l.includes(m)));

  // Pages written before this tool carry no comment — find the wrapper itself.
  if (start === -1) {
    start = lines.findIndex((l) => l.indexOf('class="fixed top-4 left-0 right-0 z-50') !== -1);
  }
  if (start === -1) return null;

  let depth = 0;
  let opened = false;

  // The marker line may already be the wrapper div, so count it too.
  depth += (lines[start].match(/<div\b/g) || []).length;
  depth -= (lines[start].match(/<\/div>/g) || []).length;
  if (depth > 0) opened = true;

  for (let i = start + 1; i < lines.length; i++) {
    depth += (lines[i].match(/<div\b/g) || []).length;
    depth -= (lines[i].match(/<\/div>/g) || []).length;
    if (depth > 0) opened = true;
    if (opened && depth <= 0) {
      return { block: lines.slice(start, i + 1).join('\n'), start, end: i };
    }
  }
  return null;
}

const source = extract(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
if (!source) {
  console.error('Could not find the header in index.html — nothing to sync.');
  process.exit(1);
}

/* --- which nav item is current, per page --- */
function currentFor(file) {
  if (file === 'projects.html' || file.startsWith('details/') || file.startsWith('designdetail/')) {
    return 'projects.html';
  }
  if (file === 'docs.html') return 'docs.html';
  if (file.startsWith('service/')) return 'index.html#services';
  return null;
}

const MUTED = 'nav-link nav-item';
const ACTIVE = 'nav-link nav-item is-current';
const M_MUTED = 'mobile-nav-link nav-item';
const M_ACTIVE = 'mobile-nav-link nav-item is-current';

function tailor(block, file) {
  const depth = file.includes('/') ? '../' : '';
  let out = block.replace(/href="(index\.html|projects\.html|docs\.html)/g, 'href="' + depth + '$1');

  const current = currentFor(file);
  if (current) {
    const href = 'href="' + depth + current + '"';
    out = out
      .split(href + ' class="' + MUTED + '"')
      .join(href + ' class="' + ACTIVE + '" aria-current="page"')
      .split(href + ' class="' + M_MUTED)
      .join(href + ' class="' + M_ACTIVE);
  }
  return out;
}

/* --- collect pages --- */
const pages = ['projects.html', 'docs.html'];
['details', 'designdetail', 'service'].forEach((dir) => {
  fs.readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith('.html'))
    .forEach((f) => pages.push(dir + '/' + f));
});

let written = 0;
let skipped = [];

pages.forEach((file) => {
  const full = path.join(ROOT, file);
  const html = fs.readFileSync(full, 'utf8');
  const found = extract(html);
  if (!found) {
    skipped.push(file);
    return;
  }
  const lines = html.split('\n');
  const next = lines
    .slice(0, found.start)
    .concat(tailor(source.block, file).split('\n'), lines.slice(found.end + 1))
    .join('\n');

  if (next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    written++;
  }
});

console.log('header synced to ' + written + ' page(s)');
if (skipped.length) {
  console.log('no header marker in:\n  ' + skipped.join('\n  '));
}

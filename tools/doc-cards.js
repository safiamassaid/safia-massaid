/* ============================================================
   doc-cards.js
   ------------------------------------------------------------
   Document-card rendering for tools/build-cards.js.
   Kept in its own module so the project and document generators
   stay readable side by side.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = require(path.join(ROOT, 'assets/data/docs.js'));

const DOC_ICON = {
  spec: 'bi-file-earmark-text-fill',
  tech: 'bi-file-earmark-code-fill',
  qa: 'bi-clipboard2-check-fill',
  bug: 'bi-bug-fill',
  sec: 'bi-shield-lock-fill'
};

const DOC_CATS = [
  { key: 'pm', label: 'Project Management', icon: 'bi-kanban' },
  { key: 'tech', label: 'Technical', icon: 'bi-file-earmark-code' },
  { key: 'qa', label: 'Testing & QA', icon: 'bi-shield-check' }
];

module.exports = function makeDocs(helpers) {
  const { esc, rel } = helpers;

  /* Reads the real file so a card can state its weight before download */
  function fileSize(relPath) {
    try {
      const bytes = fs.statSync(path.join(ROOT, relPath)).size;
      return bytes >= 1048576
        ? (bytes / 1048576).toFixed(1) + ' MB'
        : Math.max(1, Math.round(bytes / 1024)) + ' KB';
    } catch (e) {
      return '';
    }
  }

  const haystack = (d) =>
    [d.title, d.subject, d.desc, d.year, ...(d.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

  function renderDoc(d, base, pad, withDesc) {
    const i = ' '.repeat(pad);
    const size = fileSize(d.file);
    const meta = ['PDF', size, d.year].filter(Boolean).join(' &middot; ');

    const tags = (d.tags || [])
      .slice(0, 3)
      .map((t) => i + '        <li class="pf-chip">' + esc(t) + '</li>')
      .join('\n');

    const related = d.project
      ? i + '    <div class="pf-doc__foot">\n' +
        i + '      <a class="pf-doc__rel" href="' + esc(rel(base, d.project)) + '">' +
        '<i class="bi bi-link-45deg" aria-hidden="true"></i> View the project</a>\n' +
        i + '    </div>'
      : '';

    return [
      i + '<article class="pf-doc-wrap" data-cat="' + esc(d.cat) +
        '" data-search="' + esc(haystack(d)) + '">',
      i + '  <a class="pf-doc" href="' + esc(rel(base, d.file)) + '" target="_blank" rel="noopener">',
      i + '    <span class="pf-doc__icon pf-doc__icon--' + esc(d.kind) + '">',
      i + '      <i class="bi ' + (DOC_ICON[d.kind] || DOC_ICON.spec) + '" aria-hidden="true"></i>',
      i + '    </span>',
      i + '    <span class="pf-doc__body">',
      i + '      <span class="pf-eyebrow pf-eyebrow--muted">' + esc(d.subject) + '</span>',
      i + '      <h3 class="pf-doc__title">' + esc(d.title) + '</h3>',
      withDesc ? i + '      <span class="pf-doc__desc">' + esc(d.desc) + '</span>' : '',
      tags ? i + '      <ul class="pf-chips">\n' + tags + '\n' + i + '      </ul>' : '',
      i + '      <span class="pf-doc__meta">' + meta + '</span>',
      i + '    </span>',
      i + '    <i class="bi bi-download pf-doc__dl" aria-hidden="true"></i>',
      i + '  </a>',
      related,
      i + '</article>'
    ]
      .filter(Boolean)
      .join('\n');
  }

  function renderQaCard(pad) {
    const i = ' '.repeat(pad);
    return [
      i + '<div class="pf-qa-card">',
      i + '  <div>',
      i + '    <div class="pf-qa-card__head">',
      i + '      <i class="bi bi-shield-check" aria-hidden="true"></i>',
      i + '      <h3>My QA approach</h3>',
      i + '    </div>',
      i + '    <ul class="pf-qa-card__list">',
      i + '      <li>Functional &amp; regression testing</li>',
      i + '      <li>API testing with Postman collections</li>',
      i + '      <li>Test case management in TestRail</li>',
      i + '      <li>Bug severity classification &amp; tracking</li>',
      i + '      <li>Cross-browser &amp; responsive validation</li>',
      i + '    </ul>',
      i + '  </div>',
      i + '  <div class="pf-qa-card__foot">',
      i + '    <span>Postman</span><span>TestRail</span><span>DevTools</span>',
      i + '  </div>',
      i + '</div>'
    ].join('\n');
  }

  function renderTabs(pad, withSearch) {
    const i = ' '.repeat(pad);

    const buttons = DOC_CATS.map(function (c, n) {
      const count = DOCS.filter((d) => d.cat === c.key).length;
      return i + '  <button class="pf-filter" type="button" role="tab" data-pf-doctab="' + c.key +
        '" aria-selected="' + (n === 0 ? 'true' : 'false') + '">' +
        '<i class="bi ' + c.icon + '" aria-hidden="true"></i> ' + c.label +
        ' <span class="pf-filter__n">' + count + '</span></button>';
    }).join('\n');

    const search = withSearch
      ? [
          i + '  <div class="pf-search">',
          i + '    <i class="bi bi-search" aria-hidden="true"></i>',
          i + '    <label class="pf-sr" for="pf-doc-search">Search documents</label>',
          i + '    <input id="pf-doc-search" type="search" data-pf-docsearch' +
            ' placeholder="Search documents, tech, year…">',
          i + '  </div>'
        ].join('\n')
      : '';

    return [
      i + '<div class="pf-filterbar" role="tablist" aria-label="Document category">',
      buttons,
      search,
      i + '</div>'
    ]
      .filter(Boolean)
      .join('\n');
  }

  function renderDocs(opts) {
    const o = opts || {};
    const base = o.base || '';
    const pad = o.pad || 6;
    const withDesc = !!o.withDesc;
    const withSearch = !!o.withSearch;
    const i = ' '.repeat(pad);

    const panels = DOC_CATS.map(function (c, n) {
      const list = DOCS.filter((d) => d.cat === c.key);
      return [
        i + '<div data-pf-docpanel="' + c.key + '"' + (n === 0 ? '' : ' hidden') + '>',
        i + '  <div class="pf-doc-grid">',
        list.map((d) => renderDoc(d, base, pad + 4, withDesc)).join('\n\n'),
        c.key === 'qa' ? renderQaCard(pad + 4) : '',
        i + '  </div>',
        i + '  <div class="pf-empty" data-pf-empty>',
        i + '    <i class="bi bi-search" aria-hidden="true"></i>',
        i + '    <p>No document matches that search.</p>',
        i + '  </div>',
        i + '</div>'
      ]
        .filter(Boolean)
        .join('\n');
    }).join('\n\n');

    return renderTabs(pad, withSearch) + '\n\n' + panels;
  }

  return { renderDocs, DOCS, DOC_CATS };
};

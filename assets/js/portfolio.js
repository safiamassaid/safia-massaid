/* ============================================================
   PORTFOLIO INTERACTIONS
   Tabs, filters, search, progressive reveal, lightbox, doc tabs.

   Everything is driven by data attributes on static markup — the
   grids are never rendered from JS, so the cards stay crawlable.
   ============================================================ */

(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ==========================================================
     1. TRACK TABS  (Development / Design)
     ========================================================== */

  function initTracks() {
    var tabs = $$('[data-pf-track]');
    if (!tabs.length) return;

    function activate(track) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-pf-track') === track;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
      });

      $$('[data-pf-panel]').forEach(function (panel) {
        var on = panel.getAttribute('data-pf-panel') === track;
        panel.hidden = !on;
        if (on) {
          // Each panel keeps its own filter/reveal state — re-sync on show.
          resetPanel(panel);
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-pf-track'));
      });

      // Roving focus so the tablist behaves like a tablist
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var i = tabs.indexOf(tab);
        var next = tabs[e.key === 'ArrowRight' ? (i + 1) % tabs.length
                                               : (i - 1 + tabs.length) % tabs.length];
        next.focus();
        activate(next.getAttribute('data-pf-track'));
      });
    });

    var initial = $('[data-pf-track][aria-selected="true"]') || tabs[0];
    activate(initial.getAttribute('data-pf-track'));
  }

  /* ==========================================================
     2. FILTERS + SEARCH + PROGRESSIVE REVEAL
     ========================================================== */

  // A panel's state lives on the element itself, so panels don't fight.
  function panelState(panel) {
    if (!panel._pf) {
      panel._pf = {
        filter: 'all',
        query: '',
        // 0 = no limit (archive pages show everything)
        step: parseInt(panel.getAttribute('data-pf-step'), 10) || 0,
        shown: parseInt(panel.getAttribute('data-pf-step'), 10) || 0
      };
    }
    return panel._pf;
  }

  function cardMatches(card, state) {
    if (state.filter !== 'all' && card.getAttribute('data-cat') !== state.filter) {
      return false;
    }
    if (!state.query) return true;
    return (card.getAttribute('data-search') || '').indexOf(state.query) !== -1;
  }

  function applyPanel(panel) {
    var state = panelState(panel);
    var cards = $$('.pf-card, .pf-featured', panel);
    var matched = 0;
    var visible = 0;

    cards.forEach(function (card) {
      if (!cardMatches(card, state)) {
        card.classList.add('is-hidden');
        return;
      }
      matched++;
      // Featured items always stay visible; only the grid paginates.
      var overLimit = state.step > 0 &&
                      !card.classList.contains('pf-featured') &&
                      visible >= state.shown;
      if (overLimit) {
        card.classList.add('is-hidden');
      } else {
        card.classList.remove('is-hidden');
        if (!card.classList.contains('pf-featured')) visible++;
      }
    });

    // Empty state
    var empty = $('[data-pf-empty]', panel);
    if (empty) empty.classList.toggle('is-shown', matched === 0);

    // "Show more" — hide once everything that matches is on screen
    var moreWrap = $('[data-pf-more-wrap]', panel);
    if (moreWrap) {
      var gridTotal = cards.filter(function (c) {
        return !c.classList.contains('pf-featured') && cardMatches(c, state);
      }).length;
      moreWrap.hidden = state.step === 0 || visible >= gridTotal;
      var moreCount = $('[data-pf-more-count]', panel);
      if (moreCount) moreCount.textContent = gridTotal - visible;
    }

    // Per-filter counts
    $$('[data-pf-filter]', panel).forEach(function (btn) {
      var cat = btn.getAttribute('data-pf-filter');
      var n = cards.filter(function (c) {
        if (cat !== 'all' && c.getAttribute('data-cat') !== cat) return false;
        if (!state.query) return true;
        return (c.getAttribute('data-search') || '').indexOf(state.query) !== -1;
      }).length;
      var slot = $('.pf-filter__n', btn);
      if (slot) slot.textContent = n;
      btn.hidden = n === 0 && cat !== 'all';
    });

    updateCounters(panel, matched);
  }

  function resetPanel(panel) {
    var state = panelState(panel);
    state.shown = state.step;
    applyPanel(panel);
  }

  function initPanels() {
    $$('[data-pf-panel]').forEach(function (panel) {
      var state = panelState(panel);

      $$('[data-pf-filter]', panel).forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.filter = btn.getAttribute('data-pf-filter');
          state.shown = state.step;
          $$('[data-pf-filter]', panel).forEach(function (b) {
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          applyPanel(panel);
        });
      });

      var more = $('[data-pf-more]', panel);
      if (more) {
        more.addEventListener('click', function () {
          state.shown += state.step || 9;
          applyPanel(panel);
        });
      }

      applyPanel(panel);
    });

    // Search is page-wide: it applies to whichever panels are on the page.
    var search = $('[data-pf-search]');
    if (search) {
      search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        $$('[data-pf-panel]').forEach(function (panel) {
          var state = panelState(panel);
          state.query = q;
          // A search should reach past the fold, not stop at the first page.
          state.shown = q ? 9999 : state.step;
          applyPanel(panel);
        });
      });
    }
  }

  /* ==========================================================
     3. COUNTERS
     Driven from the DOM so they can never drift from the grid.
     ========================================================== */

  function updateCounters(panel, matched) {
    if (panel.hidden) return;

    var filtered = $('#filtered-count');
    if (filtered) filtered.textContent = String(matched).padStart(2, '0');

    var label = $('#filtered-label');
    if (label) label.textContent = panel.getAttribute('data-pf-label') || 'selected';
  }

  function initTotals() {
    // Any element with data-pf-count="dev|design|all" gets the real number.
    // The full list is the source of truth — the homepage only renders a
    // curated subset, so counting the DOM there would under-report.
    var counts = { dev: 0, design: 0 };

    if (Array.isArray(window.PF_PROJECTS)) {
      window.PF_PROJECTS.forEach(function (p) {
        if (p.track in counts) counts[p.track]++;
      });
    } else {
      $$('[data-pf-panel]').forEach(function (panel) {
        var key = panel.getAttribute('data-pf-panel');
        if (key in counts) counts[key] = $$('.pf-card, .pf-featured', panel).length;
      });
    }
    counts.all = counts.dev + counts.design;

    $$('[data-pf-count]').forEach(function (el) {
      var key = el.getAttribute('data-pf-count');
      if (key in counts) el.textContent = counts[key];
    });
  }

  /* ==========================================================
     4. LIGHTBOX
     ========================================================== */

  function initLightbox() {
    var box = $('#pf-lightbox');
    if (!box) return;

    var img = $('[data-pf-lightbox-img]', box);
    var caption = $('[data-pf-lightbox-caption]', box);
    var counter = $('[data-pf-lightbox-count]', box);
    var nav = $('[data-pf-lightbox-nav]', box);

    var gallery = [];
    var index = 0;
    var lastFocus = null;

    function render() {
      var item = gallery[index];
      if (!item) return;
      img.src = item.src;
      img.alt = item.caption ? item.caption + ' — full screenshot' : 'Project screenshot';
      caption.textContent = item.caption || '';
      counter.textContent = (index + 1) + ' / ' + gallery.length;
      nav.hidden = gallery.length < 2;
    }

    function open(trigger) {
      // The gallery is every zoom button currently visible in the same panel,
      // so the arrows walk the projects the visitor can actually see.
      var scope = trigger.closest('[data-pf-panel]') || document;
      var triggers = $$('[data-pf-zoom]', scope).filter(function (t) {
        var card = t.closest('.pf-card, .pf-featured');
        return !card || !card.classList.contains('is-hidden');
      });
      if (triggers.indexOf(trigger) === -1) triggers = [trigger];

      gallery = triggers.map(function (t) {
        return {
          src: t.getAttribute('data-pf-zoom'),
          caption: t.getAttribute('data-pf-caption') || ''
        };
      });
      index = Math.max(0, triggers.indexOf(trigger));

      lastFocus = trigger;
      render();
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('[data-pf-lightbox-close]', box).focus();
    }

    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
      lastFocus = null;
    }

    function move(delta) {
      if (gallery.length < 2) return;
      index = (index + delta + gallery.length) % gallery.length;
      render();
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-pf-zoom]');
      if (trigger) {
        e.preventDefault();
        open(trigger);
        return;
      }
      if (e.target.closest('[data-pf-lightbox-close]')) { close(); return; }
      if (e.target.closest('[data-pf-lightbox-prev]')) { move(-1); return; }
      if (e.target.closest('[data-pf-lightbox-next]')) { move(1); return; }
      // Click the backdrop (but not the frame) to dismiss
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowRight') { move(1); }
      else if (e.key === 'ArrowLeft') { move(-1); }
      else if (e.key === 'Tab') {
        // Trap focus inside the dialog
        var focusable = $$('button, [href]', box).filter(function (el) {
          return el.offsetParent !== null;
        });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ==========================================================
     5. DOCUMENT TABS
     ========================================================== */

  function initDocTabs() {
    var tabs = $$('[data-pf-doctab]');
    if (!tabs.length) return;

    function activate(key) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-pf-doctab') === key;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.classList.toggle('bg-white', on);
        tab.classList.toggle('text-primary', on);
        tab.classList.toggle('shadow-sm', on);
        tab.classList.toggle('text-slate-500', !on);
      });
      $$('[data-pf-docpanel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-pf-docpanel') !== key;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-pf-doctab'));
      });
    });

    var initial = $('[data-pf-doctab][aria-selected="true"]') || tabs[0];
    activate(initial.getAttribute('data-pf-doctab'));

    // Search spans every category, so a hit in a tab you're not looking at
    // still counts — the tab badge tells you where it is.
    var search = $('[data-pf-docsearch]');
    if (!search) return;

    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();

      $$('[data-pf-docpanel]').forEach(function (panel) {
        var shown = 0;
        $$('.pf-doc-wrap', panel).forEach(function (doc) {
          var hit = !q || (doc.getAttribute('data-search') || '').indexOf(q) !== -1;
          doc.classList.toggle('is-hidden', !hit);
          if (hit) shown++;
        });

        var empty = $('[data-pf-empty]', panel);
        if (empty) empty.classList.toggle('is-shown', shown === 0);

        var qa = $('.pf-qa-card', panel);
        if (qa) qa.hidden = !!q;

        var tab = $('[data-pf-doctab="' + panel.getAttribute('data-pf-docpanel') + '"]');
        var slot = tab && $('.pf-filter__n', tab);
        if (slot) slot.textContent = shown;
      });
    });
  }

  /* ==========================================================
     6. CASE-STUDY PREV / NEXT
     Reads the shared project list so the order matches the grid.
     ========================================================== */

  function initCaseNav() {
    var mount = $('[data-pf-casenav]');
    if (!mount || typeof window.PF_PROJECTS === 'undefined') return;

    var slug = mount.getAttribute('data-pf-casenav');
    var base = mount.getAttribute('data-pf-base') || '../';
    var list = window.PF_PROJECTS.filter(function (p) { return p.page; });
    var i = list.findIndex(function (p) { return p.slug === slug; });
    if (i === -1) return;

    var prev = list[(i - 1 + list.length) % list.length];
    var next = list[(i + 1) % list.length];

    function card(project, dir) {
      var isNext = dir === 'next';
      return '' +
        '<a class="pf-nav-card' + (isNext ? ' pf-nav-card--next' : '') + '" href="' + base + project.page + '">' +
          '<div class="pf-nav-card__thumb">' +
            '<img src="' + base + project.thumb + '" alt="" loading="lazy">' +
          '</div>' +
          '<div class="pf-nav-card__meta">' +
            '<p>' + (isNext ? 'Next project' : 'Previous project') + '</p>' +
            '<h4>' + project.title + '</h4>' +
          '</div>' +
        '</a>';
    }

    mount.innerHTML = card(prev, 'prev') + card(next, 'next');
  }

  /* ========================================================== */

  function init() {
    initTracks();
    initPanels();
    initTotals();
    initLightbox();
    initDocTabs();
    initCaseNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

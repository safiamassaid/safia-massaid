/* ============================================================
   SITE CHROME
   Mobile menu and the header's scroll state.
   Every page loads this; it must stay dependency-free and must not
   throw when an element is absent.
   ============================================================ */

(function () {
  'use strict';

  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuIcon = document.getElementById('menu-icon');
  var header = document.getElementById('main-header');

  var BURGER =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>';
  var CLOSE =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */

  if (menuToggle && mobileMenu) {
    var setOpen = function (open) {
      mobileMenu.hidden = !open;
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (menuIcon) menuIcon.innerHTML = open ? CLOSE : BURGER;
    };

    setOpen(false);

    menuToggle.addEventListener('click', function () {
      setOpen(mobileMenu.hidden);
    });

    // Any link closes it — including the in-page anchors
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        setOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Header scroll state
     Toggles a class rather than writing inline styles, so the
     glass treatment stays owned by the stylesheet.
     --------------------------------------------------------- */

  if (header) {
    var sync = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 50);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }
})();

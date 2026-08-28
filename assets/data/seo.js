/* ============================================================
   SEO DATA — single source of truth for every <head>
   ------------------------------------------------------------
   Consumed by tools/build-seo.js, which rewrites the
   <!-- PF:SEO:START --> … <!-- PF:SEO:END --> region of all 35
   pages. Never hand-edit that region — edit this file and run:

       node tools/build-seo.js

   The 28 case-study pages are NOT listed here: their title and
   description are derived from assets/data/projects.js, so a new
   project needs one entry there and nothing here.

   Language
     The site content is written in English, so the metadata and
     <html lang> are English too. A French <html lang="fr"> on
     English copy is a defect — it misleads Google about the page
     language and makes screen readers mispronounce every word.
     To target French, translate the page content first, then
     flip LANG / LOCALE below and retranslate the strings here.
   ============================================================ */

(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.PF_SEO = data;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SITE = 'https://massaid-safia.netlify.app/';

  return {
    /* --- Identity ------------------------------------------- */
    site: SITE,
    name: 'Safia Massaid',
    jobTitle: 'IT Engineer & Assistant Project Manager',
    lang: 'en',
    locale: 'en_US',
    themeColor: '#8C4A6B',
    email: 'massaidsafia2@gmail.com',
    employer: 'Kyo Conseil',

    /* Default share card — 1200x630, rendered from tools/og-cover.html */
    ogImage: 'images/og-cover.png',

    /* The photograph itself. Feeds Person.image in the JSON-LD, which is
       what Google reads when it decides whether it has a picture of the
       person behind the name. Descriptive filename on purpose. */
    portrait: 'images/safia-massaid-it-engineer.png',
    portraitWidth: 340,
    portraitHeight: 685,
    ogImageAlt: 'Safia Massaid — IT engineer and project manager portfolio',

    /* Profiles Google uses to tie the Person entity together */
    sameAs: [
      'https://github.com/safiamassaid',
      'https://gitlab.com/safia1704832',
      'https://www.linkedin.com/in/safia-massaid-171b19235/'
    ],

    /* Feeds Person.knowsAbout — the disciplines, not every tool */
    knowsAbout: [
      'Web development',
      'Laravel',
      'React',
      'Node.js',
      'PostgreSQL',
      'UI/UX design',
      'Figma',
      'Software testing',
      'Quality assurance',
      'Project management',
      'Agile',
      'Scrum',
      'Requirements engineering'
    ],

    knowsLanguage: ['fr', 'en', 'ar'],

    /* --- Per-page metadata ---------------------------------- */
    /* title: aim 50-60 characters. description: aim 150-160.
       Both are checked by the generator, which prints a warning
       for anything outside the band. */
    pages: {
      'index.html': {
        type: 'website',
        priority: '1.0',
        changefreq: 'weekly',
        title: 'Safia Massaid — IT Engineer & Assistant Project Manager',
        description:
          'IT engineer and assistant project manager in Algiers. I build web, desktop and mobile products end to end — specification, code, UI/UX, testing and delivery.'
      },

      'projects.html': {
        type: 'website',
        priority: '0.9',
        changefreq: 'weekly',
        title: '+40 Projects — Safia Massaid, IT Engineer Portfolio',
        description:
          'The full archive: +40 web, desktop, mobile and UI/UX projects, each with the stack it was built on, the problem it solved and a case study you can open.'
      },

      'docs.html': {
        type: 'website',
        priority: '0.8',
        changefreq: 'monthly',
        title: 'Project Docs & QA Reports — Safia Massaid Portfolio',
        description:
          'Twenty-one downloadable documents: specifications, Gantt plans, UML architecture, API references, test campaigns and severity-classified bug reports.'
      },

      'service/service-details.html': {
        type: 'website',
        priority: '0.7',
        changefreq: 'monthly',
        title: 'Web & App Development Services — Safia Massaid, Engineer',
        description:
          'Web and desktop applications built to specification: backend architecture, database design, REST APIs and the interfaces on top, in Laravel, React and Node.js.'
      },

      'service/servicedes.html': {
        type: 'website',
        priority: '0.7',
        changefreq: 'monthly',
        title: 'UI/UX Design Services — Safia Massaid, Product Designer',
        description:
          'Interfaces designed before they are built: user research, wireframes, high-fidelity Figma prototypes and a design system your developers can actually follow.'
      },

      'service/servicegest.html': {
        type: 'website',
        priority: '0.7',
        changefreq: 'monthly',
        title: 'Project Management Services — CDC, UML, Gantt & RACI',
        description:
          'Cahier des charges, UML architecture, feasibility study, Gantt planning and RACI governance — the specification and tracking a software build gets run against.'
      },

      'service/servicetest.html': {
        type: 'website',
        priority: '0.7',
        changefreq: 'monthly',
        title: 'QA & Software Testing Services — Safia Massaid, QA Engineer',
        description:
          'Functional and regression campaigns, Postman API testing, Locust load testing and severity-classified bug reports — with the written evidence a release is ready.'
      }
    },

    /* --- Sitemap defaults for the derived case-study pages --- */
    caseStudy: {
      priority: '0.7',
      changefreq: 'yearly'
    }
  };
});

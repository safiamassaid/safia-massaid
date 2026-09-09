/* ============================================================
   PROJECT DATA — single source of truth
   ------------------------------------------------------------
   Used two ways:
     1. In the browser, as window.PF_PROJECTS, to drive the
        prev/next navigation on case-study pages.
     2. In Node, by tools/build-cards.js, to generate the static
        card markup for index.html and projects.html.

   The grids themselves are static HTML so they stay crawlable —
   never render cards from this file at runtime.

   Fields
     slug      unique id, also the anchor used by case-study nav
     track     'dev' | 'design'  — which tab the project lives in
     cat       filter bucket: webapp | website | desktop | mobile | backend | uiux
     catLabel  human label shown as the card eyebrow
     title     project name
     desc      one line, written for a visitor who has never seen it
     thumb     cover image, path relative to the site root
     page      internal case-study page (omit if there isn't one)
     live      public deployment
     repo      source repository
     figma     Figma file
     stack     up to 4 technologies, most characteristic first
     year      display year
     featured  true = rendered as a spotlight at the top of its tab
   ============================================================ */

(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.PF_PROJECTS = data;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [

    /* ==========================================================
       DEVELOPMENT — featured
       ========================================================== */

    {
      slug: 'healthmath',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'HealthMath',
      desc: 'Medical practice management — patient records, appointments, prescriptions and clinical workflows for a private cabinet.',
      long: 'A complete management system for a medical practice: patient files, appointment scheduling, prescriptions and the day-to-day clinical workflow, backed by a full test and bug-tracking cycle.',
      thumb: 'assets/img/docteur/doc1.png',
      page: 'details/docteur.html',
      stack: ['Laravel', 'PostgreSQL', 'Blade', 'Tailwind'],
      year: '2026',
      featured: true,
      metrics: [
        { value: 'v1.0', label: 'Released' },
        { value: '2', label: 'QA reports' }
      ]
    },
    {
      slug: 'orbiserp',
      track: 'dev',
      cat: 'desktop',
      catLabel: 'Desktop Application',
      title: 'OrbisERP',
      desc: 'Desktop ERP covering invoicing, stock and fiscal compliance on a single centralised client database.',
      long: 'A desktop ERP built for small businesses that need real compliance without enterprise overhead — centralised invoicing, stock control and integrated TVA / J50 handling, installed and run locally.',
      thumb: 'assets/img/desk/asset/a1.png',
      page: 'details/erplog.html',
      live: 'https://demoorbiserp.netlify.app/',
      stack: ['React', 'Node.js', 'Express', 'SQL'],
      year: '2025',
      featured: true,
      metrics: [
        { value: '9', label: 'Demo steps' },
        { value: 'TVA', label: 'Compliance' }
      ]
    },
    {
      slug: 'astias-travel',
      track: 'dev',
      cat: 'website',
      catLabel: 'Dynamic Website',
      title: 'Astias Travel',
      desc: 'Travel agency platform — destination catalogue, booking flow, customer accounts and a full back-office.',
      long: 'A travel agency platform end to end: a browsable destination catalogue, a booking flow with customer accounts, and an administration dashboard for reservations and messages.',
      thumb: 'assets/img/portfolio/as1.png',
      page: 'details/portfolio-details.html',
      stack: ['PHP', 'jQuery', 'SQL', 'JavaScript'],
      year: '2024'
    },
    {
      slug: 'uniplan',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'UniPlan',
      desc: 'Intelligent exam planning that generates conflict-free timetables for a full university session.',
      long: 'Exam scheduling for a university: UniPlan takes rooms, invigilators and student groups and produces a timetable with no clashes, documented by its own technical, test and bug reports.',
      thumb: 'assets/img/uniplan/2.png',
      repo: 'https://github.com/safiamassaid/shedule_exam',
      stack: ['Flask', 'PostgreSQL', 'JavaScript'],
      year: '2026'
    },

    /* ==========================================================
       DEVELOPMENT — case studies
       ========================================================== */

    {
      slug: 'noor',
      track: 'dev',
      cat: 'mobile',
      catLabel: 'Mobile Application',
      title: 'Noor',
      desc: 'Islamic habits companion — prayer times, dhikr counter, habit streaks and daily reminders.',
      thumb: 'assets/img/noor/n1.png',
      page: 'details/noor.html',
      stack: ['React Native', 'Expo SDK 51', 'TypeScript'],
      year: '2026'
    },
    {
      slug: 'catering',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Catering Management',
      desc: 'Menu planning, supplier orders and service tracking for a catering operation.',
      thumb: 'assets/img/portfolio/acceuil.png',
      page: 'details/erp.html',
      stack: ['React', 'Node.js', 'Express', 'SQL'],
      year: '2025'
    },
    {
      slug: 'kitchen',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Kitchen Management',
      desc: 'Menu creation, stock tracking and real-time order management for a professional kitchen.',
      thumb: 'assets/img/portfolio/acceuilcuisin.png',
      page: 'details/cuisine.html',
      stack: ['React', 'Node.js', 'Express', 'SQL'],
      year: '2025'
    },
    {
      slug: 'supply',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Supply Management',
      desc: 'Supplier catalogue, purchase orders and replenishment thresholds in one dashboard.',
      thumb: 'assets/img/portfolio/acceuilstk.png',
      page: 'details/stock.html',
      stack: ['React', 'Node.js', 'Express', 'SQL'],
      year: '2025'
    },
    {
      slug: 'delivery',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Delivery Management',
      desc: 'Dispatch, driver assignment and delivery status tracking from order to doorstep.',
      thumb: 'assets/img/portfolio/livraison.png',
      page: 'details/liv.html',
      stack: ['React', 'Node.js', 'Express', 'SQL'],
      year: '2025'
    },
    {
      slug: 'inventory',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Inventory Management',
      desc: 'Stock movements, reorder points and multi-warehouse inventory built on Laravel.',
      thumb: 'assets/img/portfolio/dynamique/laravel/a.png',
      page: 'details/laravel.html',
      stack: ['Laravel', 'PHP', 'jQuery', 'SQL'],
      year: '2024'
    },
    {
      slug: 'solufact',
      track: 'dev',
      cat: 'desktop',
      catLabel: 'Desktop Application',
      title: 'Solufact',
      desc: 'Offline invoicing desktop application with a local database and printable documents.',
      thumb: 'assets/img/deskt/aaz.png',
      page: 'details/solufact.html',
      stack: ['Python', 'Tkinter', 'SQLite'],
      year: '2024'
    },
    {
      slug: 'flask-redis',
      track: 'dev',
      cat: 'backend',
      catLabel: 'Backend & QA',
      title: 'Flask Auth + Redis',
      desc: 'Token authentication service benchmarked under load with Locust to find its breaking point.',
      thumb: 'assets/img/charge/1.png',
      page: 'details/flask-redis.html',
      stack: ['Flask', 'Redis', 'Locust'],
      year: '2026'
    },
    {
      slug: 'cest-mon-choix',
      track: 'dev',
      cat: 'website',
      catLabel: 'Dynamic Website',
      title: "C'est Mon Choix",
      desc: 'E-commerce storefront with product catalogue, cart and order handling over a PDO data layer.',
      thumb: 'assets/img/portfolio/ecom.png',
      page: 'details/commdet.html',
      stack: ['PHP', 'PDO', 'jQuery', 'SQL'],
      year: '2024'
    },
    {
      slug: 'astias-admin',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Admin Dashboard',
      title: 'Astias Travel — Back Office',
      desc: 'Administration dashboard for reservations, destinations, customers and inbound messages.',
      thumb: 'assets/img/portfolio/admin.png',
      page: 'details/dashtrav.html',
      stack: ['PHP', 'jQuery', 'SQL'],
      year: '2024'
    },
    {
      slug: 'littlejardin',
      track: 'dev',
      cat: 'website',
      catLabel: 'Dynamic Website',
      title: 'littleJardin',
      desc: 'Gardening shop and advice site with an Ajax-driven catalogue and customer area.',
      thumb: 'assets/img/portfolio/jrd1.png',
      page: 'details/jard.html',
      stack: ['PHP', 'Ajax', 'jQuery', 'SQL'],
      year: '2023'
    },
    {
      slug: 'learning-platform',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'Online Learning Platform',
      desc: 'Course delivery with lesson progression, enrolments and an instructor back office.',
      thumb: 'assets/img/portfolio/design cours flasck/cours1.png',
      page: 'details/cours.html',
      stack: ['Flask', 'MongoDB', 'CSS'],
      year: '2025'
    },
    {
      slug: 'myapp-social',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'MyApp — Social Feed',
      desc: 'Social network with a news feed, stories, friend graph and publication management.',
      thumb: 'assets/img/ejs/ejs1.png',
      page: 'details/ejs.html',
      stack: ['Node.js', 'Express', 'EJS', 'MongoDB'],
      year: '2025'
    },
    {
      slug: 'coachfit',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'CoachFit',
      desc: 'Fitness coaching site presenting programmes, coaches and session booking.',
      thumb: 'assets/img/coachdes/c1.png',
      page: 'details/coch.html',
      stack: ['Bootstrap', 'HTML', 'CSS', 'JavaScript'],
      year: '2025'
    },

    /* ==========================================================
       DEVELOPMENT — live sites & repositories
       ========================================================== */

    {
      slug: 'socienet',
      track: 'dev',
      cat: 'webapp',
      catLabel: 'Web Application',
      title: 'SociéNet',
      desc: 'Social network prototype with profiles, a photo feed, reactions and comments.',
      thumb: 'assets/img/portfolio/res.png',
      repo: 'https://github.com/safiamassaid/reseau',
      stack: ['PHP', 'SQL', 'JavaScript'],
      year: '2023'
    },
    {
      slug: 'travel-agency',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Travel Agency',
      desc: 'Tailor-made trip site presenting circuits, destinations and an enquiry flow.',
      thumb: 'assets/img/portfolio/travel.png',
      live: 'https://jolly-gaufre-21f80b.netlify.app',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },

    {
      slug: 'todo-list',
      track: 'dev',
      cat: 'website',
      catLabel: 'Static Site',
      title: 'My To-Do List',
      desc: 'Task list that survives a refresh — add, complete and delete tasks persisted in local storage.',
      thumb: 'assets/img/portfolio/todo.png',
      live: 'https://celadon-bubblegum-529501.netlify.app/',
      stack: ['JavaScript', 'LocalStorage'],
      year: '2023'
    },

    {
      slug: 'massaid-mahdi',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Massaid Mahdi — Poetry & Music',
      desc: 'Artist site for a poet and musician, pairing written work with musical performances.',
      thumb: 'assets/img/mah.png',
      live: 'https://fantastic-puppy-22e0c6.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2024'
    },

    {
      slug: 'salon-beaute',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Salon Beauté',
      desc: 'Beauty salon site presenting treatments, pricing and booking contact.',
      thumb: 'assets/img/portfolio/bt.png',
      live: 'https://leafy-cat-0a64b6.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },
    {
      slug: 'greeny',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Greeny',
      desc: 'At-home garden maintenance service with a service list and appointment request flow.',
      thumb: 'assets/img/portfolio/jrd.png',
      live: 'https://timely-syrniki-cf7619.netlify.app',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },
    {
      slug: 'dev-info',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'DEV INFO',
      desc: 'Web development training site with course listings, projects and a member login.',
      thumb: 'assets/img/portfolio/dev.png',
      live: 'https://golden-capybara-7ae159.netlify.app',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },

    {
      slug: 'cabinet-avocats',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: "Cabinet d'Avocats",
      desc: 'Law firm site covering areas of expertise, the practice, appointments and a blog.',
      thumb: 'assets/img/portfolio/avocat.png',
      live: 'https://sunny-haupia-02cbf9.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },
    {
      slug: 'creche',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Crèche Da Advocacia',
      desc: 'Nursery site presenting the team, services and an online pre-registration form.',
      thumb: 'assets/img/portfolio/crech.png',
      live: 'https://regal-belekoy-6e60cc.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2023'
    },
    {
      slug: 'firstboot',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'FirstBoot',
      desc: 'Social platform landing page with an inline sign-up form, built on the Bootstrap grid.',
      thumb: 'assets/img/portfolio/boot.png',
      live: 'https://thunderous-frangollo-4a1970.netlify.app/',
      stack: ['Bootstrap', 'HTML', 'CSS'],
      year: '2023'
    },
    {
      slug: 'boottwo',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'BootTwo',
      desc: 'Editorial landing page for a poster studio, exploring Bootstrap typography and layout.',
      thumb: 'assets/img/portfolio/boota.png',
      live: 'https://vocal-kitsune-f6846e.netlify.app/',
      stack: ['Bootstrap', 'HTML', 'CSS'],
      year: '2023'
    },
    {
      slug: 'jacinto-design',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Jacinto Design',
      desc: 'Interior architecture studio site covering modern architecture, interiors and outdoor spaces.',
      thumb: 'assets/img/portfolio/hotmel.png',
      live: 'https://lovely-tarsier-41d327.netlify.app',
      stack: ['HTML', 'CSS', 'JavaScript'],
      year: '2024'
    },
    {
      slug: 'recherche-repas',
      track: 'dev',
      cat: 'website',
      catLabel: 'Static Site',
      title: 'Recherche de Repas',
      desc: 'Recipe finder that queries a meal API by keyword and returns a random dish on demand.',
      thumb: 'assets/img/portfolio/helkich.png',
      live: 'https://preeminent-tanuki-1e0b83.netlify.app',
      stack: ['JavaScript', 'REST API'],
      year: '2024'
    },
    {
      slug: 'vue-creative-portfolio',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Creative Portfolio',
      desc: 'Vue landing page for an artist showcase, with services, FAQ and subscription sections.',
      thumb: 'assets/img/portfolio/vu1.png',
      repo: 'https://gitlab.com/safia1704832/vueportfolio.git',
      stack: ['Vue.js', 'Vite', 'CSS'],
      year: '2024'
    },
    {
      slug: 'vue-personal-portfolio',
      track: 'dev',
      cat: 'website',
      catLabel: 'Website',
      title: 'Personal Portfolio',
      desc: 'Illustrated Vue portfolio with a work section and a warm single-colour identity.',
      thumb: 'assets/img/portfolio/vu2.png',
      repo: 'https://gitlab.com/safia1704832/illustartion-vue-js-portofolio.git',
      stack: ['Vue.js', 'CSS'],
      year: '2024'
    },

    /* ==========================================================
       DESIGN — featured
       ========================================================== */

    {
      slug: 'healthmate',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Mobile UI — Figma',
      title: 'HealthMate',
      desc: 'Health companion app: onboarding, authentication, specialist browsing and appointment tracking.',
      long: 'A full mobile flow for a health companion app — from onboarding and account creation through browsing doctors by specialty to the upcoming-appointment dashboard and on-call emergency path.',
      thumb: 'assets/img/mobil/1.png',
      figma: 'https://www.figma.com/design/qIYmEI9gl8CmpXqgMrC3V8/deisgn-mobile?node-id=40-104&t=cO62Acn3pJyyLHWn-1',
      stack: ['Figma', 'Mobile', 'Design System'],
      year: '2025',
      featured: true,
      metrics: [
        { value: '4+', label: 'Screens' },
        { value: 'iOS', label: 'Target' }
      ]
    },
    {
      slug: 'catering-ui',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Desktop UI — Figma',
      title: 'Catering Management',
      desc: 'Desktop interface for a catering back office — dashboard, stock, orders and service planning.',
      long: 'The interface layer for a catering operation: a dashboard that surfaces the day, plus stock, ordering and service-planning screens designed to be read at a glance in a working kitchen.',
      thumb: 'assets/img/dsk/acc.png',
      page: 'designdetail/stock.html',
      figma: 'https://www.figma.com/design/KLGvIYweTvfZYbEHY5Im93/gestion-de-stock?t=b3zgIkrdY6uABW38-1',
      stack: ['Figma', 'Desktop', 'Dashboard'],
      year: '2025'
    },

    /* ==========================================================
       DESIGN — case studies
       ========================================================== */

    {
      slug: 'transactions',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: "Transactions d'argent",
      desc: 'Money transfer interface covering balance, transfer flow and transaction history.',
      thumb: 'assets/img/ts/ts1.png',
      page: 'designdetail/transact.html',
      stack: ['Figma', 'Fintech'],
      year: '2025'
    },
    {
      slug: 'event-reservation',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Event Reservation',
      desc: 'Event discovery and seat reservation interface, from listing through to confirmation.',
      thumb: 'assets/img/ed/ed1.png',
      page: 'designdetail/evvent.html',
      stack: ['Figma', 'Booking'],
      year: '2025'
    },
    {
      slug: 'life-coach',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Life Coach',
      desc: 'Coaching platform interface pairing programme browsing with session scheduling.',
      thumb: 'assets/img/life ceach/asd.png',
      page: 'designdetail/life.html',
      stack: ['Figma', 'Web'],
      year: '2025'
    },
    {
      slug: 'match-master-pro',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Match Master Pro',
      desc: 'Sports match management interface for fixtures, teams and live score tracking.',
      thumb: 'assets/img/macht master pro/as.png',
      page: 'designdetail/match.html',
      stack: ['Figma', 'Dashboard'],
      year: '2025'
    },
    {
      slug: 'production',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Web App + UI Mockup',
      title: 'Production Management',
      desc: 'Manufacturing production tracking — work orders, line status and output reporting.',
      thumb: 'assets/img/portfolio/gp/gp1.png',
      page: 'details/peoduction.html',
      stack: ['Laravel', 'PostgreSQL', 'Figma'],
      year: '2025'
    },
    {
      slug: 'bullet-journal',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX Mockup',
      title: 'Digital Bullet Journal',
      desc: 'Planner interface translating the analogue bullet-journal system into a digital layout.',
      thumb: 'assets/img/bullet/de.png',
      page: 'designdetail/sullet.html',
      stack: ['Figma', 'Productivity'],
      year: '2025'
    },
    {
      slug: 'ecommerce-shoes',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'E-commerce Shoes',
      desc: 'Footwear storefront design — product grid, detail page and checkout flow.',
      thumb: 'assets/img/chose/ind.png',
      page: 'designdetail/ecomm.html',
      stack: ['Figma', 'E-commerce'],
      year: '2025'
    },
    {
      slug: 'gynecology-clinic',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Gynecology Clinic',
      desc: 'Clinic site design covering practitioners, services and appointment booking.',
      thumb: 'assets/img/genyc/gn1.png',
      page: 'designdetail/gen.html',
      stack: ['Figma', 'Healthcare'],
      year: '2025'
    },
    {
      slug: 'restaurant-booking',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Restaurant Table Booking',
      desc: 'Table reservation interface with floor plan selection and sitting-time picker.',
      thumb: 'assets/img/resrest/rr1.png',
      page: 'designdetail/rest.html',
      stack: ['Figma', 'Booking'],
      year: '2025'
    },
    {
      slug: 'train-booking',
      track: 'design',
      cat: 'uiux',
      catLabel: 'UI / UX — Figma',
      title: 'Train Ticket Booking',
      desc: 'Rail booking flow from route search through seat selection to ticket issue.',
      thumb: 'assets/img/traon/tr7.png',
      page: 'designdetail/train.html',
      stack: ['Figma', 'Booking'],
      year: '2025'
    },
    {
      slug: 'odyssee-travel',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Web UI — Figma',
      title: 'Odyssée Travel',
      desc: 'Travel agency website design — hero, trip planning narrative and destination cards.',
      thumb: 'assets/img/travelalic.png',
      figma: 'https://www.figma.com/design/j285OnHxISNRTHwrkVQT4A/site-alicia?node-id=0-1&t=cO62Acn3pJyyLHWn-1',
      stack: ['Figma', 'Web'],
      year: '2025'
    },
    {
      slug: 'odyssee-dashboard',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Dashboard UI — Figma',
      title: 'Odyssée — Agency Dashboard',
      desc: 'Agency back office showing reservations by destination and booking status distribution.',
      thumb: 'assets/img/dash.png',
      figma: 'https://www.figma.com/design/j285OnHxISNRTHwrkVQT4A/site-alicia?node-id=0-1&t=cO62Acn3pJyyLHWn-1',
      stack: ['Figma', 'Dashboard', 'Data viz'],
      year: '2025'
    },
    {
      slug: 'olten-erp',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Dashboard UI — Figma',
      title: 'Olten ERP',
      desc: 'ERP dashboard design — order volume, top products, shipment stats and country mapping.',
      thumb: 'assets/img/erpsoft.jpg',
      figma: 'https://www.figma.com/design/VT9JOA2dnDrOPoF3ON8Xh4/Sans-titre?node-id=0-1&t=HkYxd1kBSGB6rHkD-1',
      stack: ['Figma', 'Dashboard', 'Data viz'],
      year: '2026'
    },
    {
      slug: 'olten-marketplace',
      track: 'design',
      cat: 'uiux',
      catLabel: 'Web UI — Figma',
      title: 'Olten Marketplace',
      desc: 'Marketplace landing design for rental, resale, carpooling and delivery in one interface.',
      thumb: 'assets/img/locat.jpg',
      figma: 'https://www.figma.com/design/7EVHg2vq74UpBR7tn6KYvy/Sans-titre?t=HkYxd1kBSGB6rHkD-1',
      stack: ['Figma', 'Marketplace'],
      year: '2026'
    }

  ];
});

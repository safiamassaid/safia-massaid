#!/usr/bin/env node
/* ============================================================
   build-service-pages.js
   ------------------------------------------------------------
   Rebuilds the four service pages from the content blocks below.
   The pages are written whole every run, so never hand-edit them —
   edit SERVICES and run:

       node tools/build-service-pages.js

   The <head> only carries the PF:SEO sentinels: tools/build-seo.js
   owns every meta tag on the site, so run it afterwards.

   Copy rules for SERVICES
     - claim nothing that is not backed by a project or a document
       already published on this site
     - "focus" is what is current in the discipline, tied to work
       actually done here — not a trend list
     - deliverables mirror the .pmd-card component on the homepage,
       so the two read as one system
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ------------------------------------------------------------
   The shared header, lifted from index.html
   ------------------------------------------------------------ */

function sharedHeader() {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
  const MARKERS = ['<!-- Header -->', '<!-- Header Flottant -->'];
  let start = home.findIndex((l) => MARKERS.some((m) => l.includes(m)));
  if (start === -1) {
    start = home.findIndex((l) => l.indexOf('class="fixed top-4 left-0 right-0 z-50') !== -1);
  }
  if (start === -1) return '';
  let depth = 0;
  const out = [];
  for (let i = start; i < home.length; i++) {
    const line = home[i];
    out.push(line);
    depth += (line.match(/<div\b/g) || []).length;
    depth -= (line.match(/<\/div>/g) || []).length;
    if (out.length > 3 && depth <= 0 && line.includes('</div>')) break;
  }
  return out
    .join('\n')
    .replace(/href="index\.html/g, 'href="../index.html')
    .replace(/href="projects\.html/g, 'href="../projects.html')
    .replace(/href="docs\.html/g, 'href="../docs.html');
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------
   Content
   ------------------------------------------------------------ */

const SERVICES = [
  /* ==========================================================
     01 — Web development
     ========================================================== */
  {
    slug: 'service/service-details.html',
    file: 'service-details.html',
    key: 'web',
    icon: 'bi-code-slash',
    eyebrow: '01 / Engineering',
    title: 'Web Development',
    short: 'Web Development',
    lead: 'Applications built to specification, tested before they ship, and documented well enough that someone else can maintain them.',
    image: 'assets/img/service-web.png',

    intro: [
      'I work across the whole stack, which in practice means one person owns the database schema, the API contract and the interface that consumes them — so the three agree. <strong>Laravel and PostgreSQL</strong> for management systems, <strong>React or Vue</strong> where the interface carries real state, <strong>Node/Express or Flask</strong> when the job is a service rather than a site.',
      'Most of what I build replaces a spreadsheet or a paper process: a medical practice’s patient records, a factory’s production planning, a university’s exam timetabling. That work is less about framework fashion than about modelling a business rule correctly the first time, and making the screens match how the job is actually done.',
      'Every project ships with a test pass and written documentation. The medical practice system went out with two QA reports; the authentication service was benchmarked under load until it broke, so its limit is a number rather than a guess.'
    ],

    deliverables: [
      ['Architecture', 'bi-diagram-3', 'Data model & API contract', 'Entity design · REST endpoints · Auth and roles'],
      ['Backend', 'bi-hdd-stack', 'Application server', 'Laravel · Node/Express · Flask · ASP.NET Core'],
      ['Frontend', 'bi-window', 'The interface on top', 'React · Vue · Tailwind · Responsive by default'],
      ['Data', 'bi-database', 'Storage and caching', 'PostgreSQL · MySQL · MongoDB · Redis'],
      ['Quality', 'bi-shield-check', 'Tested before handover', 'Functional pass · API tests · Bug report'],
      ['Handover', 'bi-file-earmark-text', 'Documentation', 'Technical report · API reference · Deployment notes']
    ],

    process: [
      ['Scope', 'We agree in writing what "done" means before anything is built. That document is what the test phase is later measured against.'],
      ['Model', 'Database schema and API contract first. The screens follow the data, not the other way round — it is the order that stops a rewrite at week six.'],
      ['Build', 'Short increments you can open and click, rather than a three-month silence followed by a surprise.'],
      ['Prove', 'Functional and API tests, a bug report with severities, then handover with the technical documentation.']
    ],

    focus: [
      ['bi-speedometer2', 'Performance treated as a requirement', 'Core Web Vitals move both your ranking and your bounce rate. Images sized and lazy-loaded, no render-blocking bundle, and the result measured rather than assumed.'],
      ['bi-universal-access', 'Accessibility by default', 'Semantic markup, keyboard paths and real contrast ratios from the start. Retrofitting accessibility onto a finished interface costs several times what building it in does.'],
      ['bi-plug', 'API before interface', 'A documented REST contract means the mobile app, the back office and the next integration read from one source instead of three that drift apart.']
    ],

    tools: ['Laravel', 'React', 'Vue.js', 'Node.js', 'Express', 'Flask', 'ASP.NET Core', 'PostgreSQL', 'MongoDB', 'Redis', 'Tailwind', 'Git'],
    proof: [['41', 'Projects', 'dev'], ['5', 'Technical reports', null], ['3+', 'Years', null]],
    links: [
      ['See the web applications', '../projects.html'],
      ['Read a technical report', '../docs.html']
    ]
  },

  /* ==========================================================
     02 — UI/UX design
     ========================================================== */
  {
    slug: 'service/servicedes.html',
    file: 'servicedes.html',
    key: 'uiux',
    icon: 'bi-palette',
    eyebrow: '02 / Creative',
    title: 'UI/UX Design',
    short: 'UI/UX Design',
    lead: 'Interfaces designed before they are built — so the developer implements a decision instead of guessing at one.',
    image: 'assets/img/service-uiux.png',

    intro: [
      'I design in <strong>Figma</strong>, and I design for something that has to be built. That means components before screens, a type scale and a colour set that survive contact with a real page, and states — empty, loading, error — drawn rather than discovered in production.',
      'The work starts with the flow, not the pixels: what the user came to do, how many steps it takes today, and how many it should take. On a health companion app that meant onboarding, account creation, browsing practitioners by specialty and an on-call emergency path, drawn end to end before a line of React Native existed.',
      'What you receive is a file a developer can work from — named layers, a component library, spacing on a grid, and a prototype that clicks through the real journey rather than three disconnected mockups.'
    ],

    deliverables: [
      ['Research', 'bi-search', 'Flows and user journeys', 'Task analysis · Current-state audit · Wireframes'],
      ['Interface', 'bi-layout-text-window', 'High-fidelity screens', 'Figma · Mobile and desktop · Every state drawn'],
      ['System', 'bi-grid-3x3-gap', 'Design system', 'Components · Type scale · Colour tokens · Spacing'],
      ['Prototype', 'bi-play-btn', 'Clickable prototype', 'Real navigation · Testable before a line of code'],
      ['Handover', 'bi-box-arrow-up-right', 'Developer specification', 'Named layers · Measurements · Assets exported'],
      ['Brand', 'bi-vector-pen', 'Visual identity', 'Illustrator · Iconography · Colour and type direction']
    ],

    process: [
      ['Understand', 'The job to be done, who does it, and how many steps it takes them today. Usually the answer is more than anyone expected.'],
      ['Structure', 'Flows and wireframes. The argument about layout happens here, where changing it costs an afternoon instead of a sprint.'],
      ['Design', 'High fidelity on a grid, with empty, loading and error states drawn — not left to the developer to invent.'],
      ['Hand over', 'A component library and a clickable prototype, plus the measurements. Not a folder of flat images.']
    ],

    focus: [
      ['bi-columns-gap', 'Design systems over one-off screens', 'A token set and a component library make the tenth screen cost a fraction of the first — and the product still looks like one product a year later.'],
      ['bi-eye', 'Contrast checked, not eyeballed', 'WCAG contrast ratios verified inside the Figma file. A palette that fails at 4.5:1 is a redesign discovered far too late.'],
      ['bi-phone', 'Mobile-first, dark mode considered', 'Most traffic is a phone. Designing the small screen first stops the desktop layout from being crushed into it afterwards.']
    ],

    tools: ['Figma', 'Adobe XD', 'Illustrator', 'Wireframing', 'Prototyping', 'Design systems', 'Responsive design'],
    proof: [['16', 'Designs', 'design'], ['10', 'Case studies', null], ['3+', 'Years', null]],
    links: [
      ['See the design work', '../projects.html#design'],
      ['Open a UI case study', '../designdetail/life.html']
    ]
  },

  /* ==========================================================
     03 — Project management
     ========================================================== */
  {
    slug: 'service/servicegest.html',
    file: 'servicegest.html',
    key: 'pm',
    icon: 'bi-kanban',
    eyebrow: '03 / Leadership',
    title: 'Project Management',
    short: 'Project Management',
    lead: 'The specification, the plan and the governance a software build gets run against — written down, not improvised.',
    image: 'assets/img/service-pm.png',

    intro: [
      'I came to project management from building, which changes what the documents look like. A <strong>cahier des charges</strong> written by someone who has implemented one reads differently: the requirements are testable, the estimate accounts for the parts that always take longer, and the architecture section is not decorative.',
      'The work is the paper trail that keeps a team pointed at one date — expression des besoins, étude de faisabilité, UML models, a Gantt with a real critical path, a RACI so nobody assumes someone else is doing it, and a risk register that gets reviewed rather than filed.',
      'Ten of those documents are downloadable in the library: full delivery plans for a catering platform, an industrial production system, a school canteen SaaS and others. They are the actual deliverables, not templates.'
    ],

    deliverables: [
      ['Technical Design', 'bi-diagram-3', 'Architecture Système & UML', 'Class diagrams · Use case · Sequence diagrams'],
      ['Strategic Docs', 'bi-file-earmark-text', 'Cahier des Charges (CDC)', 'Requirement high detail · Functional specifications'],
      ['Analysis', 'bi-clipboard-data', 'Étude de faisabilité', 'Financial & technical analysis'],
      ['Roadmap Planning', 'bi-bar-chart-steps', 'Gantt / Active Flow', 'Timeline · Critical path · Milestone tracking'],
      ['Expression des besoins', 'bi-list-check', 'Requirement Engineering', 'Business needs · Functional & technical requirements'],
      ['Governance', 'bi-grid-3x3-gap', 'Matrice RACI / Benchmark', 'Roles · Responsibilities · Competitive analysis']
    ],

    process: [
      ['Frame', 'Expression des besoins: what the business actually needs, captured before anyone proposes a solution to it.'],
      ['Specify', 'Cahier des charges and UML models — requirements written so that the QA phase can turn each one into a pass or a fail.'],
      ['Plan', 'Gantt with a critical path, RACI, risk register and a budget. Sprints run inside that plan rather than instead of it.'],
      ['Steer', 'Sprint reviews, an updated risk register, and a status anybody can read in under a minute.']
    ],

    focus: [
      ['bi-shuffle', 'Agile inside a plan, not instead of one', 'Sprints govern how the work gets done. A client still needs a date, a budget and a scope — the plan holds those, the sprints deliver against them.'],
      ['bi-check2-square', 'Requirements that can be tested', '"The system must be fast" is not a requirement. A specification the test phase can convert into pass or fail is the one that protects the delivery.'],
      ['bi-exclamation-triangle', 'Risk written down early', 'A risk register reviewed weekly costs an hour a week. The same risk discovered at the release costs the release.']
    ],

    tools: ['MS Project', 'Scrum', 'Agile', 'Jira', 'Trello', 'Asana', 'Monday.com', 'Confluence', 'UML', 'RACI'],
    proof: [['10', 'Delivery plans', null], ['21', 'Documents', null], ['3+', 'Years', null]],
    links: [
      ['Read the delivery documentation', '../docs.html'],
      ['See the projects behind them', '../projects.html']
    ]
  },

  /* ==========================================================
     04 — QA & testing
     ========================================================== */
  {
    slug: 'service/servicetest.html',
    file: 'servicetest.html',
    key: 'qa',
    icon: 'bi-shield-check',
    eyebrow: '04 / Assurance',
    title: 'QA & Testing',
    short: 'QA & Testing',
    lead: 'Functional, API and load campaigns — and the written evidence that a release is actually ready to go out.',
    image: 'assets/img/service-qa.png',

    intro: [
      'Testing is the phase that gets cut first and costs the most when it is. I run it with its own deliverables: a test plan written from the specification, a campaign executed against it, and a bug report with severities a developer can act on without needing a meeting first.',
      'That covers functional and regression passes, <strong>API testing with Postman</strong> collections, cross-browser and responsive validation, and load testing when the real question is how many users it takes before the thing falls over. On a Flask authentication service I ran <strong>Locust</strong> against it until it broke, so the capacity limit was measured instead of assumed.',
      'Six test and bug reports sit in the documentation library — the medical practice system, the travel platform, the exam-planning application. They show the format: reproduction steps, expected versus actual, severity, and resolution status.'
    ],

    deliverables: [
      ['Planning', 'bi-clipboard-check', 'Test plan', 'Scenarios from the spec · Coverage · Entry and exit criteria'],
      ['Execution', 'bi-list-task', 'Functional & regression campaign', 'Manual passes · Cross-browser · Responsive validation'],
      ['API', 'bi-plug', 'Endpoint and contract testing', 'Postman collections · Status codes · Payload validation'],
      ['Load', 'bi-speedometer2', 'Performance testing', 'Locust · Breaking point · Response times under load'],
      ['Reporting', 'bi-bug', 'Bug report with severities', 'Reproduction steps · Expected vs actual · Screenshots'],
      ['Sign-off', 'bi-patch-check', 'Acceptance report', 'UAT · Release readiness · Known issues']
    ],

    process: [
      ['Read', 'The specification first, and what this release is supposed to prove. Ambiguity found here never becomes a bug later.'],
      ['Plan', 'Scenarios, coverage and what counts as a pass — agreed before execution starts, so the result is not negotiable afterwards.'],
      ['Execute', 'Functional, then regression, then API, then load. In that order, because each one narrows what the next has to explain.'],
      ['Report', 'Severities, reproduction steps, screenshots, and a clear call on whether the release is ready.']
    ],

    focus: [
      ['bi-arrow-left-right', 'Shift left — review the spec, not just the build', 'Reading a specification for testability catches the ambiguity while it still costs nothing. Those are defects that never get written into code at all.'],
      ['bi-diagram-2', 'API coverage outlives UI coverage', 'The interface changes with every redesign; the contract underneath changes far less. That is where durable test coverage belongs.'],
      ['bi-graph-up', 'Load tested to an actual number', '"It should handle the traffic" is a hope. Locust gives you the request rate where latency starts to degrade and the one where it stops responding at all.']
    ],

    tools: ['Postman', 'TestRail', 'Locust', 'DevTools', 'Manual QA', 'Regression', 'Cross-browser', 'Jira'],
    proof: [['6', 'QA reports', null], ['21', 'Documents', null], ['3+', 'Years', null]],
    links: [
      ['Read the test reports', '../docs.html'],
      ['See a load-tested service', '../details/flask-redis.html']
    ]
  }
];

/* ------------------------------------------------------------
   Template
   ------------------------------------------------------------ */

function deliverables(s) {
  return s.deliverables
    .map(([label, icon, name, meta]) => `            <article class="pmd-card">
              <span class="pmd-card__top">
                <span class="pmd-card__icon"><i class="bi ${icon}" aria-hidden="true"></i></span>
                <span class="pmd-card__label">${esc(label)}</span>
              </span>
              <h3 class="pmd-card__name">${esc(name)}</h3>
              <p class="pmd-card__meta">${esc(meta)}</p>
            </article>`)
    .join('\n\n');
}

function steps(s) {
  return s.process
    .map(([title, text], n) => `            <li class="svp-step">
              <span class="svp-step__n">0${n + 1}</span>
              <span>
                <h3 class="svp-step__t">${esc(title)}</h3>
                <p class="svp-step__d">${esc(text)}</p>
              </span>
            </li>`)
    .join('\n')
}

function focus(s) {
  return s.focus
    .map(([icon, title, text]) => `          <article class="svp-fcard">
            <span class="svp-fcard__icon"><i class="bi ${icon}" aria-hidden="true"></i></span>
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
          </article>`)
    .join('\n\n');
}

function others(s) {
  return SERVICES.filter((o) => o.slug !== s.slug)
    .map((o) => `          <a class="svp-mcard" href="${o.file}">
            <span class="svp-mcard__icon"><i class="bi ${o.icon}" aria-hidden="true"></i></span>
            <span class="svp-mcard__text">
              <b>${esc(o.title)}</b>
              <span class="svp-mcard__kind">${esc(o.eyebrow.split('/')[1].trim())}</span>
            </span>
            <i class="bi bi-arrow-right go" aria-hidden="true"></i>
          </a>`)
    .join('\n\n');
}

function page(s, header) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Every meta tag on this page is written by tools/build-seo.js -->
  <!-- PF:SEO:START -->
  <!-- PF:SEO:END -->

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: { primary: '#8C4A6B', dark: '#1a1a1a' } } }
    }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap">

  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/portfolio.css">
</head>

<body class="text-slate-900 overflow-x-hidden bg-white">

${header}

  <main>

    <section class="pf-page-head">
      <div class="pf-page-head__inner">
        <nav class="pf-crumb" aria-label="Breadcrumb">
          <a href="../index.html">Home</a>
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
          <a href="../index.html#services">Services</a>
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
          <span aria-current="page">${esc(s.title)}</span>
        </nav>
        <p class="pf-eyebrow">${esc(s.eyebrow)}</p>
        <h1>${esc(s.title)}</h1>
        <p>${esc(s.lead)}</p>
      </div>
    </section>

    <section class="svp-banner">
      <div class="svp-wrap">
        <div class="svp-banner__frame">
          <img src="../${s.image}" alt="${esc(s.title)} — ${esc(s.lead)}"
            width="1200" height="360" fetchpriority="high" decoding="async">
        </div>
      </div>
    </section>

    <section class="svp-body">
      <div class="svp-wrap svp-grid">

        <div class="svp-main">

${s.intro.map((t) => `          <p>${t}</p>`).join('\n')}

          <h2 class="svp-h2">What you get</h2>
          <p class="svp-note">Every engagement produces artefacts you keep — not a verbal handover.</p>

          <div class="pmd__grid">

${deliverables(s)}

          </div>

          <h2 class="svp-h2">How I work</h2>
          <p class="svp-note">Four steps, in this order, on every engagement.</p>

          <ol class="svp-steps">

${steps(s)}

          </ol>

        </div>

        <aside class="svp-side">

          <div class="svp-panel">
            <p class="pf-eyebrow" style="margin-bottom:14px">Track record</p>
            <dl class="svp-proof">
${s.proof.map(([v, l, c]) => `              <div>
                <b${c ? ` data-pf-count="${c}"` : ''}>${esc(v)}</b>
                <span>${esc(l)}</span>
              </div>`).join('\n')}
            </dl>
          </div>

          <div class="svp-panel">
            <p class="pf-eyebrow" style="margin-bottom:14px">Tools</p>
            <ul class="pf-chips">
${s.tools.map((t) => `              <li class="pf-chip">${esc(t)}</li>`).join('\n')}
            </ul>
          </div>

${s.links.map(([label, href]) => `          <a class="svp-link" href="${href}">
            <span>${esc(label)}</span>
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </a>`).join('\n\n')}

          <div class="svp-next">
            <p class="pf-eyebrow" style="color:rgba(255,255,255,.5); margin-bottom:12px">Next step</p>
            <p>Tell me what you are building and what "done" looks like. You will get back a scope, a timeline and a price — not a sales call.</p>
            <a href="../index.html#contact" class="pf-btn pf-btn--primary">
              Start a project <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </a>
          </div>

        </aside>

      </div>
    </section>

    <section class="svp-focus">
      <div class="svp-wrap">

        <div class="svp-focus__head">
          <div>
            <p class="pf-eyebrow">Current focus</p>
            <h2>What this discipline is asking for right now</h2>
          </div>
          <p>Three things I put deliberate effort into on every ${esc(s.title)} engagement — they are what separates a project that ages well from one that does not.</p>
        </div>

        <div class="svp-focus__grid">

${focus(s)}

        </div>

      </div>
    </section>

    <section class="svp-more">
      <div class="svp-wrap">

        <p class="pf-eyebrow">More services</p>
        <h2 class="svp-h2" style="margin-top:8px">Often the same project needs all four</h2>

        <div class="svp-more__grid">

${others(s)}

        </div>

      </div>
    </section>

  </main>

  <!-- PF:FOOTER:START -->
  <!-- PF:FOOTER:END -->

  <!-- PF:LIGHTBOX:START -->
  <!-- PF:LIGHTBOX:END -->

  <script src="../assets/js/main.js"></script>
  <script src="../assets/data/projects.js"></script>
  <script src="../assets/js/portfolio.js"></script>

</body>

</html>
`;
}

/* ------------------------------------------------------------ */

const header = sharedHeader();
if (!header.includes('main-header')) {
  console.error('Could not extract the shared header from index.html — aborting.');
  process.exit(1);
}

SERVICES.forEach((s) => {
  const full = path.join(ROOT, s.slug);
  const next = page(s, header);
  const prev = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  if (prev === next) {
    console.log('unchanged ' + s.slug);
    return;
  }
  fs.writeFileSync(full, next, 'utf8');
  console.log((prev === null ? 'created   ' : 'written   ') + s.slug);
});

console.log('\n' + SERVICES.length + ' service pages — run build-seo.js and build-cards.js next.');

#!/usr/bin/env node
/* ============================================================
   build-service-pages.js
   ------------------------------------------------------------
   Rebuilds the three service pages on the site's current chrome.

   They were the last files still running on the original Bootstrap
   template: 20 references each to an assets/vendor/ directory that
   does not exist (Bootstrap, AOS, glightbox, swiper, isotope,
   typed.js, purecounter, waypoints), so they rendered unstyled.
   Their copy was good, so it is carried over verbatim; only the
   shell is replaced.

       node tools/build-service-pages.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://massaid-safia.netlify.app/';

/* The header block is owned by index.html — read it rather than
   duplicating it, so a change there flows through here. */
function sharedHeader() {
  const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n');
  const start = home.findIndex((l) => l.includes('<!-- Header Flottant -->'));
  let depth = 0;
  let end = start;
  let opened = false;
  for (let i = start + 1; i < home.length; i++) {
    depth += (home[i].match(/<div\b/g) || []).length;
    depth -= (home[i].match(/<\/div>/g) || []).length;
    if (depth > 0) opened = true;
    // the block closes when the wrapper div balances out again
    if (opened && depth <= 0) { end = i; break; }
  }
  return home
    .slice(start, end + 1)
    .join('\n')
    .replace(/href="#([a-z]+)"/g, 'href="../index.html#$1"')
    .replace(/href="projects\.html"/g, 'href="../projects.html"')
    .replace(/href="docs\.html"/g, 'href="../docs.html"')
    // Home is the bold item on the homepage; nothing is current here
    .replace(
      /class="nav-link text-\[11px\] font-bold uppercase tracking-widest text-slate-900"/g,
      'class="nav-link text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary"'
    );
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------
   Content — carried over from the original pages
   ------------------------------------------------------------ */

const SERVICES = [
  {
    slug: 'service/service-details.html',
    eyebrow: '01 / Engineering',
    title: 'Web Development',
    lead: 'Combining technology and innovation for successful projects.',
    image: 'assets/img/service.jpg',
    paragraphs: [
      "As a web developer, I use a combination of modern technologies and agile methodologies to design and develop high-performance and engaging websites. Whether it's a showcase site, an e-commerce platform, or a complex web application, I ensure optimal project management using tools such as Visual Studio Code for development, Git for version control, and frameworks like React.js for a dynamic user experience.",
      'The Scrum methodology allows me to structure development in sprints, ensuring maximum flexibility and continuous product improvement. With the integration of project management tools such as Trello and Jira, I effectively coordinate development teams, ensuring the delivery of robust, scalable solutions perfectly tailored to my clients’ needs.',
      'My approach to web development focuses on innovation, quality, and efficiency, aiming to create websites that captivate users while meeting the highest technical standards.'
    ],
    included: [
      'Front-end development with HTML, CSS, JavaScript, and modern frameworks like React.js.',
      'Using Git for efficient version control and collaboration.',
      'Scrum methodology for agile project management and iterative deliveries.'
    ],
    tools: ['React.js', 'Laravel', 'Node.js', 'PostgreSQL', 'Git', 'Jira'],
    relatedLabel: 'See the web applications',
    relatedHref: '../projects.html'
  },
  {
    slug: 'service/servicedes.html',
    eyebrow: '02 / Creative',
    title: 'UI/UX Design',
    lead: 'Merging aesthetics and functionality with modern tools.',
    image: 'assets/img/graphe.jpg',
    paragraphs: [
      'As a web designer, I combine creativity and technology to create visually appealing and intuitive interfaces. I use tools like Figma for UI/UX design, ensuring that each design is not only beautiful but also functional and user-centered. My design process is supported by an agile methodology, allowing me to collaborate closely with clients and development teams to create engaging digital experiences.',
      'By integrating tools like Figma and collaboration platforms such as Miro, I create interactive prototypes that allow for real-time visualization and refinement of concepts. The Scrum methodology ensures continuous iteration, enabling adjustments to designs based on user feedback and project needs.',
      'My goal is to create designs that not only capture attention but also enhance the user experience, turning each project into a visual and functional success.'
    ],
    included: [
      'UI/UX design with Figma for modern and user-friendly interfaces.',
      'Application of Scrum methodology for an iterative and collaborative design process.',
      'Interactive prototyping to test and refine designs before development.'
    ],
    tools: ['Figma', 'Miro', 'Prototyping', 'Design systems', 'Scrum'],
    relatedLabel: 'See the design work',
    relatedHref: '../projects.html#design'
  },
  {
    slug: 'service/servicegest.html',
    eyebrow: '03 / Leadership',
    title: 'IT Project Management',
    lead: 'Steering your projects to success.',
    image: 'assets/img/pexels-fauxels-3183153.jpg',
    paragraphs: [
      'As an experienced IT project manager, I utilize a combination of powerful tools and agile methodologies to ensure the success of your projects. MS Project allows me to plan, track, and adjust each phase of the project with precision, ensuring effective management of resources, timelines, and costs.',
      'The Scrum methodology allows me to break projects into manageable sprints, promoting continuous improvement and rapid adaptation to changes. With transparent and collaborative management, each team member remains aligned with the project goals, facilitating the achievement of desired outcomes.',
      'My approach is based on rigorous planning, open communication, and constant progress monitoring to ensure that each project is delivered on time while meeting the highest quality standards.'
    ],
    included: [
      'Utilization of MS Project for detailed planning and resource management.',
      'Application of Scrum methodology for agile and iterative project management.',
      'Coordination of teams using collaboration tools such as Trello and Slack.'
    ],
    tools: ['MS Project', 'Scrum', 'Jira', 'Trello', 'Slack'],
    relatedLabel: 'Read the delivery documentation',
    relatedHref: '../docs.html'
  }
];

/* ------------------------------------------------------------
   Template
   ------------------------------------------------------------ */

function page(s, header) {
  const desc = s.lead + ' ' + s.included[0];

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${esc(s.title)} — Safia Massaid</title>

  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="Safia Massaid">
  <link rel="canonical" href="${SITE}${s.slug}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Safia Massaid">
  <meta property="og:url" content="${SITE}${s.slug}">
  <meta property="og:title" content="${esc(s.title)} — Safia Massaid">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}${s.image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(s.title)} — Safia Massaid">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}${s.image}">

  <link rel="icon" type="image/png" href="../images/favicon.ico">

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

    <section class="py-14 bg-white">
      <div class="max-w-[1200px] mx-auto px-6">

        <div class="grid lg:grid-cols-12 gap-10 items-start">

          <!-- Narrative -->
          <div class="lg:col-span-8">

            <div class="rounded-[20px] overflow-hidden border border-[#EAE4E7] mb-8">
              <img src="../${s.image}" alt="${esc(s.title)} — working context"
                class="w-full h-[320px] object-cover"
                width="1200" height="320" fetchpriority="high" decoding="async">
            </div>

${s.paragraphs
  .map(
    (t) =>
      `            <p class="text-[14px] leading-[1.85] text-[#6B5C63] mb-5 max-w-[68ch]">${esc(t)}</p>`
  )
  .join('\n')}

          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 flex flex-col gap-4">

            <div class="rounded-[20px] border border-[#EAE4E7] bg-white p-6">
              <p class="pf-eyebrow mb-4">What's included</p>
              <ul class="flex flex-col gap-3 list-none p-0 m-0">
${s.included
  .map(
    (t) =>
      `                <li class="flex gap-2.5 text-[12.5px] leading-[1.6] text-[#3A2E34]">
                  <i class="bi bi-check-circle-fill text-[#0F9D76] text-[13px] mt-0.5 shrink-0" aria-hidden="true"></i>
                  <span>${esc(t)}</span>
                </li>`
  )
  .join('\n')}
              </ul>
            </div>

            <div class="rounded-[20px] border border-[#EAE4E7] bg-white p-6">
              <p class="pf-eyebrow mb-4">Tools</p>
              <ul class="pf-chips">
${s.tools.map((t) => `                <li class="pf-chip">${esc(t)}</li>`).join('\n')}
              </ul>
            </div>

            <a href="${s.relatedHref}"
              class="rounded-[20px] border border-[#EAE4E7] bg-white p-6 flex items-center justify-between gap-4 no-underline hover:border-[rgba(140,74,107,.22)] transition-colors">
              <span class="text-[13px] font-bold text-[#1C1418]">${esc(s.relatedLabel)}</span>
              <i class="bi bi-arrow-right text-primary" aria-hidden="true"></i>
            </a>

            <div class="rounded-[20px] p-6 text-white"
              style="background: linear-gradient(155deg, #1C1418 0%, #2B2126 100%)">
              <p class="pf-eyebrow mb-3" style="color: rgba(255,255,255,.45)">Next step</p>
              <p class="text-[13px] leading-[1.7] mb-5" style="color: rgba(255,255,255,.7)">
                Tell me what you're building and I'll come back with a scope, a timeline and a price.
              </p>
              <a href="../index.html#contact"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest no-underline hover:opacity-90 transition-opacity">
                Start a project <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>

          </aside>

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
  fs.writeFileSync(path.join(ROOT, s.slug), page(s, header), 'utf8');
  console.log('written  ' + s.slug);
});

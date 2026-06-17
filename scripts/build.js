const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

const site = readJson("site.json");
const pages = readJson("pages.json");
const menus = readJson("menus.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(src, "data", file), "utf8"));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function attr(value = "") {
  return escapeHtml(value);
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

function urlFor(route) {
  return new URL(route, site.baseUrl).toString();
}

function pathFor(route) {
  if (route === "/") return path.join(dist, "index.html");
  return path.join(dist, route.replace(/^\/|\/$/g, ""), "index.html");
}

function navLinks(activeRoute) {
  return site.nav
    .map((item) => {
      const active = item.url === activeRoute ? " aria-current=\"page\"" : "";
      return `<a href="${attr(item.url)}"${active}>${escapeHtml(item.label)}</a>`;
    })
    .join("");
}

function header(page) {
  return `
    <a class="promo" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online Now - Pickup & Delivery Available</a>
    <header class="site-header">
      <div class="header-inner">
        <a class="logo-link" href="/" aria-label="Slice of The Burg home">
          <img src="/assets/slice-logo.png" alt="Slice of The Burg" width="208" height="104">
        </a>
        <nav class="desktop-nav" aria-label="Primary">${navLinks(page.route)}</nav>
        <a class="order-button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav">
          <span></span><span></span><span></span>
          <span class="sr-only">Menu</span>
        </button>
      </div>
      <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile primary">${navLinks(page.route)}<a class="mobile-order" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a></nav>
    </header>`;
}

function footer() {
  const socials = site.social
    .map((item) => `<a href="${attr(item.url)}" target="_blank" rel="noopener"><img src="${attr(item.icon)}" alt="${attr(item.label)}" width="28" height="28"></a>`)
    .join("");
  const links = site.nav.map((item) => `<a href="${attr(item.url)}">${escapeHtml(item.label)}</a>`).join("");
  return `
    <footer class="site-footer">
      <img class="footer-logo" src="/assets/slice-logo.png" alt="Slice of The Burg" width="208" height="104">
      <div class="social-links">${socials}</div>
      <p>Copyright &copy; 2026 SLICE OF THE BURG - All Rights Reserved.</p>
      <p>${escapeHtml(site.address.street)}, ${escapeHtml(site.address.city)}, ${escapeHtml(site.address.state)} ${escapeHtml(site.address.zip)}<br>${escapeHtml(site.phoneDisplay)}</p>
      <nav class="footer-nav" aria-label="Footer">${links}</nav>
    </footer>`;
}

function quote(index, dark = false) {
  const review = site.reviews[index % site.reviews.length];
  return `<aside class="quote-bar${dark ? " quote-dark" : ""}"><p>"${escapeHtml(review.quote)}", ${escapeHtml(review.by)}</p></aside>`;
}

function sectionHead(kicker, title, text = "") {
  return `
    <div class="section-head">
      ${kicker ? `<p class="kicker">${escapeHtml(kicker)}</p>` : ""}
      <h2>${escapeHtml(title)}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    </div>`;
}

function homePage() {
  const hours = site.hours.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`).join("");
  const socials = site.social
    .map((item) => `<a href="${attr(item.url)}" target="_blank" rel="noopener"><img src="${attr(item.icon)}" alt="${attr(item.label)}" width="32" height="32"></a>`)
    .join("");

  return `
    <main>
      <section class="hero" aria-label="St. Pete's favorite pizza">
        <img class="hero-image" src="/assets/hero-pizza-spread.png" alt="Pizza, salad and appetizers from Slice of The Burg">
        <div class="hero-panel">
          <p class="hero-phone">${escapeHtml(site.phoneDisplay)}</p>
          <h1>St. Pete's Favorite Pizza</h1>
          <p class="hero-service">Dine-In &bull; Delivery &bull; Takeout</p>
          <p class="hero-tagline">${escapeHtml(site.tagline)}</p>
          <p>Cheesesteaks, wings, salads, calzones, strombolis, hoagies, pastas, catering, and vegan options.</p>
          <a class="button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
        </div>
      </section>

      <section class="intro narrow">
        <h2>Dine-In, Outdoor Seating, Carryout & Delivery in St. Pete</h2>
        <p>Slice of The Burg is a locally owned New York-style pizza restaurant in St. Petersburg, FL serving big slices, housemade sauces, fresh dough, wings, cheesesteaks, and one of the largest vegan pizza menus in the area.</p>
        <p>Our pizza is made fresh, with love and a little Gulf breeze on Roosevelt Boulevard North in St. Pete.</p>
      </section>

      ${quote(0)}

      <section class="statement">
        <p class="quote-mark">"</p>
        <h2>Keeping St. Pete weird, fed, and extra cheesy.</h2>
      </section>

      <section class="club-section">
        ${sectionHead("Slice of The Burg Rewards", "The first rule about Slice Club is,", "you tell everyone about it!")}
        <div class="club-card">
          <img src="/assets/slice-club-pizza.png" alt="Slice Club pizza illustration" width="450" height="253">
          <div>
            <ul>
              <li>Eat Pizza</li>
              <li>Earn Points</li>
              <li>Get Cool Rewards</li>
            </ul>
            <a class="button button-dark" href="${attr(site.rewardsUrl)}" target="_blank" rel="noopener">Join The Club</a>
          </div>
        </div>
      </section>

      ${quote(1)}

      <section class="faves" data-gallery>
        ${sectionHead("", "St. Pete Faves")}
        <div class="gallery-stage">
          <button type="button" class="gallery-prev" aria-label="Previous favorite">&#8249;</button>
          <img src="/assets/st-pete-faves-salad.png" alt="Antipasto salad in St. Petersburg Florida">
          <button type="button" class="gallery-next" aria-label="Next favorite">&#8250;</button>
        </div>
        <p class="gallery-caption">Antipasto Salad in St. Petersburg Florida</p>
        <div class="gallery-thumbs">
          <button type="button" data-src="/assets/st-pete-faves-salad.png" data-alt="Antipasto salad in St. Petersburg Florida" aria-label="Show antipasto salad"><img src="/assets/st-pete-faves-salad.png" alt=""></button>
          <button type="button" data-src="/assets/hero-pizza-spread.png" data-alt="Pizza spread from Slice of The Burg" aria-label="Show pizza spread"><img src="/assets/hero-pizza-spread.png" alt=""></button>
          <button type="button" data-src="/assets/st-pete-faves-wings.png" data-alt="Chicken wings from Slice of The Burg" aria-label="Show wings"><img src="/assets/st-pete-faves-wings.png" alt=""></button>
        </div>
      </section>

      <section class="connect narrow">
        ${sectionHead("", "Let's Connect!")}
        <div class="social-links">${socials}</div>
      </section>

      ${quote(2)}

      <section class="visit" id="visit">
        ${sectionHead("", "Visit Us")}
        <div class="visit-grid">
          <form class="contact-form" data-contact-form>
            <h3>Contact Us</h3>
            <label>Name<input name="name" autocomplete="name" placeholder="Name"></label>
            <label>Phone<input name="phone" autocomplete="tel" placeholder="Phone"></label>
            <label>Email<input name="email" autocomplete="email" type="email" placeholder="Email"></label>
            <label>How can we serve you?<textarea name="message" rows="5" placeholder="How can we serve you?"></textarea></label>
            <button class="button" type="submit">Send</button>
            <p class="form-note">This prototype opens an email draft instead of submitting to a backend.</p>
          </form>
          <div class="visit-info">
            <h3>Special Requests?</h3>
            <p>Do you have dietary concerns or questions about an upcoming event related to our slice of the burg pizza? Whether you want to see some slice of the burg photos or need information about our location on Roosevelt Boulevard North in St. Petersburg, FL, drop us a line.</p>
            <h3>Slice of The Burg</h3>
            <p>${escapeHtml(site.address.street)},<br>${escapeHtml(site.address.city)}, ${escapeHtml(site.address.state)} ${escapeHtml(site.address.zip)}<br><a href="tel:${attr(site.phoneTel)}">${escapeHtml(site.contactPhone)}</a></p>
            <h3>Hours</h3>
            <div class="hours">${hours}</div>
            <p>Located on Roosevelt Boulevard North near the Gateway Crossings Shopping Plaza, Slice of The Burg serves fresh NY-style pizza, wings, cheesesteaks, and vegan pizza for dine-in, delivery, and takeout.</p>
            <a class="button button-outline" href="https://www.google.com/maps/search/?api=1&query=10484%20Roosevelt%20Blvd%20N%20St.%20Petersburg%20FL%2033716" target="_blank" rel="noopener">Get Directions</a>
          </div>
        </div>
      </section>

      ${quote(3, true)}
    </main>`;
}

function menuPage(page) {
  const menu = menus[page.menuKey];
  const sectionNav = menu.sections
    .map((section, index) => `<button type="button" data-menu-target="menu-section-${index}"${index === 0 ? " class=\"active\"" : ""}>${escapeHtml(section.title)}</button>`)
    .join("");
  const sections = menu.sections
    .map((section, index) => {
      const items = section.items
        .map((item) => `
          <article class="menu-item">
            <div class="menu-item-head">
              <h3>${escapeHtml(item.name)}</h3>
              ${item.price ? `<span>${escapeHtml(item.price)}</span>` : ""}
            </div>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
          </article>`)
        .join("");
      return `
        <section id="menu-section-${index}" class="menu-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.description ? `<p class="section-note">${escapeHtml(section.description)}</p>` : ""}
          <div class="menu-list">${items}</div>
        </section>`;
    })
    .join("");

  return `
    <main class="menu-page">
      <section class="page-hero narrow">
        <h1>${escapeHtml(page.heading)}</h1>
        <p>${escapeHtml(page.intro)}</p>
        <a class="button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
      </section>
      ${menu.note ? `<p class="menu-note narrow">${escapeHtml(menu.note)}</p>` : ""}
      <div class="menu-tabs narrow" data-menu-tabs>${sectionNav}</div>
      <div class="menu-content">${sections}</div>
      <p class="menu-note narrow">Leftover pizza is proof that future you cares.</p>
    </main>`;
}

function simplePage(page) {
  const body = page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const ctaUrl = page.ctaUrl === "ORDER_URL" ? site.orderUrl : page.ctaUrl;
  return `
    <main class="simple-page narrow">
      <h1>${escapeHtml(page.heading)}</h1>
      ${body}
      ${ctaUrl ? `<a class="button" href="${attr(ctaUrl)}" target="_blank" rel="noopener">${escapeHtml(page.ctaLabel)}</a>` : ""}
    </main>`;
}

function structuredData(page) {
  if (page.route !== "/") return "";
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    url: site.baseUrl,
    telephone: site.phoneDisplay,
    servesCuisine: ["Pizza", "Cheesesteaks", "Vegan"],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US"
    },
    openingHours: ["Mo-Th 10:00-22:00", "Fr-Sa 10:00-23:00", "Su 10:00-22:00"],
    image: `${site.baseUrl}/assets/hero-pizza-spread.png`
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function render(page) {
  const content = page.template === "home" ? homePage() : page.template === "menu" ? menuPage(page) : simplePage(page);
  const canonical = urlFor(page.route);
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${attr(page.description)}">
  <link rel="canonical" href="${attr(canonical)}">
  <meta name="theme-color" content="#A4221E">
  <meta property="og:site_name" content="${attr(site.name)}">
  <meta property="og:title" content="${attr(page.title)}">
  <meta property="og:description" content="${attr(page.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${attr(site.baseUrl)}/assets/hero-pizza-spread.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(page.title)}">
  <meta name="twitter:description" content="${attr(page.description)}">
  <meta name="twitter:image" content="${attr(site.baseUrl)}/assets/hero-pizza-spread.png">
  <link rel="icon" href="/assets/slice-logo.png">
  <link rel="stylesheet" href="/styles/site.css">
  ${structuredData(page)}
</head>
<body>
  ${header(page)}
  ${content}
  ${footer()}
  <script>window.SLICE_CONTACT_EMAIL=${JSON.stringify(site.contactEmail)};</script>
  <script src="/scripts/site.js" defer></script>
</body>
</html>`;
}

cleanDir(dist);
copyDir(path.join(src, "assets"), path.join(dist, "assets"));
copyDir(path.join(src, "styles"), path.join(dist, "styles"));
copyDir(path.join(src, "scripts"), path.join(dist, "scripts"));

for (const page of pages) {
  const file = pathFor(page.route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(page));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${escapeHtml(urlFor(page.route))}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://sliceoftheburg.com/sitemap.xml\n");

console.log(`Built ${pages.length} pages into ${path.relative(root, dist)}`);

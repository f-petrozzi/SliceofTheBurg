const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

const site = readJson("site.json");
const pages = readJson("pages.json");
const menus = readJson("menus.json");
const gallery = readJson("gallery.json");

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

function chevron(direction) {
  const d = direction === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"></path></svg>`;
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function publicAssetPathToSource(publicPath) {
  return path.join(src, publicPath.replace(/^\//, ""));
}

function assetExists(publicPath) {
  return fs.existsSync(publicAssetPathToSource(publicPath));
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
    <a class="skip-link" href="#main">Skip to content</a>
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
    .filter((item) => assetExists(item.icon))
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
    </footer>
    <div class="mobile-order-bar">
      <a class="button button-outline" href="tel:${attr(site.phoneTel)}" aria-label="Call Slice of The Burg">Call</a>
      <a class="button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
    </div>`;
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

function homePage(page) {
  const hours = site.hours.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>`).join("");
  const socials = site.social
    .filter((item) => assetExists(item.icon))
    .map((item) => `<a href="${attr(item.url)}" target="_blank" rel="noopener"><img src="${attr(item.icon)}" alt="${attr(item.label)}" width="32" height="32"></a>`)
    .join("");
  const heroImage = assetExists("/assets/brand/hero-banner.webp") ? "/assets/brand/hero-banner.webp" : "/assets/hero-pizza-spread.png";
  const galleryItems = gallery
    .filter((item) => assetExists(item.large))
    .map((item) => ({ ...item, thumb: assetExists(item.thumb) ? item.thumb : item.large }));
  const faves = galleryItems.length ? galleryItems : [
    {
      title: "Antipasto Salad",
      large: "/assets/st-pete-faves-salad.png",
      thumb: "/assets/st-pete-faves-salad.png",
      alt: "Antipasto salad in St. Petersburg Florida"
    },
    {
      title: "Pizza Spread",
      large: "/assets/hero-pizza-spread.png",
      thumb: "/assets/hero-pizza-spread.png",
      alt: "Pizza spread from Slice of The Burg"
    },
    {
      title: "Chicken Wings",
      large: "/assets/st-pete-faves-wings.png",
      thumb: "/assets/st-pete-faves-wings.png",
      alt: "Chicken wings from Slice of The Burg"
    }
  ];
  const firstFave = faves[0];
  const faveSlides = faves
    .map((item, index) => `
            <figure class="gallery-slide" data-index="${index}">
              <img src="${attr(item.large)}" alt="${attr(item.alt)}" width="600" height="600" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
            </figure>`)
    .join("");
  const faveThumbs = faves
    .map((item, index) => `<button type="button" data-index="${index}" data-title="${attr(item.title)}" aria-label="Show ${attr(item.title)}"><img src="${attr(item.thumb)}" alt="" width="80" height="60" loading="lazy" decoding="async"></button>`)
    .join("");
  const giftCardImage = assetExists("/assets/promos/gift-card.webp")
    ? `<img src="/assets/promos/gift-card.webp" alt="Slice of The Burg gift card" width="640" height="420" loading="lazy" decoding="async">`
    : "";
  const sliceClubImage = assetExists("/assets/brand/slice-club.webp") ? "/assets/brand/slice-club.webp" : "/assets/slice-club-pizza.png";

  return `
    <main id="main">
      <section class="hero" aria-label="St. Pete's favorite pizza">
        <img class="hero-image" src="${attr(heroImage)}" alt="Pizza, salad and appetizers from Slice of The Burg" width="1600" height="900" fetchpriority="high" decoding="async">
        <div class="hero-panel">
          <p class="hero-phone">${escapeHtml(site.phoneDisplay)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="hero-service">Dine-In &bull; Delivery &bull; Takeout</p>
          <p class="hero-tagline">${escapeHtml(site.tagline)}</p>
          <p>Cheesesteaks, wings, salads, calzones, strombolis, hoagies, pastas, catering, and vegan options.</p>
          <a class="button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
        </div>
      </section>

      <section class="intro band">
        <div class="narrow reveal">
          <h2>Dine-In, Outdoor Seating, Carryout & Delivery in St. Pete</h2>
          <p>Slice of The Burg is a locally owned New York-style pizza restaurant in St. Petersburg, FL serving big slices, housemade sauces, fresh dough, wings, cheesesteaks, and one of the largest vegan pizza menus in the area.</p>
          <p>Our pizza is made fresh, with love and a little Gulf breeze on Roosevelt Boulevard North in St. Pete.</p>
        </div>
      </section>

      ${quote(0)}

      <section class="club-section band band--cream">
        <div class="container reveal">
          ${sectionHead("Slice of The Burg Rewards", "The first rule about Slice Club is,", "you tell everyone about it!")}
          <div class="club-card">
            <img src="${attr(sliceClubImage)}" alt="Slice Club pizza illustration" width="460" height="307" loading="lazy" decoding="async">
            <div class="club-copy">
              <ul>
                <li>Eat Pizza</li>
                <li>Earn Points</li>
                <li>Get Cool Rewards</li>
              </ul>
              <a class="button button-dark" href="${attr(site.rewardsUrl)}" target="_blank" rel="noopener">Join The Club</a>
            </div>
          </div>
        </div>
      </section>

      ${quote(1)}

      <section class="gift-card-section band">
        <div class="container reveal">
          <div class="gift-card-inner">
            <p class="kicker">Gift Cards</p>
            <h2>Give the gift of pizza</h2>
            <p>Slice of The Burg gift cards are available through Toast for pickup, delivery, birthdays, thank-yous, and future pizza nights.</p>
            <p>Purchase online and send a little St. Pete pizza love anytime.</p>
            ${giftCardImage}
            <a class="button" href="${attr(site.giftCardUrl)}" target="_blank" rel="noopener">Purchase</a>
          </div>
        </div>
      </section>

      <section class="faves band band--cream" data-gallery data-car-interval="5000">
        <div class="reveal">
          ${sectionHead("", "St. Pete Faves")}
          <div class="gallery-stage">
            <button type="button" class="gallery-prev" aria-label="Previous favorite">${chevron("prev")}</button>
            <div class="gallery-viewport">
              <div class="gallery-track" aria-live="polite">
                ${faveSlides}
              </div>
            </div>
            <button type="button" class="gallery-next" aria-label="Next favorite">${chevron("next")}</button>
          </div>
          <div class="gallery-progress" aria-hidden="true"><i></i></div>
          <p class="gallery-caption">${escapeHtml(firstFave.title)}</p>
          <div class="gallery-thumb-controls">
            <button type="button" class="gallery-thumb-prev" aria-label="Previous favorite thumbnail">${chevron("prev")}</button>
            <div class="gallery-thumbs">
              ${faveThumbs}
            </div>
            <button type="button" class="gallery-thumb-next" aria-label="Next favorite thumbnail">${chevron("next")}</button>
          </div>
        </div>
      </section>

      <section class="connect band">
        <div class="narrow reveal">
          ${sectionHead("", "Let's Connect!")}
          <div class="social-links">${socials}</div>
        </div>
      </section>

      ${quote(2)}

      <section class="visit-section band band--cream" id="visit">
        <div class="container reveal">
          ${sectionHead("", "Visit Us")}
          <div class="visit-grid">
            <form class="contact-form" data-contact-form>
              <h3>Contact Us</h3>
              <input name="name" autocomplete="name" placeholder="Name" aria-label="Name">
              <input name="phone" autocomplete="tel" placeholder="Phone" aria-label="Phone">
              <input name="email" autocomplete="email" type="email" placeholder="Email" aria-label="Email">
              <textarea name="message" rows="5" placeholder="How can we serve you?" aria-label="Message"></textarea>
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
        <section id="menu-section-${index}" class="menu-section reveal">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.description ? `<p class="section-note">${escapeHtml(section.description)}</p>` : ""}
          <div class="menu-list">${items}</div>
        </section>`;
    })
    .join("");

  return `
    <main id="main" class="menu-page">
      <section class="page-hero band">
        <div class="narrow">
          <h1>${escapeHtml(page.heading)}</h1>
          <p>${escapeHtml(page.intro)}</p>
          <a class="button" href="${attr(site.orderUrl)}" target="_blank" rel="noopener">Order Online</a>
        </div>
      </section>
      ${menu.note ? `<p class="menu-note narrow">${escapeHtml(menu.note)}</p>` : ""}
      <div class="menu-tabs-band">
        <div class="menu-tabs container" data-menu-tabs>${sectionNav}</div>
      </div>
      <div class="menu-content container">${sections}</div>
      <p class="menu-note narrow">Leftover pizza is proof that future you cares.</p>
    </main>`;
}

function simplePage(page) {
  const body = page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const ctaUrl = page.ctaUrl === "ORDER_URL" ? site.orderUrl : page.ctaUrl;
  return `
    <main id="main" class="simple-page band">
      <div class="narrow">
        <h1>${escapeHtml(page.heading)}</h1>
        ${body}
        ${ctaUrl ? `<a class="button" href="${attr(ctaUrl)}" target="_blank" rel="noopener">${escapeHtml(page.ctaLabel)}</a>` : ""}
      </div>
    </main>`;
}

function ldScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function restaurantData() {
  return {
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
    sameAs: site.social.map((item) => item.url),
    image: `${site.baseUrl}/assets/hero-pizza-spread.png`
  };
}

function menuData(page) {
  const menu = menus[page.menuKey];
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: page.heading,
    url: urlFor(page.route),
    hasMenuSection: menu.sections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      hasMenuItem: section.items.map((item) => {
        const entry = { "@type": "MenuItem", name: item.name };
        if (item.description) entry.description = item.description;
        if (item.price) entry.offers = { "@type": "Offer", price: String(item.price).replace(/[^0-9.]/g, ""), priceCurrency: "USD" };
        return entry;
      })
    }))
  };
}

function breadcrumbData(page) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.baseUrl },
      { "@type": "ListItem", position: 2, name: page.heading, item: urlFor(page.route) }
    ]
  };
}

function structuredData(page) {
  if (page.route === "/") return ldScript(restaurantData());
  const blocks = [breadcrumbData(page)];
  if (page.template === "menu") blocks.push(menuData(page));
  return blocks.map(ldScript).join("\n  ");
}

function render(page) {
  const content = page.template === "home" ? homePage(page) : page.template === "menu" ? menuPage(page) : simplePage(page);
  const canonical = urlFor(page.route);
  const ogImage = `${site.baseUrl}${page.ogImage && assetExists(page.ogImage) ? page.ogImage : "/assets/hero-pizza-spread.png"}`;
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
  <meta property="og:image" content="${attr(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(page.title)}">
  <meta name="twitter:description" content="${attr(page.description)}">
  <meta name="twitter:image" content="${attr(ogImage)}">
  <link rel="icon" type="image/png" href="/assets/slice-tab.png">
  <link rel="apple-touch-icon" href="/assets/slice-tab.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Bitter:ital,wght@0,400;1,400&display=swap">
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

const lastmod = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${escapeHtml(urlFor(page.route))}</loc><lastmod>${lastmod}</lastmod><priority>${page.route === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://sliceoftheburg.com/sitemap.xml\n");

console.log(`Built ${pages.length} pages into ${path.relative(root, dist)}`);

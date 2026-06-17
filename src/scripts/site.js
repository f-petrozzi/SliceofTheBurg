document.querySelector(".nav-toggle")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.getElementById("mobile-nav");
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const viewport = gallery.querySelector(".gallery-viewport");
  const track = gallery.querySelector(".gallery-track");
  const slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const caption = gallery.querySelector(".gallery-caption");
  const thumbs = Array.from(gallery.querySelectorAll(".gallery-thumbs button"));
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    const thumb = thumbs[index];
    caption.textContent = thumb.dataset.title || thumb.dataset.alt;
    slides.forEach((slide, slideIndex) => {
      const distance = Math.min(
        Math.abs(slideIndex - index),
        slides.length - Math.abs(slideIndex - index)
      );
      slide.classList.toggle("active", slideIndex === index);
      slide.classList.toggle("near", distance === 1);
    });
    thumbs.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
    const slide = slides[index];
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
    const step = slide.offsetWidth + gap;
    const offset = (viewport.offsetWidth / 2) - (slide.offsetWidth / 2) - (index * step);
    track.style.transform = `translateX(${offset}px)`;
    thumb.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  gallery.querySelector(".gallery-prev")?.addEventListener("click", () => show(index - 1));
  gallery.querySelector(".gallery-next")?.addEventListener("click", () => show(index + 1));
  thumbs.forEach((button, buttonIndex) => button.addEventListener("click", () => show(buttonIndex)));
  window.addEventListener("resize", () => show(index));
  show(0);
}

document.querySelector("[data-menu-tabs]")?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  document.querySelectorAll("[data-menu-tabs] button").forEach((tab) => tab.classList.toggle("active", tab === button));
  document.getElementById(button.dataset.menuTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const subject = encodeURIComponent("Slice of The Burg website inquiry");
  const body = encodeURIComponent(
    `Name: ${data.get("name") || ""}\nPhone: ${data.get("phone") || ""}\nEmail: ${data.get("email") || ""}\n\n${data.get("message") || ""}`
  );
  window.location.href = `mailto:${window.SLICE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

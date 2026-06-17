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
  const caption = gallery.querySelector(".gallery-caption");
  const thumbs = Array.from(gallery.querySelectorAll(".gallery-thumbs button"));
  const originalSlides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const slideCount = originalSlides.length;
  let slides = originalSlides;
  let index = 0;
  let physicalIndex = 0;

  if (slideCount > 1) {
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
    firstClone.dataset.clone = "true";
    lastClone.dataset.clone = "true";
    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);
    slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
    physicalIndex = 1;
  }

  function positionTrack(animate = true) {
    const slide = slides[physicalIndex];
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
    const step = slide.offsetWidth + gap;
    const offset = (viewport.offsetWidth / 2) - (slide.offsetWidth / 2) - (physicalIndex * step);
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${offset}px)`;
    if (!animate) {
      requestAnimationFrame(() => {
        track.style.transition = "";
      });
    }
  }

  function updateState() {
    const thumb = thumbs[index];
    caption.textContent = thumb.dataset.title;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === physicalIndex);
      slide.classList.toggle("near", Math.abs(slideIndex - physicalIndex) === 1);
    });
    thumbs.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
    thumb.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  function goTo(nextIndex, animate = true) {
    index = (nextIndex + slideCount) % slideCount;
    physicalIndex = slideCount > 1 ? index + 1 : index;
    updateState();
    positionTrack(animate);
  }

  function move(delta) {
    if (slideCount < 2) return;
    index = (index + delta + slideCount) % slideCount;
    physicalIndex += delta;
    updateState();
    positionTrack(true);
  }

  track.addEventListener("transitionend", () => {
    if (slideCount < 2) return;
    if (physicalIndex === 0) {
      physicalIndex = slideCount;
      positionTrack(false);
      updateState();
    } else if (physicalIndex === slideCount + 1) {
      physicalIndex = 1;
      positionTrack(false);
      updateState();
    }
  });

  gallery.querySelector(".gallery-prev")?.addEventListener("click", () => move(-1));
  gallery.querySelector(".gallery-next")?.addEventListener("click", () => move(1));
  gallery.querySelector(".gallery-thumb-prev")?.addEventListener("click", () => move(-1));
  gallery.querySelector(".gallery-thumb-next")?.addEventListener("click", () => move(1));
  thumbs.forEach((button, buttonIndex) => button.addEventListener("click", () => goTo(buttonIndex)));
  window.addEventListener("resize", () => positionTrack(false));
  goTo(0, false);
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

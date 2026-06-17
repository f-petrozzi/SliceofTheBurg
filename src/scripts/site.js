const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile nav ---------- */
document.querySelector(".nav-toggle")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.getElementById("mobile-nav");
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

/* ---------- St. Pete Faves carousel ---------- */
const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const viewport = gallery.querySelector(".gallery-viewport");
  const track = gallery.querySelector(".gallery-track");
  const caption = gallery.querySelector(".gallery-caption");
  const progressBar = gallery.querySelector(".gallery-progress i");
  const thumbsTrack = gallery.querySelector(".gallery-thumbs");
  const thumbs = Array.from(gallery.querySelectorAll(".gallery-thumbs button"));
  const originalSlides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const slideCount = originalSlides.length;
  const interval = Number(gallery.dataset.carInterval) || 5000;
  const autoplay = !prefersReduced && slideCount > 1;
  let slides = originalSlides;
  let index = 0;
  let physicalIndex = 0;
  let paused = false;

  gallery.style.setProperty("--car-interval", `${interval}ms`);

  const progressEl = gallery.querySelector(".gallery-progress");
  if (!autoplay && progressEl) progressEl.style.display = "none";

  if (slideCount > 1) {
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
    firstClone.dataset.clone = "true";
    lastClone.dataset.clone = "true";
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);
    slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
    physicalIndex = 1;
  }

  function positionTrack(animate = true) {
    if (!viewport.offsetWidth) return; // not laid out yet — skip until it is
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

  let timer = null;

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleNext() {
    clearTimer();
    if (!autoplay || paused) return;
    timer = setTimeout(() => move(1), interval);
  }

  function restartProgress() {
    if (!autoplay || !progressBar) return;
    progressBar.classList.remove("run");
    void progressBar.offsetWidth; // force reflow to restart the animation
    progressBar.classList.add("run");
    progressBar.classList.toggle("paused", paused);
  }

  function cycle() {
    restartProgress();
    scheduleNext();
  }

  function updateState() {
    const thumb = thumbs[index];
    if (caption && thumb) caption.textContent = thumb.dataset.title;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === physicalIndex);
      slide.classList.toggle("near", Math.abs(slideIndex - physicalIndex) === 1);
    });
    thumbs.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
    // Center the active thumbnail within its own strip only — never scroll the page.
    if (thumbsTrack && thumb) {
      const tRect = thumb.getBoundingClientRect();
      const cRect = thumbsTrack.getBoundingClientRect();
      const delta = (tRect.left + tRect.width / 2) - (cRect.left + cRect.width / 2);
      thumbsTrack.scrollBy({ left: delta, behavior: "smooth" });
    }
  }

  function goTo(nextIndex, animate = true) {
    index = (nextIndex + slideCount) % slideCount;
    physicalIndex = slideCount > 1 ? index + 1 : index;
    updateState();
    positionTrack(animate);
    cycle();
  }

  function move(delta) {
    if (slideCount < 2) return;
    index = (index + delta + slideCount) % slideCount;
    physicalIndex += delta;
    updateState();
    positionTrack(true);
    cycle();
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

  function pause() {
    if (paused) return;
    paused = true;
    clearTimer();
    progressBar?.classList.add("paused");
  }

  function resume() {
    if (!paused) return;
    paused = false;
    progressBar?.classList.remove("paused");
    cycle();
  }

  if (autoplay) {
    // Pause only when hovering the ACTIVE slide image or the ACTIVE thumbnail —
    // not the whole section. pointerenter/leave don't fire on inner child moves,
    // so there's no flicker.
    const hoverPause = (el) => {
      el.addEventListener("pointerenter", () => { if (el.classList.contains("active")) pause(); });
      el.addEventListener("pointerleave", () => { if (el.classList.contains("active")) resume(); });
    };
    slides.forEach(hoverPause);
    thumbs.forEach(hoverPause);

    // Keyboard users: pause while focus is anywhere in the carousel.
    gallery.addEventListener("focusin", pause);
    gallery.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
      else resume();
    });
  }

  // Touch swipe on the main stage
  const stage = gallery.querySelector(".gallery-stage");
  let touchX = null;
  stage?.addEventListener("touchstart", (event) => {
    touchX = event.changedTouches[0].clientX;
    pause();
  }, { passive: true });
  stage?.addEventListener("touchend", (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
    touchX = null;
    resume();
  });

  gallery.querySelector(".gallery-prev")?.addEventListener("click", () => move(-1));
  gallery.querySelector(".gallery-next")?.addEventListener("click", () => move(1));
  gallery.querySelector(".gallery-thumb-prev")?.addEventListener("click", () => move(-1));
  gallery.querySelector(".gallery-thumb-next")?.addEventListener("click", () => move(1));
  thumbs.forEach((button, buttonIndex) => button.addEventListener("click", () => goTo(buttonIndex)));

  // Re-center whenever the layout can shift the measurements the track relies on:
  // window resize, viewport size changes (scrollbars/fonts), full load, and font readiness.
  const reposition = () => positionTrack(false);
  window.addEventListener("resize", reposition);
  if ("ResizeObserver" in window) new ResizeObserver(reposition).observe(viewport);
  window.addEventListener("load", reposition);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reposition);

  // Initial placement — defer to the next frame so first paint has settled.
  requestAnimationFrame(() => goTo(0, false));
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
}

/* ---------- Menu tabs: click-to-scroll + scrollspy ---------- */
const menuTabs = document.querySelector("[data-menu-tabs]");
if (menuTabs) {
  menuTabs.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    document.getElementById(button.dataset.menuTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const tabButtons = Array.from(menuTabs.querySelectorAll("button"));
  const sections = tabButtons
    .map((button) => document.getElementById(button.dataset.menuTarget))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.menuTarget === id));
        // Center the active pill within the scroller (mobile single-row bar only).
        const active = tabButtons.find((button) => button.dataset.menuTarget === id);
        if (active && menuTabs.scrollWidth > menuTabs.clientWidth + 4) {
          const bRect = active.getBoundingClientRect();
          const cRect = menuTabs.getBoundingClientRect();
          menuTabs.scrollBy({ left: (bRect.left + bRect.width / 2) - (cRect.left + cRect.width / 2), behavior: "smooth" });
        }
      });
    }, { rootMargin: "-160px 0px -65% 0px", threshold: 0 });
    sections.forEach((section) => spy.observe(section));
  }
}

/* ---------- Contact form -> mailto ---------- */
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

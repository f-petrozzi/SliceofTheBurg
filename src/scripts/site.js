document.querySelector(".nav-toggle")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.getElementById("mobile-nav");
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const image = gallery.querySelector(".gallery-stage img");
  const caption = gallery.querySelector(".gallery-caption");
  const thumbs = Array.from(gallery.querySelectorAll(".gallery-thumbs button"));
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + thumbs.length) % thumbs.length;
    const thumb = thumbs[index];
    image.src = thumb.dataset.src;
    image.alt = thumb.dataset.alt;
    caption.textContent = thumb.dataset.title || thumb.dataset.alt;
    thumbs.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
  }

  gallery.querySelector(".gallery-prev")?.addEventListener("click", () => show(index - 1));
  gallery.querySelector(".gallery-next")?.addEventListener("click", () => show(index + 1));
  thumbs.forEach((button, buttonIndex) => button.addEventListener("click", () => show(buttonIndex)));
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

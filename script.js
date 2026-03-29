console.log("SCRIPT LOADED");

function setActiveNavOnScroll(){
  const links = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const update = () => {
    const y = window.scrollY + 120;

    let currentId = sections[0] ? sections[0].id : null;

    for (const section of sections){
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (y >= top && y < bottom){
        currentId = section.id;
        break;
      }
    }

    for (const a of links){
      const target = a.getAttribute("href").slice(1);
      const isActive = currentId === target;

      a.classList.toggle("is-active", isActive);

      if (isActive){
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupNavToggle(){
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a[href^='#']");
    if (!link) return;

    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function setupSmoothScrolling(){
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a[href^='#']");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
}

function setupFooterYear(){
  const year = document.getElementById("year");
  if (!year) return;
  year.textContent = String(new Date().getFullYear());
}

function trackClickEvent(eventName){
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
  };

  fetch("https://levorotatory-preobviously-thurman.ngrok-free.dev/api/portfolio-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((res) => {
      if (!res.ok){
        console.error(`trackClickEvent failed with status ${res.status}`, payload);
      }
    })
    .catch((err) => {
      console.error("trackClickEvent network error:", err);
    });
}

function setupTestButtonClick(){
  const testBtn = document.getElementById("testBtn");
  if (!testBtn) return;

  testBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("https://levorotatory-preobviously-thurman.ngrok-free.dev/api/portfolio-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: 123 }),
      });

      if (!res.ok){
        throw new Error(`Request failed: ${res.status}`);
      }

      console.log("testBtn portfolio-event success");
    } catch (err) {
      console.error("testBtn portfolio-event failed:", err);
    }
  });
}

function setupProjectRequests(){
  const projects = document.getElementById("projects");
  if (!projects) return;

  const ownerEmail = projects.getAttribute("data-owner-email");
  const requestButtons = Array.from(document.querySelectorAll("[data-request-btn]"));
  const requestForms = Array.from(document.querySelectorAll("[data-request-form]"));

  if (!requestButtons.length || !requestForms.length) return;

  const hideAllForms = () => {
    for (const form of requestForms){
      form.hidden = true;
    }
  };

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const btn of requestButtons){
    btn.addEventListener("click", () => {
      trackClickEvent("request-to-view-project");

      const formId = btn.getAttribute("aria-controls");
      if (!formId) return;

      const form = document.getElementById(formId);
      if (!form) return;

      hideAllForms();
      form.hidden = false;

      const input = form.querySelector("input[type='email']");
      if (input) input.focus();

      if (!prefersReducedMotion && typeof form.scrollIntoView === "function"){
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  for (const form of requestForms){
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!ownerEmail){
        alert("Missing owner email.");
        return;
      }

      const emailInput = form.querySelector("input[type='email']");
      const visitorEmail = emailInput ? emailInput.value.trim() : "";
      if (!visitorEmail) return;

      const formId = form.getAttribute("id");

      const matchingButton = formId
        ? requestButtons.find((b) => b.getAttribute("aria-controls") === formId)
        : null;

      const projectTitle = matchingButton
        ? matchingButton.getAttribute("data-project-title")
        : "";

      const subject = `Project access request: ${projectTitle || "Project"}`;

      const bodyText = [
        "Hi Jess,",
        "",
        `I'd like access to "${projectTitle || "Project"}".`,
        `My email: ${visitorEmail}`,
        "",
        visitorEmail,
      ].join("\n");

      const gmailComposeUrl =
        "https://mail.google.com/mail/?view=cm&fs=1" +
        `&to=${encodeURIComponent(ownerEmail)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyText)}`;

      window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
    });
  }
}

setActiveNavOnScroll();
setupNavToggle();
setupSmoothScrolling();
setupFooterYear();
setupTestButtonClick();
setupProjectRequests();

/* single safe binding */
const contactSendBtn = document.querySelector(".contact-sendBtn");

if (contactSendBtn){
  contactSendBtn.addEventListener("click", () => {
    trackClickEvent("send-email");
  });
}

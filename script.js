function setActiveNavOnScroll(){
  const links = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const update = () => {
    const y = window.scrollY + 120; // header offset

    let currentId = null;
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

  // Close mobile menu after clicking a link
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

    // Respect reduced motion via CSS media query + user agent settings
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      return;
    }

    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupFooterYear(){
  const year = document.getElementById("year");
  if (!year) return;
  year.textContent = String(new Date().getFullYear());
}

function setupProjectRequests(){
  const projects = document.getElementById("projects");
  if (!projects) return;

  const ownerEmail = projects.getAttribute("data-owner-email");
  const requestButtons = Array.from(document.querySelectorAll("[data-request-btn]"));
  const requestForms = Array.from(document.querySelectorAll("[data-request-form]"));

  if (requestButtons.length === 0 || requestForms.length === 0) return;

  const hideAllForms = () => {
    for (const form of requestForms){
      form.hidden = true;
    }
  };

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const btn of requestButtons){
    btn.addEventListener("click", () => {
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
        alert("Recipient email is missing. Update `data-owner-email` on the Projects section.");
        return;
      }

      const emailInput = form.querySelector("input[type='email']");
      const visitorEmail = emailInput ? emailInput.value.trim() : "";
      if (!visitorEmail) return;

      const formId = form.getAttribute("id");
      const matchingButton = formId
        ? requestButtons.find((b) => b.getAttribute("aria-controls") === formId)
        : null;
      const projectTitle = matchingButton ? matchingButton.getAttribute("data-project-title") : "";

      const subject = `Project access request: ${projectTitle || "Project"}`;
      const bodyText = [
        "Hi Jess,",
        "",
        `I'd like to request access to the project "${projectTitle || "Project"}".`,
        `My email: ${visitorEmail}`,
        "",
        "Thanks,",
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
setupProjectRequests();


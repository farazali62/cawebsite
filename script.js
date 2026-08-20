const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const header = document.querySelector("[data-elevate]");
const progressBar = document.querySelector(".progress-bar");
const heroImage = document.querySelector(".hero-media img");
const parallaxCards = document.querySelectorAll(".parallax-card img");
const contactForm = document.querySelector(".contact-form");

if (window.lucide) {
  window.lucide.createIcons();
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  if (element.closest(".stagger-group")) {
    element.style.transitionDelay = `${Math.min(index * 0.06, 0.24)}s`;
  }
  revealObserver.observe(element);
});

function updateScrollEffects() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progressBar?.style.setProperty("--scroll-progress", `${progress}%`);
  header?.classList.toggle("is-scrolled", scrollTop > 24);

  if (heroImage) {
    heroImage.style.setProperty("--parallax", String(scrollTop));
  }

  parallaxCards.forEach((image) => {
    const rect = image.getBoundingClientRect();
    const offset = rect.top - window.innerHeight * 0.5;
    image.style.setProperty("--local-parallax", String(offset));
  });
}

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);

if (contactForm) {
  const status = contactForm.querySelector(".form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const supabaseUrl = contactForm.dataset.supabaseUrl;
  const supabaseKey = contactForm.dataset.supabaseKey;
  const client = window.supabase && supabaseUrl && supabaseKey
    ? window.supabase.createClient(supabaseUrl, supabaseKey)
    : null;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!client) {
      status.textContent = "The enquiry form is not connected yet. Please email hello@aaryanca.in.";
      status.dataset.state = "error";
      return;
    }

    const formData = new FormData(contactForm);

    if (formData.get("company_website")) {
      contactForm.reset();
      return;
    }

    const payload = {
      full_name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || null,
      service_needed: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim() || null,
      source_page: window.location.href,
      user_agent: navigator.userAgent
    };

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    status.textContent = "";
    status.dataset.state = "";

    const { error } = await client.from("contact_enquiries").insert(payload);

    if (error) {
      status.textContent = "Something went wrong. Please try again or email hello@aaryanca.in.";
      status.dataset.state = "error";
    } else {
      contactForm.reset();
      status.textContent = "Thanks. Your enquiry has been received.";
      status.dataset.state = "success";
    }

    submitButton.disabled = false;
    submitButton.textContent = "Send Enquiry";
  });
}

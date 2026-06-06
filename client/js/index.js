const API_BASE_URL = "/api";

// Referencias principales del login y registro.
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const navLogin = document.getElementById("nav-login");
const mobileNavToggle = document.getElementById("mobile-nav-toggle");
const mobileNav = document.getElementById("mobile-nav");
const heroRegister = document.getElementById("hero-register");
const plansRegister = document.getElementById("plans-register");
const offerRegister = document.getElementById("offer-register");
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleLoginButton = document.getElementById("google-login");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("login-password");
const registerNameInput = document.getElementById("register-name");
const registerEmailInput = document.getElementById("register-email");
const registerPhoneInput = document.getElementById("register-phone");
const registerDocumentInput = document.getElementById("register-document");
const registerPasswordInput = document.getElementById("register-password");
const planCountElement = document.getElementById("plan-count");
const authPlanCountElement = document.getElementById("auth-plan-count");
const publicPlansElement = document.getElementById("public-plans");
const siteContentElements = {
  eyebrow: document.getElementById("site-eyebrow"),
  heroTitle: document.getElementById("site-hero-title"),
  heroDescription: document.getElementById("site-hero-description"),
  experienceEyebrow: document.getElementById("site-experience-eyebrow"),
  experienceTitle: document.getElementById("site-experience-title"),
  plansEyebrow: document.getElementById("site-plans-eyebrow"),
  plansTitle: document.getElementById("site-plans-title"),
  scheduleEyebrow: document.getElementById("site-schedule-eyebrow"),
  fullInfoTitle: document.getElementById("site-full-info-title"),
  fullInfoDescription: document.getElementById("site-full-info-description"),
  schedule: document.getElementById("site-schedule"),
  location: document.getElementById("site-location"),
  contact: document.getElementById("site-contact"),
  contactEyebrow: document.getElementById("site-contact-eyebrow"),
  contactTitle: document.getElementById("site-contact-title"),
  howItWorks: document.getElementById("site-how-it-works"),
  highlights: document.getElementById("site-highlights"),
  scheduleCards: document.getElementById("site-schedule-cards"),
  authBadge: document.getElementById("auth-badge"),
  authTitle: document.getElementById("auth-title"),
  authDescription: document.getElementById("auth-description"),
  authLoginEyebrow: document.getElementById("auth-login-eyebrow"),
  authLoginTitle: document.getElementById("auth-login-title"),
  authLoginDescription: document.getElementById("auth-login-description"),
  authStats: document.getElementById("auth-stats"),
  authCards: document.getElementById("auth-cards"),
};

let membershipUpdateInterval = null;
let transitionOverlay = null;
let countersStarted = false;

// Decide a que dashboard entra cada rol.
function getDashboardRoute(user) {
  if (user?.rol === "Admin") return "./dashboardAdmin.html";
  if (user?.rol === "Entrenador") return "./dashboardTrainer.html";
  return "./dashboardMember.html";
}

// Inserta animaciones usadas en login y transiciones.
function injectMotionStyles() {
  if (document.getElementById("auth-motion-styles")) return;

  const style = document.createElement("style");
  style.id = "auth-motion-styles";
  style.textContent = `
    @keyframes auth-panel-in {
      from { opacity: 0; transform: translateY(18px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes auth-overlay-pulse {
      0% { transform: scale(.8); opacity: .45; }
      60% { transform: scale(1.25); opacity: .18; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .auth-enter { animation: auth-panel-in .55s ease both; }
  `;
  document.head.appendChild(style);
}

// Muestra pantalla de carga antes de entrar al dashboard.
function showTransition(message) {
  injectMotionStyles();
  transitionOverlay = document.createElement("div");
  transitionOverlay.className =
    "fixed inset-0 z-[70] grid place-items-center bg-slate-950/90 backdrop-blur-xl transition-opacity duration-500";
  transitionOverlay.innerHTML = `
    <div class="relative flex flex-col items-center gap-4 text-center">
      <div class="absolute h-40 w-40 rounded-full bg-cyan-400/30" style="animation: auth-overlay-pulse 1.2s ease-out infinite"></div>
      <div class="relative grid h-20 w-20 place-items-center rounded-full border border-cyan-300/40 bg-cyan-400/15 shadow-2xl shadow-cyan-500/20">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-cyan-100 border-t-transparent"></div>
      </div>
      <p class="relative text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">${message}</p>
    </div>
  `;
  document.body.appendChild(transitionOverlay);
}

// Redirige con una transicion suave.
function redirectWithTransition(route, message = "Preparando dashboard") {
  showTransition(message);
  setTimeout(() => {
    window.location.href = route;
  }, 900);
}

// Inicia el flujo OAuth de Google.
function handleGoogleLogin() {
  setElementDisabled(googleLoginButton, true);
  showTransition("Conectando con Google");
  window.location.href = `${API_BASE_URL}/users/auth/google`;
}

// Muestra errores devueltos por el callback de Google.
function handleGoogleAuthResult() {
  const params = new URLSearchParams(window.location.search);
  const authError = params.get("authError");
  if (!authError) return;

  showNotification(authError, "error");
  window.history.replaceState({}, document.title, window.location.pathname);
  switchToLogin(false);
}

// Muestra notificaciones flotantes al usuario.
function showNotification(message, type = "info") {
  const colors = {
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    error: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  };
  const toast = document.createElement("div");
  toast.className = `fixed right-4 top-4 z-[80] max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl transition duration-300 ${colors[type] || colors.info}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
  }, 2600);
  setTimeout(() => toast.remove(), 3000);
}

// Valida formato basico de correo.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida longitud minima de contrasena.
function isValidPassword(password) {
  return password.length >= 6;
}

// Bloquea o desbloquea controles mientras se procesa.
function setElementDisabled(element, disabled) {
  if (!element) return;
  element.disabled = disabled;
  element.style.opacity = disabled ? "0.5" : "1";
  element.style.cursor = disabled ? "not-allowed" : "pointer";
}

// Hace peticiones al backend y normaliza errores.
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error de solicitud");
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setText(element, value) {
  if (element && value) element.textContent = value;
}

function money(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getFallbackMemberships() {
  return [
    {
      category: "Popular",
      name: "Mensual Full",
      price: 70000,
      durationInDays: 30,
      description: "Acceso completo a zonas de fuerza, cardio y clases base.",
      benefits: ["Acceso libre", "Seguimiento de membresia", "Horarios amplios", "Cuenta digital"],
      isActive: true,
    },
    {
      category: "Flexible",
      name: "Quincenal",
      price: 40000,
      durationInDays: 15,
      description: "Ideal para empezar sin compromiso largo y mantener ritmo.",
      benefits: ["Entrenamiento libre", "Soporte en sede", "Consulta de pagos", "Ingreso rapido"],
      isActive: true,
    },
    {
      category: "Entrada",
      name: "Dia de prueba",
      price: 8000,
      durationInDays: 1,
      description: "Perfecto para conocer la sede y probar el ambiente.",
      benefits: ["Acceso por dia", "Zonas principales", "Asesoria inicial", "Registro simple"],
      isActive: true,
    },
  ];
}

function renderInfoCards(element, items, theme = "light") {
  if (!element || !Array.isArray(items) || !items.length) return;

  element.innerHTML = items
    .map((item) => {
      const isDark = theme === "dark";
      return `
        <article class="${isDark ? "border border-white/10 bg-white/5 text-white" : "border border-zinc-200 bg-zinc-50 text-zinc-950"} p-5">
          <p class="text-xs font-black uppercase tracking-[0.22em] ${isDark ? "text-zinc-400" : "text-lime-700"}">${escapeHtml(item.label || "Detalle")}</p>
          <h3 class="mt-3 text-2xl font-black">${escapeHtml(item.title || "Informacion")}</h3>
          <p class="mt-3 text-sm leading-6 ${isDark ? "text-zinc-300" : "text-zinc-600"}">${escapeHtml(item.description || "")}</p>
        </article>`;
    })
    .join("");
}

function renderAuthStats(items) {
  if (!siteContentElements.authStats || !Array.isArray(items) || !items.length) return;
  const styles = [
    {
      card: "border-cyan-300/20 bg-cyan-400/10 shadow-cyan-950/20",
      text: "text-cyan-100",
    },
    {
      card: "border-sky-300/20 bg-sky-400/10 shadow-sky-950/20",
      text: "text-sky-100",
    },
    {
      card: "border-violet-300/20 bg-violet-400/10 shadow-violet-950/20",
      text: "text-violet-100",
    },
  ];
  siteContentElements.authStats.innerHTML = items
    .slice(0, 3)
    .map((item, index) => {
      const style = styles[index] || styles[0];
      return `
        <article class="rounded-2xl border ${style.card} p-5 shadow-xl">
          <p class="text-4xl font-black">${escapeHtml(item.value || "0")}</p>
          <p class="mt-2 text-xs font-black uppercase tracking-[0.28em] ${style.text}">${escapeHtml(item.label || "Dato")}</p>
        </article>`;
    })
    .join("");
}

function renderAuthCards(items) {
  if (!siteContentElements.authCards || !Array.isArray(items) || !items.length) return;
  siteContentElements.authCards.innerHTML = items
    .map(
      (item) => `
        <article class="rounded-2xl border border-white/10 bg-slate-950/46 p-5">
          <p class="text-sm text-slate-400">${escapeHtml(item.label || "Detalle")}</p>
          <h3 class="mt-5 text-2xl font-black">${escapeHtml(item.title || "Informacion")}</h3>
          <p class="mt-4 text-sm leading-7 text-slate-300">${escapeHtml(item.description || "")}</p>
        </article>`,
    )
    .join("");
}

function renderPublicPlans(memberships) {
  if (!publicPlansElement) return;
  const activePlans = memberships.filter((plan) => plan.isActive !== false);

  publicPlansElement.innerHTML =
    activePlans
      .map(
        (plan, index) => `
          <article class="group relative overflow-hidden border ${index === 0 ? "border-lime-400 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"} p-6 shadow-xl shadow-zinc-200/70 transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div class="pointer-events-none absolute inset-x-0 top-0 h-1 ${index === 0 ? "bg-lime-300" : "bg-zinc-950"}"></div>
            ${index === 0 ? `<span class="absolute right-4 top-4 bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">Popular</span>` : ""}
            <p class="text-xs font-black uppercase tracking-[0.22em] ${index === 0 ? "text-lime-200" : "text-lime-700"}">${escapeHtml(plan.category || "Plan")}</p>
            <h3 class="mt-4 text-2xl font-black uppercase">${escapeHtml(plan.name || "Membresia")}</h3>
            <p class="mt-4 text-4xl font-black">${money(plan.price)}</p>
            <p class="mt-2 text-sm ${index === 0 ? "text-zinc-300" : "text-zinc-600"}">${Number(plan.durationInDays || 0)} dias de acceso</p>
            <p class="mt-4 text-sm leading-7 ${index === 0 ? "text-zinc-300" : "text-zinc-600"}">${escapeHtml(plan.description || "Plan disponible para entrenar y gestionar tu progreso.")}</p>
            <ul class="mt-5 space-y-2 text-sm ${index === 0 ? "text-zinc-200" : "text-zinc-700"}">
              ${(plan.benefits || [])
                .slice(0, 4)
                .map((benefit) => `<li class="flex gap-2"><span class="${index === 0 ? "text-lime-200" : "text-lime-700"}">+</span><span>${escapeHtml(benefit)}</span></li>`)
                .join("")}
            </ul>
            <button type="button" data-plan-register class="mt-6 w-full ${index === 0 ? "bg-lime-300 text-zinc-950 hover:bg-white" : "bg-zinc-950 text-white hover:bg-lime-600"} px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition">
              Afiliarme
            </button>
          </article>`,
      )
      .join("") ||
    `<article class="border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <p class="text-xs font-black uppercase tracking-[0.22em] text-lime-700">Sin planes</p>
      <h3 class="mt-4 text-2xl font-black uppercase">Crea membresias</h3>
      <p class="mt-3 text-sm leading-7 text-zinc-600">Agrega planes desde el panel admin para mostrarlos aqui.</p>
    </article>`;
}

// Carga el contenido editable que se muestra en la portada.
async function loadSiteContent() {
  try {
    const content = await apiRequest("/site-content");
    setText(siteContentElements.eyebrow, content.eyebrow);
    setText(siteContentElements.heroTitle, content.heroTitle);
    setText(siteContentElements.heroDescription, content.heroDescription);
    setText(siteContentElements.experienceEyebrow, content.experienceEyebrow);
    setText(siteContentElements.experienceTitle, content.experienceTitle);
    setText(siteContentElements.plansEyebrow, content.plansEyebrow);
    setText(siteContentElements.plansTitle, content.plansTitle);
    setText(siteContentElements.scheduleEyebrow, content.scheduleEyebrow);
    setText(siteContentElements.fullInfoTitle, content.fullInfoTitle);
    setText(siteContentElements.fullInfoDescription, content.fullInfoDescription);
    setText(siteContentElements.schedule, content.schedule);
    setText(siteContentElements.location, content.location);
    setText(siteContentElements.contact, content.contact);
    setText(siteContentElements.contactEyebrow, content.contactEyebrow);
    setText(siteContentElements.contactTitle, content.contactTitle);
    setText(siteContentElements.howItWorks, content.howItWorks);
    setText(siteContentElements.authBadge, content.authBadge);
    setText(siteContentElements.authTitle, content.authTitle);
    setText(siteContentElements.authDescription, content.authDescription);
    setText(siteContentElements.authLoginEyebrow, content.authLoginEyebrow);
    setText(siteContentElements.authLoginTitle, content.authLoginTitle);
    setText(siteContentElements.authLoginDescription, content.authLoginDescription);

    const highlights = Array.isArray(content.highlights)
      ? content.highlights.filter((item) => item.title || item.description)
      : [];

    if (siteContentElements.highlights && highlights.length) {
      siteContentElements.highlights.innerHTML = highlights
        .map(
          (item) => `
            <article class="border border-zinc-200 bg-zinc-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-lime-400">
              <p class="text-xs font-black uppercase tracking-[0.22em] text-lime-700">${escapeHtml(item.label || "Detalle")}</p>
              <h3 class="mt-4 text-2xl font-black uppercase text-zinc-950">${escapeHtml(item.title || "Informacion")}</h3>
              <p class="mt-3 text-sm leading-7 text-zinc-600">${escapeHtml(item.description || "")}</p>
            </article>`,
        )
        .join("");
    }

    renderInfoCards(siteContentElements.scheduleCards, content.scheduleCards, "dark");
    renderAuthStats(content.authStats);
    renderAuthCards(content.authCards);
  } catch (error) {
    console.error("Error al cargar contenido publico:", error);
  }
}

// Procesa el inicio de sesion.
async function handleLogin(e) {
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    showNotification("Por favor completa todos los campos", "warning");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Por favor ingresa un email valido", "warning");
    return;
  }

  if (!isValidPassword(password)) {
    showNotification("La contrasena debe tener al menos 6 caracteres", "warning");
    return;
  }

  const submitBtn =
    loginForm.querySelector("button[type='submit']") ||
    loginForm.querySelector("button");

  try {
    setElementDisabled(submitBtn, true);
    submitBtn.textContent = "Accediendo...";

    const user = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    showNotification("Bienvenido. Redirigiendo...", "success");
    redirectWithTransition(getDashboardRoute(user), "Iniciando sesion");
  } catch (error) {
    console.error("Error en login:", error);
    showNotification(error.message || "Error al iniciar sesion", "error");
    setElementDisabled(submitBtn, false);
    submitBtn.textContent = "Acceder";
  }
}

// Procesa el registro de nuevos miembros.
async function handleRegister(e) {
  e.preventDefault();

  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();
  const phone = registerPhoneInput.value.trim();
  const documentNumber = registerDocumentInput.value.trim();
  const password = registerPasswordInput.value.trim();

  if (!name || !email || !phone || !documentNumber || !password) {
    showNotification("Por favor completa todos los campos", "warning");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Por favor ingresa un email valido", "warning");
    return;
  }

  if (!isValidPassword(password)) {
    showNotification("La contrasena debe tener al menos 6 caracteres", "warning");
    return;
  }

  const submitBtn =
    registerForm.querySelector("button[type='submit']") ||
    registerForm.querySelector("button");

  try {
    setElementDisabled(submitBtn, true);
    submitBtn.textContent = "Creando cuenta...";

    await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
        document: documentNumber,
        password,
        rol: "Miembro",
      }),
    });

    showNotification("Cuenta creada exitosamente. Ahora inicia sesion.", "success");
    registerForm.reset();
    setTimeout(switchToLogin, 900);
  } catch (error) {
    console.error("Error en registro:", error);
    showNotification(error.message || "Error al crear la cuenta", "error");
  } finally {
    setElementDisabled(submitBtn, false);
    submitBtn.textContent = "Crear cuenta";
  }
}

// Consulta cuantos planes activos hay.
async function loadMembershipCount() {
  try {
    const memberships = await apiRequest("/memberships");
    const newCount = memberships.filter((plan) => plan.isActive !== false).length || 0;
    renderPublicPlans(memberships);

    if (planCountElement) {
      const oldCount = parseInt(planCountElement.textContent, 10);
      if (oldCount !== newCount) {
        planCountElement.style.transform = "scale(1.2)";
        planCountElement.style.transition = "transform 0.3s ease-out";
        setTimeout(() => {
          planCountElement.style.transform = "scale(1)";
        }, 300);
      }

      planCountElement.textContent = newCount;
      planCountElement.setAttribute("data-plan-count", newCount);
    }

    if (authPlanCountElement) {
      authPlanCountElement.textContent = newCount || 1;
    }
  } catch (error) {
    console.error("Error al cargar membresias:", error);
    const fallbackMemberships = getFallbackMemberships();
    renderPublicPlans(fallbackMemberships);
    if (planCountElement) planCountElement.textContent = String(fallbackMemberships.length);
    if (authPlanCountElement) authPlanCountElement.textContent = String(fallbackMemberships.length);
  }
}

// Actualiza el contador de planes periodicamente.
function startMembershipRealTimeUpdate() {
  loadMembershipCount();
  membershipUpdateInterval = setInterval(loadMembershipCount, 5000);
}

// Detiene la actualizacion periodica de planes.
function stopMembershipRealTimeUpdate() {
  if (!membershipUpdateInterval) return;
  clearInterval(membershipUpdateInterval);
  membershipUpdateInterval = null;
}

function openAuthModal() {
  if (!authModal) return;
  authModal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function toggleMobileNav(forceOpen) {
  if (!mobileNav || !mobileNavToggle) return;
  const shouldOpen =
    typeof forceOpen === "boolean" ? forceOpen : mobileNav.classList.contains("hidden");
  mobileNav.classList.toggle("hidden", !shouldOpen);
  mobileNavToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function initializeTiltCards() {
  const cards = document.querySelectorAll("[data-tilt-card]");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = (y / rect.height - 0.5) * -5;
      const rotateY = (x / rect.width - 0.5) * 5;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function animateCounters() {
  if (countersStarted) return;
  countersStarted = true;

  document.querySelectorAll("[data-counter]").forEach((counter) => {
    const target = Number(counter.dataset.counter || 0);
    const start = performance.now();
    const duration = 850;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function initializeScrollReveal() {
  const sections = document.querySelectorAll("[data-reveal-section]");
  if (!sections.length) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}

// Cambia la vista al formulario de login.
function switchToLogin(shouldScroll = true) {
  openAuthModal();
  loginForm.classList.remove("hidden");
  loginForm.classList.add("auth-enter");
  registerForm.classList.add("hidden");

  btnLogin.classList.add("bg-white", "text-slate-950", "shadow-xl", "shadow-white/10");
  btnLogin.classList.remove("text-slate-300");
  btnRegister.classList.add("text-slate-300");
  btnRegister.classList.remove("bg-white", "text-slate-950", "shadow-xl", "shadow-white/10");

  registerForm.reset();
  if (shouldScroll) loginForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Cambia la vista al formulario de registro.
function switchToRegister(shouldScroll = true) {
  openAuthModal();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  registerForm.classList.add("auth-enter");

  btnRegister.classList.add("bg-white", "text-slate-950", "shadow-xl", "shadow-white/10");
  btnRegister.classList.remove("text-slate-300");
  btnLogin.classList.add("text-slate-300");
  btnLogin.classList.remove("bg-white", "text-slate-950", "shadow-xl", "shadow-white/10");

  loginForm.reset();
  if (shouldScroll)
    registerForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Inicializa eventos y estado de la pantalla principal.
function initializeApp() {
  injectMotionStyles();

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    redirectWithTransition(getDashboardRoute(storedUser), "Restaurando sesion");
    return;
  }

  loginForm.reset();
  switchToLogin(false);
  closeAuthModal();
  handleGoogleAuthResult();
  loadSiteContent();
  initializeTiltCards();
  initializeScrollReveal();
  animateCounters();
  startMembershipRealTimeUpdate();
  window.addEventListener("beforeunload", stopMembershipRealTimeUpdate);
}

btnLogin?.addEventListener("click", switchToLogin);
btnRegister?.addEventListener("click", switchToRegister);
navLogin?.addEventListener("click", switchToLogin);
mobileNavToggle?.addEventListener("click", () => toggleMobileNav());
mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) toggleMobileNav(false);
});
authClose?.addEventListener("click", closeAuthModal);
authModal?.addEventListener("click", (event) => {
  if (event.target === authModal) closeAuthModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAuthModal();
});
heroRegister?.addEventListener("click", switchToRegister);
plansRegister?.addEventListener("click", switchToRegister);
offerRegister?.addEventListener("click", switchToLogin);
googleLoginButton?.addEventListener("click", handleGoogleLogin);
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-plan-register]")) switchToRegister();
});
loginForm?.addEventListener("submit", handleLogin);
registerForm?.addEventListener("submit", handleRegister);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

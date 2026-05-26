const API_BASE_URL = "/api";

// Estado general del panel del entrenador.
const state = {
  trainer: null,
  sessions: [],
  users: [],
  subscriptions: [],
  memberRoutines: [],
  selectedSessionId: null,
  paymentTimer: null,
};

const $ = (id) => document.getElementById(id);
const getId = (value) => (typeof value === "object" ? value?._id : value);
const pad = (value) => String(value).padStart(2, "0");
const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha";
const activeNavClass =
  "flex items-center gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:-translate-y-0.5 hover:brightness-105";
const inactiveNavClass =
  "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] hover:text-white";

// Inserta animaciones del dashboard.
function injectDashboardStyles() {
  if ($("dashboard-motion-styles")) return;
  const style = document.createElement("style");
  style.id = "dashboard-motion-styles";
  style.textContent = `
    @keyframes dashboard-in {
      from { opacity: 0; transform: translateY(18px) scale(.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dashboard-out {
      to { opacity: 0; transform: translateY(14px) scale(.985); filter: blur(8px); }
    }
    @keyframes logout-card-in {
      from { opacity: 0; transform: translateY(16px) scale(.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes logout-ring {
      0% { transform: scale(.78); opacity: .55; }
      65% { transform: scale(1.25); opacity: .16; }
      100% { transform: scale(1.55); opacity: 0; }
    }
    @keyframes logout-shimmer {
      from { transform: translateX(-100%); }
      to { transform: translateX(100%); }
    }
    body.dashboard-ready main { animation: dashboard-in .55s ease both; }
    body.dashboard-leaving main { animation: dashboard-out .42s ease both; }
    .logout-card { animation: logout-card-in .42s ease both; }
    .logout-ring { animation: logout-ring 1.3s ease-out infinite; }
    .logout-shimmer { animation: logout-shimmer 1.6s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

// Muestra notificaciones del panel.
function toast(message, type = "info") {
  const node = $("trainer-toast");
  const colors = {
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    error: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  };
  node.className = `fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${colors[type] || colors.info}`;
  node.textContent = message;
  node.classList.remove("hidden");
  setTimeout(() => node.classList.add("hidden"), 2800);
}

// Hace peticiones a la API.
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || "Error de solicitud");
  }
  return response.json();
}

// Valida que el usuario actual sea entrenador.
function requireTrainer() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!isLoggedIn || !user) {
    window.location.href = "./index.html";
    return false;
  }
  if (user.rol === "Admin") {
    window.location.href = "./dashboardAdmin.html";
    return false;
  }
  if (user.rol !== "Entrenador") {
    window.location.href = "./dashboardMember.html";
    return false;
  }

  state.trainer = user;
  $("sidebar-trainer-name").textContent = user.name || "Entrenador";
  $("sidebar-trainer-email").textContent =
    user.email || "entrenador@gym-system.com";
  $("sidebar-trainer-email").title = user.email || "entrenador@gym-system.com";
  $("trainer-hero-title").textContent =
    `Hola, ${user.name || "entrenador"}. Controla tus solicitudes y pagos`;
  return true;
}

// Cierra sesion con animacion.
function logout() {
  document.body.classList.add("dashboard-leaving");
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[80] grid place-items-center bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.16),_transparent_34%),linear-gradient(135deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.96))] px-6 text-center backdrop-blur-xl";
  overlay.innerHTML = `
    <div class="logout-card w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-950/40">
      <div class="relative mx-auto grid h-24 w-24 place-items-center">
        <div class="logout-ring absolute h-24 w-24 rounded-full bg-cyan-400/30"></div>
        <div class="logout-ring absolute h-24 w-24 rounded-full bg-emerald-400/20" style="animation-delay:.28s"></div>
        <div class="relative grid h-20 w-20 place-items-center rounded-full border border-cyan-300/35 bg-cyan-400/10 shadow-2xl shadow-cyan-500/20">
          <div class="h-9 w-9 animate-spin rounded-full border-2 border-cyan-100 border-t-transparent"></div>
        </div>
      </div>
      <p class="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Sesion finalizada</p>
      <h2 class="mt-3 text-4xl font-semibold leading-tight text-white">Vuelve pronto</h2>
      <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">Guardamos tu salida y dejamos el panel listo para tu proxima visita.</p>
      <div class="relative mt-7 h-1 overflow-hidden rounded-full bg-white/10">
        <div class="logout-shimmer absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "./index.html";
  }, 1200);
}

// Carga sesiones, usuarios, pagos y membresias.
async function loadDashboard(selectionMode = "auto") {
  const [sessions, users, subscriptions, memberRoutines] = await Promise.all([
    api(`/training-sessions/trainer/${state.trainer._id}`),
    api("/users"),
    api("/subscriptions"),
    api("/member-routines"),
  ]);

  Object.assign(state, { sessions, users, subscriptions, memberRoutines });
  const selectedSession = state.sessions.find(
    (session) => session._id === state.selectedSessionId,
  );
  if (selectionMode === "pendingOnly") {
    state.selectedSessionId = pendingSessions()[0]?._id || null;
  } else if (!selectedSession || selectedSession.status === "Cancelada") {
    const first = pendingSessions()[0] || activeSessions()[0];
    state.selectedSessionId = first?._id || null;
  }
  renderAll();
}

// Obtiene solicitudes pendientes.
function pendingSessions() {
  return state.sessions
    .filter((session) => session.status === "Pendiente")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Obtiene sesiones confirmadas.
function activeSessions() {
  return state.sessions
    .filter((session) => session.status === "Confirmada")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Une datos de sesion con datos completos del miembro.
function memberFor(session) {
  const memberId = getId(session?.member);
  const fullUser = state.users.find((user) => user._id === memberId);
  return { ...(session?.member || {}), ...(fullUser || {}) };
}

// Busca la suscripcion activa de un miembro.
function activeSubscriptionFor(memberId) {
  const now = new Date();
  return state.subscriptions
    .filter(
      (sub) =>
        getId(sub.user) === memberId &&
        sub.status === "Activa" &&
        new Date(sub.endDate) >= now,
    )
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
}

// Busca la ultima rutina activa generada por un miembro.
function routineFor(memberId) {
  return state.memberRoutines
    .filter((routine) => getId(routine.user) === memberId && routine.status === "Activa")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

// Calcula el proximo rango de pago.
function nextPaymentWindow(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

// Muestra cuenta regresiva del siguiente pago.
function renderPaymentCountdown() {
  const now = new Date();
  const { start, end } = nextPaymentWindow(now);
  const total = end - start;
  const remaining = Math.max(0, end - now);
  const elapsed = Math.min(total, Math.max(0, now - start));
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  $("days-to-pay").textContent = days;
  $("regresive-days").textContent = days;
  $("regresive-hours").textContent = pad(hours);
  $("regresive-minutes").textContent = pad(minutes);
  $("regresive-seconds").textContent = pad(seconds);
  $("date-next-pay").textContent = fmtDate(end);
  $("next-pay-caption").textContent =
    `El proximo pago esta previsto para el ${fmtDate(end)}.`;
  $("payment-cycle-start").textContent = fmtDate(start);
  $("payment-cycle-end").textContent = fmtDate(end);
  $("payment-progress").style.width = `${Math.round((elapsed / total) * 100)}%`;
}

// Renderiza indicadores del entrenador.
function renderSummary() {
  const requests = pendingSessions();
  const active = activeSessions();
  const activeMembers = new Set(active.map((session) => getId(session.member)));

  $("members-actives").textContent = activeMembers.size;
  $("new-solicitudes").textContent = requests.length;
  $("requests-hero-pill").textContent =
    `${requests.length} ${requests.length === 1 ? "solicitud" : "solicitudes"}`;
  $("requests-title").textContent =
    `${requests.length} ${requests.length === 1 ? "solicitud disponible" : "solicitudes disponibles"}`;
  $("requests-section-pill").textContent =
    `${requests.length} ${requests.length === 1 ? "solicitud" : "solicitudes"}`;
}

// Renderiza solicitudes pendientes.
function renderRequests() {
  const requests = pendingSessions();
  if (!requests.length) {
    $("requests-list").className =
      "mt-5 rounded-[26px] border border-dashed border-white/10 bg-black/20 px-6 py-14 text-center";
    $("requests-list").innerHTML = `
      <p class="text-lg font-semibold text-white">No hay solicitudes disponibles</p>
      <p class="mt-3 text-sm leading-6 text-slate-400">
        Cuando un miembro solicite entrenador, aparecera aqui con sus datos y las opciones para aceptar o rechazar.
      </p>
    `;
    return;
  }

  $("requests-list").className = "mt-5 grid gap-3";
  $("requests-list").innerHTML = requests
    .map((session) => {
      const member = memberFor(session);
      const subscription = activeSubscriptionFor(member._id);
      return `
        <article class="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-amber-200">Solicitud pendiente</p>
              <h4 class="mt-2 text-xl font-semibold text-white">${member.name || "Miembro"}</h4>
              <p class="mt-2 text-sm text-slate-400">${fmtDate(session.date)} a las ${session.hour || "--:--"} · ${subscription?.membership?.name || "Sin membresia activa"}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-view-session="${session._id}" class="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:-translate-y-0.5">Ver ficha</button>
              <button data-accept-session="${session._id}" class="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:-translate-y-0.5">Aceptar</button>
              <button data-reject-session="${session._id}" class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:-translate-y-0.5">Rechazar</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Obtiene el valor junto a una etiqueta.
function valueAfterLabel(label) {
  const labelsToFind = Array.isArray(label) ? label : [label];
  const labels = [...$("miembro-detalle").querySelectorAll("p")];
  const title = labels.find((node) =>
    labelsToFind.includes(node.textContent.trim()),
  );
  return title?.parentElement?.querySelector("p.mt-2");
}

// Obtiene el texto de una nota por titulo.
function noteAfterTitle(label) {
  const labelsToFind = Array.isArray(label) ? label : [label];
  const labels = [...$("miembro-detalle").querySelectorAll("p")];
  const title = labels.find((node) =>
    labelsToFind.includes(node.textContent.trim()),
  );
  return title?.parentElement?.querySelector("p.mt-3");
}

// Escribe texto seguro en un nodo.
function setText(node, value) {
  if (node) node.textContent = value;
}

// Renderiza el detalle del miembro seleccionado.
function renderSelectedMember() {
  const session = state.sessions.find(
    (item) => item._id === state.selectedSessionId,
  );
  const member = memberFor(session);
  const subscription = activeSubscriptionFor(member?._id);
  const routine = routineFor(member?._id);
  const sheet = member?.trainerSheet || {};
  const initials = (member?.name || "--")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  setText($("member-avatar"), initials || "--");
  setText($("member-name"), member?.name || "Sin miembro seleccionado");
  setText(
    $("member-status"),
    session
      ? `${session.status} · ${fmtDate(session.date)} ${session.hour || ""}`
      : "Esperando asignacion",
  );
  setText(valueAfterLabel("Correo"), member?.email || "Sin informacion");
  setText(
    valueAfterLabel(["Telefono", "Teléfono", "TelÃ©fono"]),
    member?.phone || "Sin informacion",
  );
  setText(
    valueAfterLabel("Objetivo principal"),
    sheet.goal || subscription?.membership?.name || "Sin informacion",
  );
  setText(valueAfterLabel("Edad"), sheet.age ? `${sheet.age} años` : "--");
  setText(
    valueAfterLabel("Peso inicial"),
    sheet.initialWeight ? `${sheet.initialWeight} kg` : "--",
  );
  setText(
    valueAfterLabel("Estatura"),
    sheet.height ? `${sheet.height} m` : "--",
  );
  setText(
    valueAfterLabel("Disponibilidad"),
    sheet.availability ||
      (session ? `${fmtDate(session.date)} ${session.hour || ""}` : "--"),
  );
  setText(
    noteAfterTitle("Historial deportivo"),
    sheet.sportHistory ||
      (subscription
        ? `Membresia activa desde ${fmtDate(subscription.startDate)} hasta ${fmtDate(subscription.endDate)}.`
        : "Sin informacion disponible."),
  );
  setText(
    noteAfterTitle([
      "Observaciones medicas",
      "Observaciones médicas",
      "Observaciones mÃ©dicas",
    ]),
    sheet.medicalNotes ||
      (session
        ? `Documento: ${member?.document || "Sin documento registrado"}.`
        : "Sin informacion disponible."),
  );
  const alert = $("miembro-detalle").querySelector(
    ".border-dashed.bg-sky-400\\/10",
  );
  setText(
    alert,
    session?.cancelReason
      ? `Motivo de cancelacion: ${session.cancelReason}`
      : session
      ? "Revisa la ficha y decide si aceptas o rechazas la solicitud pendiente."
      : "Cuando exista una solicitud activa, aqui podras ver la ficha completa del miembro antes de tomar una decision.",
  );
  setText(
    $("trainer-routine-pill"),
    routine ? `${routine.exercises?.length || 0} ejercicios` : "Sin rutina",
  );
  $("trainer-routine-list").innerHTML =
    routine?.exercises?.length
      ? routine.exercises
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map(
            (exercise, index) => `
            <div class="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300 md:grid-cols-[1fr_0.7fr]">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-cyan-200">Paso ${index + 1} · ${exercise.focus || "Rutina"}</p>
                <p class="mt-2 font-semibold text-white">${exercise.name}</p>
                <p class="mt-1">${exercise.sets || 3} series · ${exercise.reps || "10-12"} reps · descanso ${exercise.rest || "60s"}</p>
                <p class="mt-2 leading-6 text-slate-400">${exercise.technique || "Sin indicaciones registradas."}</p>
              </div>
              <div class="flex items-center justify-end">
                ${
                  exercise.videoUrl
                    ? `<a href="${exercise.videoUrl}" target="_blank" class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100">Ver tecnica</a>`
                    : `<span class="text-xs text-slate-500">Sin video</span>`
                }
              </div>
            </div>`,
          )
          .join("")
      : `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">El miembro aun no ha generado una rutina.</div>`;
}

// Renderiza todas las secciones del panel.
function renderAll() {
  renderSummary();
  renderRequests();
  renderSelectedMember();
  renderPaymentCountdown();
}

// Marca el enlace activo del menu.
function setActiveNav(hash = window.location.hash || "#resumen") {
  const links = [...document.querySelectorAll('aside nav a[href^="#"]')];
  const targetHash = links.some((link) => link.getAttribute("href") === hash)
    ? hash
    : "#resumen";

  links.forEach((link) => {
    const isActive = link.getAttribute("href") === targetHash;
    link.className = isActive ? activeNavClass : inactiveNavClass;
  });
}

// Acepta, rechaza o cambia estado de una solicitud.
async function updateSessionStatus(id, status, cancelReason = "") {
  const payload = { status };
  if (status === "Cancelada") payload.cancelReason = cancelReason;
  if (status === "Confirmada") payload.cancelReason = "";

  await api(`/training-sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  state.selectedSessionId = status === "Cancelada" ? null : id;
  if (status === "Cancelada") {
    state.sessions = state.sessions.filter((session) => session._id !== id);
    renderAll();
  }
  toast(
    status === "Confirmada" ? "Solicitud aceptada." : "Solicitud rechazada.",
    "success",
  );
  await loadDashboard(status === "Cancelada" ? "pendingOnly" : "auto");
}

// Conecta eventos del panel.
function bindEvents() {
  $("trainer-logout").addEventListener("click", logout);
  setActiveNav();
  window.addEventListener("hashchange", () => setActiveNav());
  document.addEventListener("click", (event) => {
    const navLink = event.target.closest('aside nav a[href^="#"]');
    const viewButton = event.target.closest("[data-view-session]");
    const acceptButton = event.target.closest("[data-accept-session]");
    const rejectButton = event.target.closest("[data-reject-session]");

    if (navLink) {
      setActiveNav(navLink.getAttribute("href"));
    }
    if (viewButton) {
      state.selectedSessionId = viewButton.dataset.viewSession;
      renderSelectedMember();
      $("miembro-detalle").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    if (acceptButton) {
      updateSessionStatus(
        acceptButton.dataset.acceptSession,
        "Confirmada",
      ).catch((error) => toast(error.message, "error"));
    }
    if (rejectButton) {
      const reason = prompt("Escribe el motivo para rechazar la solicitud:");
      if (reason === null) return;
      const cleanReason = reason.trim();
      if (!cleanReason) {
        toast("Debes escribir un motivo para rechazar.", "error");
        return;
      }
      updateSessionStatus(
        rejectButton.dataset.rejectSession,
        "Cancelada",
        cleanReason,
      ).catch((error) => toast(error.message, "error"));
    }
  });
}

// Inicializa el panel del entrenador.
async function init() {
  injectDashboardStyles();
  if (!requireTrainer()) return;
  bindEvents();
  state.paymentTimer = setInterval(renderPaymentCountdown, 1000);
  window.addEventListener("beforeunload", () =>
    clearInterval(state.paymentTimer),
  );
  document.body.classList.add("dashboard-ready");
  try {
    await loadDashboard();
    toast("Dashboard de entrenador actualizado.", "success");
  } catch (error) {
    console.error(error);
    toast(error.message || "No se pudo cargar el dashboard.", "error");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

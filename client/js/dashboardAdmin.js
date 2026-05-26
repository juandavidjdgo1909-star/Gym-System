const API_BASE_URL = "/api";

// Estado general del panel administrador.
const state = {
  users: [],
  memberships: [],
  subscriptions: [],
  payments: [],
  sessions: [],
  trainerProfiles: [],
  routineExercises: [],
  attendance: [],
  progressEntries: [],
  notifications: [],
  routineExercisesPage: 1,
  routineExercisesPerPage: 5,
  siteContent: null,
  currentUser: null,
  usersSearch: "",
  usersPage: 1,
  usersPerPage: 3,
  paymentsSearch: "",
  paymentsPage: 1,
  paymentsPerPage: 5,
  activityPage: 1,
  activityPerPage: 5,
};

const $ = (id) => document.getElementById(id);
const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha";
const getId = (value) => (typeof value === "object" ? value?._id : value);

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

// Muestra mensajes de exito o error.
function toast(message, type = "info") {
  const node = $("admin-toast");
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

// Valida que el usuario actual sea admin.
function requireAdmin() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!isLoggedIn || !user) {
    window.location.href = "./index.html";
    return false;
  }
  if (user.rol !== "Admin") {
    window.location.href = "./dashboardMember.html";
    return false;
  }
  state.currentUser = user;
  $("sidebar-admin-name").textContent = user.name || "Admin";
  $("sidebar-admin-email").textContent = user.email || "admin@gym-system.com";
  $("sidebar-admin-email").title = user.email || "admin@gym-system.com";
  $("admin-hero-title").textContent =
    `Hola, ${user.name || "Admin"}. Centro de control del gimnasio`;
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

// Carga todos los datos que usa el dashboard.
async function loadDashboard() {
  const [
    users,
    memberships,
    subscriptions,
    payments,
    sessions,
    profiles,
    siteContent,
    routineExercises,
    attendance,
    progressEntries,
    notifications,
  ] =
    await Promise.all([
      api("/users"),
      api("/memberships"),
      api("/subscriptions"),
      api("/payments"),
      api("/training-sessions"),
      api("/trainer-profiles"),
      api("/site-content"),
      api("/routine-exercises"),
      api("/attendance"),
      api("/progress"),
      api("/notifications?role=Admin"),
    ]);

  Object.assign(state, {
    users,
    memberships,
    subscriptions,
    payments,
    sessions,
    trainerProfiles: profiles,
    siteContent,
    routineExercises,
    attendance,
    progressEntries,
    notifications,
  });

  renderAll();
}

// Renderiza todas las secciones visibles.
function renderAll() {
  renderSummary();
  renderUsers();
  renderMemberships();
  renderRoutineExercises();
  renderSiteContentForm();
  renderPayments();
  renderActivity();
  renderExecutiveDashboard();
  renderSmartAlerts();
  renderAttendanceControl();
}

function ensureAdminUpgradePanels() {
  if ($("executive-dashboard")) return;
  $("resumen").insertAdjacentHTML(
    "afterend",
    `
      <section id="executive-dashboard" class="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div class="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Analitica ejecutiva</p>
            <h3 class="mt-3 text-2xl font-semibold text-white">Pulso comercial del gimnasio</h3>
          </div>
          <span id="executive-month-pill" class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">Mes actual</span>
        </div>
        <div class="mt-5 grid gap-4 lg:grid-cols-4">
          <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p class="text-sm text-cyan-100/80">Ingreso del mes</p>
            <p id="executive-month-revenue" class="mt-2 text-3xl font-semibold text-white">$ 0</p>
          </div>
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p class="text-sm text-emerald-100/80">Retencion estimada</p>
            <p id="executive-retention" class="mt-2 text-3xl font-semibold text-white">0%</p>
          </div>
          <div class="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p class="text-sm text-amber-100/80">Check-ins hoy</p>
            <p id="executive-checkins" class="mt-2 text-3xl font-semibold text-white">0</p>
          </div>
          <div class="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
            <p class="text-sm text-violet-100/80">Plan mas vendido</p>
            <p id="executive-top-plan" class="mt-2 text-2xl font-semibold text-white">Sin datos</p>
          </div>
        </div>
        <div class="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div class="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p class="text-sm font-semibold text-white">Ingresos por mes</p>
            <div id="executive-revenue-bars" class="mt-4 grid gap-3"></div>
          </div>
          <div class="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p class="text-sm font-semibold text-white">Alertas inteligentes</p>
            <div id="admin-smart-alerts" class="mt-4 grid gap-3"></div>
          </div>
        </div>
      </section>
      <section id="attendance-control" class="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div class="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-lime-200/80">Asistencia QR</p>
            <h3 class="mt-3 text-2xl font-semibold text-white">Check-ins recientes</h3>
          </div>
          <span id="attendance-total-pill" class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">0 registros</span>
        </div>
        <div id="attendance-registry" class="mt-5 grid gap-3"></div>
      </section>
    `,
  );
}

function sameMonth(date, now = new Date()) {
  const value = new Date(date);
  return value.getMonth() === now.getMonth() && value.getFullYear() === now.getFullYear();
}

function renderExecutiveDashboard() {
  ensureAdminUpgradePanels();
  const now = new Date();
  const paid = state.payments.filter((payment) => payment.status === "Pagado");
  const monthRevenue = paid
    .filter((payment) => sameMonth(payment.paymentDate, now))
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const cancelled = state.subscriptions.filter((sub) => sub.status === "Cancelada").length;
  const retention = state.subscriptions.length
    ? Math.round(((state.subscriptions.length - cancelled) / state.subscriptions.length) * 100)
    : 100;
  const today = now.toISOString().slice(0, 10);
  const checkInsToday = state.attendance.filter(
    (item) => new Date(item.checkInAt).toISOString().slice(0, 10) === today,
  ).length;
  const planSales = state.subscriptions.reduce((acc, sub) => {
    const name = sub.membership?.name || "Sin plan";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topPlan = Object.entries(planSales).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sin datos";

  $("executive-month-revenue").textContent = money(monthRevenue);
  $("executive-retention").textContent = `${retention}%`;
  $("executive-checkins").textContent = checkInsToday;
  $("executive-top-plan").textContent = topPlan;
  $("executive-month-pill").textContent = now.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const months = [...Array(6)].map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const total = paid
      .filter((payment) => sameMonth(payment.paymentDate, date))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return { label: date.toLocaleDateString("es-CO", { month: "short" }), total };
  });
  const max = Math.max(...months.map((item) => item.total), 1);
  $("executive-revenue-bars").innerHTML = months
    .map(
      (item) => `
        <div class="grid grid-cols-[72px_1fr_110px] items-center gap-3 text-sm">
          <span class="capitalize text-slate-300">${item.label}</span>
          <div class="h-3 overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style="width:${Math.max(5, (item.total / max) * 100)}%"></div>
          </div>
          <span class="text-right text-slate-200">${money(item.total)}</span>
        </div>`,
    )
    .join("");
}

function renderSmartAlerts() {
  ensureAdminUpgradePanels();
  const now = new Date();
  const sevenDays = 7 * 86400000;
  const expiring = state.subscriptions.filter((sub) => {
    const diff = new Date(sub.endDate) - now;
    return sub.status === "Activa" && diff >= 0 && diff <= sevenDays;
  });
  const pendingPayments = state.payments.filter((payment) => payment.status === "Pendiente");
  const inactiveMembers = state.users.filter((user) => {
    if (user.rol !== "Miembro") return false;
    const last = state.attendance.find((item) => getId(item.user) === user._id);
    return !last || now - new Date(last.checkInAt) > 10 * 86400000;
  });
  const alerts = [
    [`${expiring.length} membresias por vencer`, "Contacta a estos miembros antes de que termine su plan.", "warning"],
    [`${pendingPayments.length} pagos pendientes`, "Revisa o confirma los checkouts simulados.", "info"],
    [`${inactiveMembers.length} miembros sin asistencia reciente`, "Buen momento para una accion de retencion.", "error"],
    ...state.notifications.slice(0, 3).map((item) => [item.title, item.message, item.type]),
  ];
  $("admin-smart-alerts").innerHTML = alerts
    .map(
      ([title, message, type]) => `
        <article class="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p class="text-sm font-semibold ${type === "error" ? "text-rose-100" : type === "warning" ? "text-amber-100" : "text-cyan-100"}">${title}</p>
          <p class="mt-1 text-xs leading-5 text-slate-400">${message}</p>
        </article>`,
    )
    .join("");
}

function renderAttendanceControl() {
  ensureAdminUpgradePanels();
  $("attendance-total-pill").textContent = `${state.attendance.length} registros`;
  $("attendance-registry").innerHTML =
    state.attendance.slice(0, 8).map((item) => {
      const user = item.user || {};
      return `
        <div class="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200 md:grid-cols-[1fr_0.8fr_0.7fr]">
          <span>${user.name || "Miembro"}</span>
          <span>${fmtDate(item.checkInAt)} ${new Date(item.checkInAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>${item.source || "App"}</span>
        </div>`;
    }).join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">Aun no hay check-ins registrados.</div>`;
}

// Renderiza la biblioteca editable de ejercicios para rutinas.
function renderRoutineExercises() {
  const totalPages = Math.max(
    1,
    Math.ceil(state.routineExercises.length / state.routineExercisesPerPage),
  );
  state.routineExercisesPage = Math.min(
    Math.max(1, state.routineExercisesPage),
    totalPages,
  );
  const pageExercises = state.routineExercises.slice(
    (state.routineExercisesPage - 1) * state.routineExercisesPerPage,
    state.routineExercisesPage * state.routineExercisesPerPage,
  );

  $("routine-exercises-pill").textContent =
    `${state.routineExercises.length} ejercicios`;
  $("routine-exercises-registry").innerHTML =
    pageExercises
      .map(
        (exercise) => `
        <article class="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.05]">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-cyan-200">${exercise.gender || "Todos"} · ${exercise.focus || "General"} · ${exercise.level || "Inicial"}</p>
              <h4 class="mt-2 text-xl font-semibold text-white">${exercise.name}</h4>
              <p class="mt-2 text-sm text-slate-300">${exercise.sets || 3} series · ${exercise.reps || "10-12"} reps · ${exercise.rest || "60 segundos"}</p>
              <p class="mt-3 text-sm leading-6 text-slate-400">${exercise.technique || "Sin indicaciones de tecnica."}</p>
            </div>
            <span class="rounded-full border border-white/10 px-3 py-1 text-xs ${exercise.isActive ? "text-emerald-100" : "text-slate-400"}">${exercise.isActive ? "Activo" : "Inactivo"}</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button data-routine-edit="${exercise._id}" class="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-100">Editar</button>
            <button data-routine-delete="${exercise._id}" class="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">Borrar</button>
            ${
              exercise.videoUrl
                ? `<a href="${exercise.videoUrl}" target="_blank" class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">Ver video</a>`
                : ""
            }
          </div>
        </article>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Aun no hay ejercicios configurados.</div>`;
  $("routine-exercises-pagination").classList.toggle(
    "hidden",
    state.routineExercises.length <= state.routineExercisesPerPage,
  );
  $("routine-exercises-pagination").classList.toggle(
    "flex",
    state.routineExercises.length > state.routineExercisesPerPage,
  );
  $("routine-exercises-page-info").textContent =
    `Pagina ${state.routineExercisesPage} de ${totalPages}`;
  $("routine-exercises-prev").disabled = state.routineExercisesPage === 1;
  $("routine-exercises-next").disabled = state.routineExercisesPage === totalPages;
  $("routine-exercises-prev").classList.toggle(
    "opacity-50",
    state.routineExercisesPage === 1,
  );
  $("routine-exercises-next").classList.toggle(
    "opacity-50",
    state.routineExercisesPage === totalPages,
  );
}

// Limpia el formulario de ejercicios de rutina.
function resetRoutineExerciseForm() {
  $("routine-exercise-form").reset();
  $("routine-exercise-id").value = "";
  $("routine-exercise-active").checked = true;
}

// Crea o actualiza ejercicios que usa el generador.
async function handleRoutineExerciseSubmit(event) {
  event.preventDefault();
  const id = $("routine-exercise-id").value;
  const payload = {
    name: $("routine-exercise-name").value.trim(),
    gender: $("routine-exercise-gender").value,
    focus: $("routine-exercise-focus").value.trim(),
    level: $("routine-exercise-level").value,
    goal: $("routine-exercise-goal").value.trim() || "Fuerza",
    sets: Number($("routine-exercise-sets").value || 3),
    reps: $("routine-exercise-reps").value.trim() || "10-12",
    rest: $("routine-exercise-rest").value.trim() || "60 segundos",
    videoUrl: $("routine-exercise-video").value.trim(),
    technique: $("routine-exercise-technique").value.trim(),
    isActive: $("routine-exercise-active").checked,
  };

  if (id) {
    await api(`/routine-exercises/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } else {
    await api("/routine-exercises", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.routineExercisesPage = 1;
  }
  resetRoutineExerciseForm();
  toast(id ? "Ejercicio actualizado." : "Ejercicio creado.", "success");
  await loadDashboard();
}

// Carga un ejercicio en el formulario del admin.
function editRoutineExercise(id) {
  const exercise = state.routineExercises.find((item) => item._id === id);
  if (!exercise) return;
  $("routine-exercise-id").value = exercise._id;
  $("routine-exercise-name").value = exercise.name || "";
  $("routine-exercise-gender").value = exercise.gender || "Todos";
  $("routine-exercise-focus").value = exercise.focus || "";
  $("routine-exercise-level").value = exercise.level || "Inicial";
  $("routine-exercise-goal").value = exercise.goal || "";
  $("routine-exercise-sets").value = exercise.sets || 3;
  $("routine-exercise-reps").value = exercise.reps || "";
  $("routine-exercise-rest").value = exercise.rest || "";
  $("routine-exercise-video").value = exercise.videoUrl || "";
  $("routine-exercise-technique").value = exercise.technique || "";
  $("routine-exercise-active").checked = Boolean(exercise.isActive);
}

// Elimina un ejercicio de rutina.
async function deleteRoutineExercise(id) {
  if (!confirm("Eliminar este ejercicio de rutina?")) return;
  await api(`/routine-exercises/${id}`, { method: "DELETE" });
  state.routineExercisesPage = Math.max(1, state.routineExercisesPage);
  toast("Ejercicio eliminado.", "success");
  await loadDashboard();
}

// Calcula indicadores generales del negocio.
function renderSummary() {
  const now = new Date();
  const paidTotal = state.payments
    .filter((payment) => payment.status === "Pagado")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const activeMembers = new Set(
    state.subscriptions
      .filter((sub) => sub.status === "Activa" && new Date(sub.endDate) >= now)
      .map((sub) => getId(sub.user)),
  );
  const trainers = state.users.filter((user) => user.rol === "Entrenador");
  const activeMemberships = state.memberships.filter((plan) => plan.isActive);

  $("summary-revenue").textContent = money(paidTotal);
  $("summary-active-members").textContent = activeMembers.size;
  $("summary-trainers").textContent = trainers.length;
  $("summary-memberships").textContent = activeMemberships.length;
  $("summary-revenue-caption").textContent =
    `${state.payments.length} pagos registrados`;
  $("summary-active-members-caption").textContent =
    `${state.subscriptions.length} suscripciones historicas`;
  $("summary-trainers-caption").textContent =
    `${state.trainerProfiles.length} perfiles con especialidad`;
  $("summary-memberships-caption").textContent =
    `${state.memberships.length} planes en total`;
}

// Obtiene el plan actual de un usuario.
function userMembershipName(userId) {
  const subscription = state.subscriptions
    .filter((sub) => getId(sub.user) === userId)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
  return subscription?.membership?.name || "Sin plan";
}

// Normaliza texto para busquedas.
function normalized(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Une los datos buscables de cada usuario.
function userSearchText(user) {
  const profile = state.trainerProfiles.find(
    (item) => getId(item.user) === user._id,
  );
  return normalized(
    [
      user.name,
      user.email,
      user.rol,
      user.phone,
      user.document,
      userMembershipName(user._id),
      profile?.specialty,
    ].join(" "),
  );
}

// Busca la suscripcion que genero un pago.
function subscriptionForPayment(payment) {
  const paymentUser = getId(payment.user);
  const paymentMembership = getId(payment.membership);
  return state.subscriptions
    .filter(
      (subscription) =>
        getId(subscription.user) === paymentUser &&
        getId(subscription.membership) === paymentMembership,
    )
    .sort(
      (a, b) =>
        Math.abs(new Date(a.startDate) - new Date(payment.paymentDate)) -
        Math.abs(new Date(b.startDate) - new Date(payment.paymentDate)),
    )[0];
}

// Crea el identificador visible de factura para un pago.
function paymentInvoiceId(payment) {
  const subscription = subscriptionForPayment(payment);
  const sourceId = subscription?._id || payment?._id || "";
  return `GYM-${String(sourceId).slice(-6).toUpperCase()}`;
}

// Une los datos buscables de cada pago.
function paymentSearchText(payment) {
  return normalized(
    [
      paymentInvoiceId(payment),
      `FAC-${String(payment?._id || "").slice(-6).toUpperCase()}`,
      payment._id,
      subscriptionForPayment(payment)?._id,
      payment.user?.name,
      payment.user?.email,
      payment.user?.document,
      payment.membership?.name,
      payment.method,
      payment.status,
      payment.amount,
      fmtDate(payment.paymentDate),
    ].join(" "),
  );
}

// Prepara valores seguros para archivos CSV de Excel.
function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

// Descarga un CSV compatible con Excel.
function downloadExcelCsv(filename, headers, rows) {
  if (!rows.length) {
    toast("No hay datos disponibles para exportar.", "info");
    return;
  }
  const content = [
    headers.map(csvCell).join(";"),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
  toast("Archivo exportado correctamente.", "success");
}

// Abre o cierra la mini pantalla de exportacion.
function toggleExportModal(show) {
  $("export-modal").classList.toggle("hidden", !show);
  $("export-modal").classList.toggle("flex", show);
}

// Exporta el conjunto elegido por el administrador.
function exportAdminData(type) {
  const now = new Date().toISOString().slice(0, 10);
  if (type === "users") {
    const headers = ["Nombre", "Correo", "Telefono", "Documento", "Rol", "Membresia"];
    const rows = state.users
      .filter((user) => user.isActive !== false)
      .map((user) => ({
        Nombre: user.name || "",
        Correo: user.email || "",
        Telefono: user.phone || "",
        Documento: user.document || "",
        Rol: user.rol || "",
        Membresia: userMembershipName(user._id),
      }));
    downloadExcelCsv(`usuarios-activos-${now}`, headers, rows);
  }

  if (type === "sales") {
    const headers = ["Factura", "Usuario", "Membresia", "Metodo", "Monto", "Estado", "Fecha"];
    const rows = state.payments.map((payment) => ({
      Factura: paymentInvoiceId(payment),
      Usuario: payment.user?.name || "Usuario",
      Membresia: payment.membership?.name || "Membresia",
      Metodo: payment.method || "",
      Monto: Number(payment.amount || 0),
      Estado: payment.status || "",
      Fecha: fmtDate(payment.paymentDate),
    }));
    downloadExcelCsv(`ventas-registradas-${now}`, headers, rows);
  }

  if (type === "trainers") {
    const headers = ["Nombre", "Correo", "Telefono", "Documento", "Especialidad"];
    const rows = state.users
      .filter((user) => user.rol === "Entrenador" && user.isActive !== false)
      .map((user) => {
        const profile = state.trainerProfiles.find(
          (item) => getId(item.user) === user._id,
        );
        return {
          Nombre: user.name || "",
          Correo: user.email || "",
          Telefono: user.phone || "",
          Documento: user.document || "",
          Especialidad: profile?.specialty || "",
        };
      });
    downloadExcelCsv(`entrenadores-activos-${now}`, headers, rows);
  }

  toggleExportModal(false);
}

// Lista usuarios con buscador y paginacion.
function renderUsers() {
  const admins = state.users.filter((user) => user.rol === "Admin").length;
  const trainers = state.users.filter(
    (user) => user.rol === "Entrenador",
  ).length;
  const members = state.users.filter((user) => user.rol === "Miembro").length;

  $("admins-count").textContent = admins;
  $("trainers-count").textContent = trainers;
  $("members-count").textContent = members;
  $("users-summary-pill").textContent = `${state.users.length} registros`;

  const query = normalized(state.usersSearch);
  const filteredUsers = query
    ? state.users.filter((user) => userSearchText(user).includes(query))
    : state.users;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / state.usersPerPage));
  state.usersPage = Math.min(state.usersPage, totalPages);
  const start = (state.usersPage - 1) * state.usersPerPage;
  const pageUsers = filteredUsers.slice(start, start + state.usersPerPage);

  $("admin-users-pagination").classList.toggle("hidden", filteredUsers.length <= state.usersPerPage);
  $("admin-users-pagination").classList.toggle("flex", filteredUsers.length > state.usersPerPage);
  $("admin-users-page-info").textContent = `Pagina ${state.usersPage} de ${totalPages}`;
  $("admin-users-prev").disabled = state.usersPage === 1;
  $("admin-users-next").disabled = state.usersPage === totalPages;
  $("admin-users-prev").classList.toggle("opacity-50", state.usersPage === 1);
  $("admin-users-next").classList.toggle("opacity-50", state.usersPage === totalPages);

  $("users-registry").innerHTML =
    pageUsers
      .map(
        (user) => `
        <div class="grid grid-cols-[1.15fr_1fr_0.8fr_0.8fr_0.8fr_0.85fr] gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.04]">
          <span class="font-medium text-white">${user.name || "Sin nombre"}</span>
          <span class="truncate text-slate-300">${user.email || "Sin correo"}</span>
          <span>${user.rol || "Miembro"}</span>
          <span>${user.phone || "-"}</span>
          <span>${userMembershipName(user._id)}</span>
          <span class="flex gap-2">
            <button data-user-edit="${user._id}" class="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-100">Editar</button>
            <button data-user-delete="${user._id}" class="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">Borrar</button>
          </span>
        </div>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">${query ? "No hay usuarios que coincidan con la busqueda" : "Aun no hay usuarios cargados"}</div>`;
}

// Limpia el formulario de usuario.
function resetUserForm() {
  $("user-form").reset();
  $("user-id").value = "";
  $("user-form-badge").textContent = "Nuevo usuario";
  $("user-password").placeholder = "Obligatoria al crear";
  $("specialty-field").classList.add("hidden");
}

// Crea o actualiza usuarios desde el admin.
async function handleUserSubmit(event) {
  event.preventDefault();
  const id = $("user-id").value;
  const role = $("user-role").value;
  const password = $("user-password").value.trim();
  const payload = {
    name: $("user-name").value.trim(),
    email: $("user-email").value.trim(),
    phone: $("user-phone").value.trim(),
    document: $("user-document").value.trim(),
    rol: role,
  };
  if (password) payload.password = password;
  if (!id && !password) {
    toast("La contrasena es obligatoria al crear usuarios.", "error");
    return;
  }

  const savedUser = id
    ? await api(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
    : await api("/users", { method: "POST", body: JSON.stringify(payload) });

  if (role === "Entrenador") {
    const specialty = $("user-specialty").value.trim();
    const existing = state.trainerProfiles.find(
      (profile) => getId(profile.user) === savedUser._id,
    );
    if (existing) {
      await api(`/trainer-profiles/${existing._id}`, {
        method: "PUT",
        body: JSON.stringify({ specialty }),
      });
    } else {
      await api("/trainer-profiles", {
        method: "POST",
        body: JSON.stringify({ user: savedUser._id, specialty }),
      });
    }
  }

  resetUserForm();
  toast(id ? "Usuario actualizado." : "Usuario creado.", "success");
  await loadDashboard();
}

// Carga un usuario en el formulario para editar.
function editUser(id) {
  const user = state.users.find((item) => item._id === id);
  if (!user) return;
  const profile = state.trainerProfiles.find(
    (item) => getId(item.user) === user._id,
  );
  $("user-id").value = user._id;
  $("user-name").value = user.name || "";
  $("user-email").value = user.email || "";
  $("user-phone").value = user.phone || "";
  $("user-document").value = user.document || "";
  $("user-role").value = user.rol || "Miembro";
  $("user-specialty").value = profile?.specialty || "";
  $("user-password").value = "";
  $("user-password").placeholder = "Dejar vacia para conservar";
  $("user-form-badge").textContent = "Editando usuario";
  toggleSpecialty();
}

// Elimina un usuario.
async function deleteUser(id) {
  if (id === state.currentUser._id) {
    toast("No puedes borrar tu propio usuario activo.", "error");
    return;
  }
  if (!confirm("Eliminar este usuario?")) return;
  await api(`/users/${id}`, { method: "DELETE" });
  toast("Usuario eliminado.", "success");
  await loadDashboard();
}

// Muestra especialidad solo si el rol es entrenador.
function toggleSpecialty() {
  $("specialty-field").classList.toggle(
    "hidden",
    $("user-role").value !== "Entrenador",
  );
}

// Renderiza tarjetas de membresias.
function renderMemberships() {
  $("memberships-summary-pill").textContent =
    `${state.memberships.length} planes`;
  $("memberships-registry").innerHTML =
    state.memberships
      .map(
        (plan) => `
        <article class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-violet-200">${plan.category || "General"}</p>
              <h4 class="mt-2 text-xl font-semibold text-white">${plan.name}</h4>
            </div>
            <span class="rounded-full border border-white/10 px-3 py-1 text-xs ${plan.isActive ? "text-emerald-100" : "text-slate-400"}">${plan.isActive ? "Activo" : "Inactivo"}</span>
          </div>
          <p class="mt-3 text-2xl font-semibold text-white">${money(plan.price)}</p>
          <p class="mt-2 text-sm text-slate-300">${plan.durationInDays} dias</p>
          <p class="mt-3 text-sm leading-6 text-slate-300">${plan.description || "Sin descripcion"}</p>
          <div class="mt-4 flex gap-2">
            <button data-plan-edit="${plan._id}" class="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs text-sky-100">Editar</button>
            <button data-plan-delete="${plan._id}" class="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">Borrar</button>
          </div>
        </article>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Ninguna membresia creada actualmente</div>`;
}

// Limpia el formulario de membresias.
function resetMembershipForm() {
  $("membership-form").reset();
  $("membership-id").value = "";
  $("membership-active").checked = true;
}

// Crea o actualiza una membresia.
async function handleMembershipSubmit(event) {
  event.preventDefault();
  const id = $("membership-id").value;
  const payload = {
    name: $("membership-name").value.trim(),
    durationInDays: Number($("membership-duration").value),
    category: $("membership-category").value.trim(),
    price: Number($("membership-price").value),
    benefits: $("membership-benefits")
      .value.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    description: $("membership-description").value.trim(),
    isActive: $("membership-active").checked,
  };

  if (id) {
    await api(`/memberships/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } else {
    await api("/memberships", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  resetMembershipForm();
  toast(id ? "Membresia actualizada." : "Membresia creada.", "success");
  await loadDashboard();
}

// Carga una membresia para editar.
function editMembership(id) {
  const plan = state.memberships.find((item) => item._id === id);
  if (!plan) return;
  $("membership-id").value = plan._id;
  $("membership-name").value = plan.name || "";
  $("membership-duration").value = plan.durationInDays || "";
  $("membership-category").value = plan.category || "";
  $("membership-price").value = plan.price || "";
  $("membership-benefits").value = (plan.benefits || []).join(", ");
  $("membership-description").value = plan.description || "";
  $("membership-active").checked = Boolean(plan.isActive);
}

// Elimina una membresia.
async function deleteMembership(id) {
  if (!confirm("Eliminar esta membresia?")) return;
  await api(`/memberships/${id}`, { method: "DELETE" });
  toast("Membresia eliminada.", "success");
  await loadDashboard();
}

// Lleva el contenido publico al formulario de administracion.
function renderSiteContentForm() {
  const content = state.siteContent || {};
  $("site-eyebrow-input").value = content.eyebrow || "";
  $("site-hero-title-input").value = content.heroTitle || "";
  $("site-hero-description-input").value = content.heroDescription || "";
  $("site-experience-eyebrow-input").value = content.experienceEyebrow || "";
  $("site-experience-title-input").value = content.experienceTitle || "";
  $("site-plans-eyebrow-input").value = content.plansEyebrow || "";
  $("site-plans-title-input").value = content.plansTitle || "";
  $("site-schedule-eyebrow-input").value = content.scheduleEyebrow || "";
  $("site-full-info-title-input").value = content.fullInfoTitle || "";
  $("site-full-info-description-input").value =
    content.fullInfoDescription || "";
  $("site-schedule-input").value = content.schedule || "";
  $("site-contact-eyebrow-input").value = content.contactEyebrow || "";
  $("site-contact-title-input").value = content.contactTitle || "";
  $("site-location-input").value = content.location || "";
  $("site-contact-input").value = content.contact || "";
  $("site-how-it-works-input").value = content.howItWorks || "";
  $("site-highlights-input").value = (content.highlights || [])
    .map(
      (item) =>
        `${item.label || ""} | ${item.title || ""} | ${item.description || ""}`,
    )
    .join("\n");
  $("site-schedule-cards-input").value = (content.scheduleCards || [])
    .map(
      (item) =>
        `${item.label || ""} | ${item.title || ""} | ${item.description || ""}`,
    )
    .join("\n");
  $("site-auth-stats-input").value = (content.authStats || [])
    .map((item) => `${item.value || ""} | ${item.label || ""}`)
    .join("\n");
  $("site-auth-badge-input").value = content.authBadge || "";
  $("site-auth-title-input").value = content.authTitle || "";
  $("site-auth-description-input").value = content.authDescription || "";
  $("site-auth-login-eyebrow-input").value = content.authLoginEyebrow || "";
  $("site-auth-login-title-input").value = content.authLoginTitle || "";
  $("site-auth-login-description-input").value =
    content.authLoginDescription || "";
  $("site-auth-cards-input").value = (content.authCards || [])
    .map(
      (item) =>
        `${item.label || ""} | ${item.title || ""} | ${item.description || ""}`,
    )
    .join("\n");
}

function parseHighlights(value) {
  return value
    .split("\n")
    .map((line) => {
      const [label = "", title = "", ...descriptionParts] = line.split("|");
      return {
        label: label.trim(),
        title: title.trim(),
        description: descriptionParts.join("|").trim(),
      };
    })
    .filter((item) => item.label || item.title || item.description);
}

function parseStats(value) {
  return value
    .split("\n")
    .map((line) => {
      const [value = "", label = ""] = line.split("|");
      return {
        value: value.trim(),
        label: label.trim(),
      };
    })
    .filter((item) => item.value || item.label);
}

// Actualiza la informacion que se muestra en la pantalla inicial.
async function handleSiteContentSubmit(event) {
  event.preventDefault();
  const payload = {
    eyebrow: $("site-eyebrow-input").value.trim(),
    heroTitle: $("site-hero-title-input").value.trim(),
    heroDescription: $("site-hero-description-input").value.trim(),
    experienceEyebrow: $("site-experience-eyebrow-input").value.trim(),
    experienceTitle: $("site-experience-title-input").value.trim(),
    plansEyebrow: $("site-plans-eyebrow-input").value.trim(),
    plansTitle: $("site-plans-title-input").value.trim(),
    scheduleEyebrow: $("site-schedule-eyebrow-input").value.trim(),
    fullInfoTitle: $("site-full-info-title-input").value.trim(),
    fullInfoDescription: $("site-full-info-description-input").value.trim(),
    schedule: $("site-schedule-input").value.trim(),
    contactEyebrow: $("site-contact-eyebrow-input").value.trim(),
    contactTitle: $("site-contact-title-input").value.trim(),
    location: $("site-location-input").value.trim(),
    contact: $("site-contact-input").value.trim(),
    howItWorks: $("site-how-it-works-input").value.trim(),
    highlights: parseHighlights($("site-highlights-input").value),
    scheduleCards: parseHighlights($("site-schedule-cards-input").value),
    authStats: parseStats($("site-auth-stats-input").value),
    authBadge: $("site-auth-badge-input").value.trim(),
    authTitle: $("site-auth-title-input").value.trim(),
    authDescription: $("site-auth-description-input").value.trim(),
    authLoginEyebrow: $("site-auth-login-eyebrow-input").value.trim(),
    authLoginTitle: $("site-auth-login-title-input").value.trim(),
    authLoginDescription: $("site-auth-login-description-input").value.trim(),
    authCards: parseHighlights($("site-auth-cards-input").value),
  };

  state.siteContent = await api("/site-content", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  renderSiteContentForm();
  toast("Contenido publico actualizado.", "success");
}

// Renderiza resumen e historial de pagos.
function renderPayments() {
  const sumBy = (status) =>
    state.payments
      .filter((payment) => payment.status === status)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const paymentQuery = normalized(state.paymentsSearch);
  const visiblePayments = state.payments.filter((payment) =>
    paymentSearchText(payment).includes(paymentQuery),
  );
  const totalPages = Math.max(1, Math.ceil(visiblePayments.length / state.paymentsPerPage));
  state.paymentsPage = Math.min(Math.max(1, state.paymentsPage), totalPages);
  const pagePayments = visiblePayments.slice(
    (state.paymentsPage - 1) * state.paymentsPerPage,
    state.paymentsPage * state.paymentsPerPage,
  );

  $("payments-summary-pill").textContent =
    paymentQuery
      ? `${visiblePayments.length} de ${state.payments.length} movimientos`
      : `${state.payments.length} movimientos`;
  $("paid-payments-total").textContent = money(sumBy("Pagado"));
  $("pending-payments-total").textContent = money(sumBy("Pendiente"));
  $("cancelled-payments-total").textContent = money(sumBy("Cancelado"));
  $("payments-registry").innerHTML =
    pagePayments
      .map(
        (payment) => `
        <div class="grid grid-cols-[0.85fr_1.05fr_1fr_0.75fr_0.8fr_0.75fr_0.75fr] gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.04]">
          <span>${paymentInvoiceId(payment)}</span>
          <span>${payment.user?.name || "Usuario"}</span>
          <span>${payment.membership?.name || "Membresia"}</span>
          <span>${payment.method || "-"}</span>
          <span>${money(payment.amount)}</span>
          <span>${payment.status || "Pendiente"}</span>
          <span>${fmtDate(payment.paymentDate)}</span>
        </div>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">${
      paymentQuery
        ? "No hay facturas que coincidan con la busqueda"
        : "Aun no hay movimientos de caja registrados"
    }</div>`;
  $("payments-pagination").classList.toggle("hidden", visiblePayments.length <= state.paymentsPerPage);
  $("payments-pagination").classList.toggle("flex", visiblePayments.length > state.paymentsPerPage);
  $("payments-page-info").textContent = `Pagina ${state.paymentsPage} de ${totalPages}`;
  $("payments-prev").disabled = state.paymentsPage === 1;
  $("payments-next").disabled = state.paymentsPage === totalPages;
  $("payments-prev").classList.toggle("opacity-50", state.paymentsPage === 1);
  $("payments-next").classList.toggle("opacity-50", state.paymentsPage === totalPages);
}

// Renderiza actividad consolidada del sistema.
function renderActivity() {
  const now = new Date();
  const purchases = state.subscriptions.map((sub) => ({
    member: sub.user?.name || "Miembro",
    action: `Compro ${sub.membership?.name || "una membresia"}`,
    date: sub.createdAt || sub.startDate,
    type: "Compra",
  }));
  const bookings = state.sessions.map((session) => ({
    member: session.member?.name || "Miembro",
    action: `Reservo con ${session.trainer?.name || "entrenador"} a las ${session.hour || "--:--"}`,
    date: session.date,
    type: "Reserva",
  }));
  const expired = state.subscriptions
    .filter((sub) => new Date(sub.endDate) < now || sub.status === "Expirada")
    .map((sub) => ({
      member: sub.user?.name || "Miembro",
      action: `Vencio ${sub.membership?.name || "su membresia"}`,
      date: sub.endDate,
      type: "Vencida",
    }));
  const cancellations = state.subscriptions
    .filter((sub) => sub.status === "Cancelada")
    .map((sub) => ({
      member: sub.user?.name || "Miembro",
      action: `Cancelo ${sub.membership?.name || "su membresia"}${
        sub.cancelReason ? ` - Motivo: ${sub.cancelReason}` : ""
      }`,
      date: sub.updatedAt || sub.endDate,
      type: "Cancelacion",
    }));
  const events = [...purchases, ...bookings, ...expired, ...cancellations].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const totalPages = Math.max(1, Math.ceil(events.length / state.activityPerPage));
  state.activityPage = Math.min(Math.max(1, state.activityPage), totalPages);
  const pageEvents = events.slice(
    (state.activityPage - 1) * state.activityPerPage,
    state.activityPage * state.activityPerPage,
  );

  $("activity-purchases-count").textContent = purchases.length;
  $("activity-bookings-count").textContent = bookings.length;
  $("activity-expired-count").textContent = expired.length + cancellations.length;
  $("activity-summary-pill").textContent = `${events.length} eventos`;
  $("activity-registry").innerHTML =
    pageEvents
      .map(
        (event) => `
        <div class="grid grid-cols-[0.9fr_1.6fr_0.9fr_0.8fr] gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.04]">
          <span>${event.member}</span>
          <span>${event.action}</span>
          <span>${fmtDate(event.date)}</span>
          <span>${event.type}</span>
        </div>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Aun no hay actividad consolidada</div>`;
  $("activity-pagination").classList.toggle("hidden", events.length <= state.activityPerPage);
  $("activity-pagination").classList.toggle("flex", events.length > state.activityPerPage);
  $("activity-page-info").textContent = `Pagina ${state.activityPage} de ${totalPages}`;
  $("activity-prev").disabled = state.activityPage === 1;
  $("activity-next").disabled = state.activityPage === totalPages;
  $("activity-prev").classList.toggle("opacity-50", state.activityPage === 1);
  $("activity-next").classList.toggle("opacity-50", state.activityPage === totalPages);
}

// Conecta eventos de formularios y botones.
function bindEvents() {
  $("admin-logout").addEventListener("click", logout);
  $("export-open").addEventListener("click", () => toggleExportModal(true));
  $("export-close").addEventListener("click", () => toggleExportModal(false));
  $("export-modal").addEventListener("click", (event) => {
    if (event.target.id === "export-modal") toggleExportModal(false);
  });
  $("user-form").addEventListener("submit", (event) =>
    handleUserSubmit(event).catch((error) => toast(error.message, "error")),
  );
  $("user-reset").addEventListener("click", resetUserForm);
  $("user-role").addEventListener("change", toggleSpecialty);
  $("membership-form").addEventListener("submit", (event) =>
    handleMembershipSubmit(event).catch((error) =>
      toast(error.message, "error"),
    ),
  );
  $("routine-exercise-form").addEventListener("submit", (event) =>
    handleRoutineExerciseSubmit(event).catch((error) =>
      toast(error.message, "error"),
    ),
  );
  $("site-content-form").addEventListener("submit", (event) =>
    handleSiteContentSubmit(event).catch((error) =>
      toast(error.message, "error"),
    ),
  );
  $("membership-reset").addEventListener("click", resetMembershipForm);
  $("routine-exercise-reset").addEventListener("click", resetRoutineExerciseForm);
  $("routine-exercises-prev").addEventListener("click", () => {
    state.routineExercisesPage = Math.max(1, state.routineExercisesPage - 1);
    renderRoutineExercises();
  });
  $("routine-exercises-next").addEventListener("click", () => {
    state.routineExercisesPage += 1;
    renderRoutineExercises();
  });
  $("admin-users-search").addEventListener("input", (event) => {
    state.usersSearch = event.target.value;
    state.usersPage = 1;
    renderUsers();
  });
  $("admin-users-prev").addEventListener("click", () => {
    state.usersPage = Math.max(1, state.usersPage - 1);
    renderUsers();
  });
  $("admin-users-next").addEventListener("click", () => {
    state.usersPage += 1;
    renderUsers();
  });
  $("payment-invoice-search").addEventListener("input", (event) => {
    state.paymentsSearch = event.target.value;
    state.paymentsPage = 1;
    renderPayments();
  });
  $("payments-prev").addEventListener("click", () => {
    state.paymentsPage = Math.max(1, state.paymentsPage - 1);
    renderPayments();
  });
  $("payments-next").addEventListener("click", () => {
    state.paymentsPage += 1;
    renderPayments();
  });
  $("activity-prev").addEventListener("click", () => {
    state.activityPage = Math.max(1, state.activityPage - 1);
    renderActivity();
  });
  $("activity-next").addEventListener("click", () => {
    state.activityPage += 1;
    renderActivity();
  });

  document.addEventListener("click", (event) => {
    const userEdit = event.target.closest("[data-user-edit]");
    const userDelete = event.target.closest("[data-user-delete]");
    const planEdit = event.target.closest("[data-plan-edit]");
    const planDelete = event.target.closest("[data-plan-delete]");
    const routineEdit = event.target.closest("[data-routine-edit]");
    const routineDelete = event.target.closest("[data-routine-delete]");
    const exportButton = event.target.closest("[data-export]");
    if (exportButton) exportAdminData(exportButton.dataset.export);
    if (userEdit) editUser(userEdit.dataset.userEdit);
    if (userDelete)
      deleteUser(userDelete.dataset.userDelete).catch((error) =>
        toast(error.message, "error"),
      );
    if (planEdit) editMembership(planEdit.dataset.planEdit);
    if (planDelete)
      deleteMembership(planDelete.dataset.planDelete).catch((error) =>
        toast(error.message, "error"),
      );
    if (routineEdit) editRoutineExercise(routineEdit.dataset.routineEdit);
    if (routineDelete)
      deleteRoutineExercise(routineDelete.dataset.routineDelete).catch((error) =>
        toast(error.message, "error"),
      );
  });
}

// Inicializa el panel administrador.
async function init() {
  injectDashboardStyles();
  if (!requireAdmin()) return;
  bindEvents();
  document.body.classList.add("dashboard-ready");
  try {
    await loadDashboard();
    toast("Dashboard admin actualizado.", "success");
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

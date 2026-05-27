const API_BASE_URL = "/api";

// Estado general del panel del miembro.
const state = {
  user: null,
  memberships: [],
  subscriptions: [],
  payments: [],
  sessions: [],
  allSessions: [],
  users: [],
  trainerProfiles: [],
  routineExercises: [],
  currentRoutine: null,
  attendance: [],
  progressEntries: [],
  notifications: [],
  trainerMessages: [],
  activeSubscription: null,
  sessionsPage: 1,
  routinePage: 1,
  routinePerPage: 3,
  currentInvoice: null,
};

const $ = (id) => document.getElementById(id);
const getId = (value) => (typeof value === "object" ? value?._id : value);
const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha";
const youtubeEmbed = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.includes("/embed/")) return value;
  const match = value.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : value;
};

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

// Muestra mensajes flotantes.
function toast(message, type = "info") {
  const node = $("member-toast");
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

// Valida que el usuario actual sea miembro.
function requireMember() {
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
  if (user.rol === "Entrenador") {
    window.location.href = "./dashboardTrainer.html";
    return false;
  }
  state.user = user;
  $("sidebar-member-name").textContent = user.name || "Miembro";
  $("sidebar-member-email").textContent = user.email || "usuario@gym-system.com";
  $("sidebar-member-email").title = user.email || "usuario@gym-system.com";
  $("member-hero-title").textContent = `Hola, ${user.name || "miembro"}. Controla tu entrenamiento`;
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

// Carga datos del miembro, planes, citas y entrenadores.
async function loadDashboard() {
  const [
    memberships,
    subscriptions,
    payments,
    allSessions,
    users,
    profiles,
    routineExercises,
    currentRoutine,
    attendance,
    progressEntries,
    notifications,
    trainerMessages,
  ] = await Promise.all([
    api("/memberships"),
    api(`/subscriptions/user/${state.user._id}`),
    api(`/payments/user/${state.user._id}`),
    api("/training-sessions"),
    api("/users"),
    api("/trainer-profiles"),
    api("/routine-exercises"),
    api(`/member-routines/user/${state.user._id}`),
    api(`/attendance/user/${state.user._id}`),
    api(`/progress/user/${state.user._id}`),
    api(`/notifications?user=${state.user._id}&role=Miembro`),
    api(`/trainer-messages?member=${state.user._id}`),
  ]);

  Object.assign(state, {
    memberships,
    subscriptions,
    payments,
    allSessions,
    sessions: allSessions.filter((session) => getId(session.member) === state.user._id),
    users,
    trainerProfiles: profiles,
    routineExercises,
    currentRoutine,
    attendance,
    progressEntries,
    notifications,
    trainerMessages,
  });
  const freshUser = users.find((user) => user._id === state.user._id);
  if (freshUser) {
    state.user = freshUser;
    localStorage.setItem("user", JSON.stringify(freshUser));
  }
  state.activeSubscription = getActiveSubscription();
  renderAll();
}

// Busca el pago asociado a una suscripcion.
function paymentForSubscription(subscription) {
  const membershipId = getId(subscription.membership);
  return state.payments
    .filter((payment) => getId(payment.membership) === membershipId)
    .sort(
      (a, b) =>
        Math.abs(new Date(a.paymentDate) - new Date(subscription.startDate)) -
        Math.abs(new Date(b.paymentDate) - new Date(subscription.startDate)),
    )[0];
}

// Abre o cierra la ventana de factura.
function toggleInvoiceModal(show) {
  $("invoice-modal").classList.toggle("hidden", !show);
  $("invoice-modal").classList.toggle("flex", show);
}

// Muestra una factura visual de la membresia comprada.
function showInvoice(subscriptionId) {
  const subscription = state.subscriptions.find((sub) => sub._id === subscriptionId);
  if (!subscription) {
    toast("No se encontro la factura de esta membresia.", "error");
    return;
  }
  const payment = paymentForSubscription(subscription);
  const plan = subscription.membership || payment?.membership || {};
  const invoiceNumber = `GYM-${String(subscription._id || "").slice(-6).toUpperCase()}`;
  const amount = payment?.amount ?? plan.price ?? 0;
  state.currentInvoice = {
    number: invoiceNumber,
    status: payment?.status || subscription.status,
    purchaseDate: fmtDate(payment?.paymentDate || subscription.startDate),
    clientName: state.user.name || "Miembro",
    clientEmail: state.user.email || "Sin correo",
    clientDocument: state.user.document || "No registrado",
    planName: plan.name || "Membresia",
    method: payment?.method || "Transferencia",
    startDate: fmtDate(subscription.startDate),
    endDate: fmtDate(subscription.endDate),
    amount: money(amount),
  };

  $("invoice-content").innerHTML = `
    <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div class="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.28em] text-cyan-200">Factura</p>
          <h4 class="mt-2 text-3xl font-semibold text-white">${invoiceNumber}</h4>
          <p class="mt-2 text-sm text-slate-400">Fecha de compra: ${fmtDate(payment?.paymentDate || subscription.startDate)}</p>
        </div>
        <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
          ${payment?.status || subscription.status}
        </div>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Cliente</p>
          <p class="mt-2 text-lg font-semibold text-white">${state.user.name || "Miembro"}</p>
          <p class="mt-1 text-sm text-slate-400">${state.user.email || "Sin correo"}</p>
          <p class="mt-1 text-sm text-slate-400">Documento: ${state.user.document || "No registrado"}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Gimnasio</p>
          <p class="mt-2 text-lg font-semibold text-white">Gym-System</p>
          <p class="mt-1 text-sm text-slate-400">Servicio de membresia deportiva</p>
          <p class="mt-1 text-sm text-slate-400">Metodo: ${payment?.method || "Transferencia"}</p>
        </div>
      </div>

      <div class="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div class="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-3 bg-black/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>Plan</span><span>Vigencia</span><span>Total</span>
        </div>
        <div class="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm text-slate-200">
          <span class="font-semibold text-white">${plan.name || "Membresia"}</span>
          <span>${fmtDate(subscription.startDate)} - ${fmtDate(subscription.endDate)}</span>
          <span class="font-semibold text-white">${money(amount)}</span>
        </div>
      </div>

      <div class="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <p class="text-sm leading-6 text-cyan-50">
          Esta membresia vence el <strong>${fmtDate(subscription.endDate)}</strong>. Conserva esta factura como comprobante de compra.
        </p>
      </div>
    </div>
  `;
  toggleInvoiceModal(true);
}

// Genera una factura limpia para guardar en PDF o imprimir.
function printableInvoiceHtml(invoice) {
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Factura Gym-System ${invoice.number}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #ffffff; color: #0f172a; font-family: Arial, sans-serif; }
        body { width: 100%; }
        .invoice { max-width: 760px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; page-break-inside: avoid; }
        .top { background: #0f172a; color: #ffffff; padding: 28px; display: flex; justify-content: space-between; gap: 20px; }
        .brand { font-size: 28px; font-weight: 800; letter-spacing: 1px; }
        .muted { color: #64748b; font-size: 13px; line-height: 1.5; }
        .top .muted { color: #cbd5e1; }
        .badge { align-self: flex-start; border: 1px solid #22c55e; color: #bbf7d0; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; }
        .content { padding: 26px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
        .box { border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #f8fafc; }
        .label { color: #64748b; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
        h1, h2, p { margin: 0; }
        h1 { font-size: 30px; margin-top: 8px; }
        h2 { font-size: 18px; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
        th { background: #e0f2fe; color: #075985; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; text-align: left; padding: 13px; }
        td { padding: 16px 13px; border-top: 1px solid #e2e8f0; font-size: 14px; }
        .total { font-weight: 800; font-size: 17px; }
        .notice { margin-top: 22px; border: 1px solid #bae6fd; background: #f0f9ff; color: #075985; border-radius: 14px; padding: 16px; font-size: 14px; line-height: 1.6; }
        .footer { margin-top: 22px; color: #64748b; font-size: 12px; text-align: center; }
        @media print {
          html, body { width: 210mm; min-height: 0; }
          .invoice { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <main class="invoice">
        <section class="top">
          <div>
            <p class="brand">Gym-System</p>
            <p class="muted">Factura de membresia deportiva</p>
          </div>
          <div>
            <p class="badge">${invoice.status}</p>
          </div>
        </section>
        <section class="content">
          <p class="label">Factura</p>
          <h1>${invoice.number}</h1>
          <p class="muted">Fecha de compra: ${invoice.purchaseDate}</p>

          <div class="grid">
            <div class="box">
              <p class="label">Cliente</p>
              <h2>${invoice.clientName}</h2>
              <p class="muted">${invoice.clientEmail}</p>
              <p class="muted">Documento: ${invoice.clientDocument}</p>
            </div>
            <div class="box">
              <p class="label">Pago</p>
              <h2>${invoice.method}</h2>
              <p class="muted">Estado: ${invoice.status}</p>
              <p class="muted">Gimnasio: Gym-System</p>
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Plan</th><th>Vigencia</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.planName}</td>
                <td>${invoice.startDate} - ${invoice.endDate}</td>
                <td class="total">${invoice.amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="notice">
            Esta membresia vence el <strong>${invoice.endDate}</strong>. Conserva esta factura como comprobante de compra.
          </div>
          <p class="footer">Documento generado por Gym-System.</p>
        </section>
      </main>
    </body>
  </html>`;
}

// Descarga la factura como PDF real.
function downloadInvoicePdf() {
  if (!state.currentInvoice) {
    toast("Abre primero una factura para poder descargarla.", "error");
    return;
  }
  const jsPdfLib = window.jspdf?.jsPDF;
  if (!jsPdfLib) {
    toast("No se pudo cargar el generador PDF. Revisa tu conexion.", "error");
    return;
  }

  const invoice = state.currentInvoice;
  const doc = new jsPdfLib({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 42, pageWidth - margin * 2, 92, 14, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Gym-System", margin + 24, 82);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Factura de membresia deportiva", margin + 24, 106);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(invoice.status, pageWidth - margin - 95, 82);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FACTURA", margin, 175);
  doc.setFontSize(26);
  doc.text(invoice.number, margin, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Fecha de compra: ${invoice.purchaseDate}`, margin, 232);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 270, 235, 118, 10, 10, "FD");
  doc.roundedRect(margin + 260, 270, 235, 118, 10, 10, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CLIENTE", margin + 16, 296);
  doc.text("PAGO", margin + 276, 296);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.text(invoice.clientName, margin + 16, 324);
  doc.text(invoice.method, margin + 276, 324);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(invoice.clientEmail, margin + 16, 348);
  doc.text(`Documento: ${invoice.clientDocument}`, margin + 16, 370);
  doc.text(`Estado: ${invoice.status}`, margin + 276, 348);
  doc.text("Gimnasio: Gym-System", margin + 276, 370);

  const tableTop = 430;
  doc.setFillColor(224, 242, 254);
  doc.rect(margin, tableTop, pageWidth - margin * 2, 36, "F");
  doc.setTextColor(7, 89, 133);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PLAN", margin + 14, tableTop + 23);
  doc.text("VIGENCIA", margin + 250, tableTop + 23);
  doc.text("TOTAL", margin + 430, tableTop + 23);

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, tableTop, pageWidth - margin * 2, 86);
  doc.line(margin, tableTop + 36, pageWidth - margin, tableTop + 36);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(invoice.planName, margin + 14, tableTop + 66);
  doc.text(`${invoice.startDate} - ${invoice.endDate}`, margin + 250, tableTop + 66);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.amount, margin + 430, tableTop + 66);

  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin, 555, pageWidth - margin * 2, 70, 10, 10, "FD");
  doc.setTextColor(7, 89, 133);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Esta membresia vence el ${invoice.endDate}.`, margin + 18, 585);
  doc.text("Conserva esta factura como comprobante de compra.", margin + 18, 607);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text("Documento generado por Gym-System.", pageWidth / 2, 760, { align: "center" });
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = `factura-${invoice.number}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  toast("Factura PDF descargada.", "success");
}

// Abre una factura limpia para impresion fisica.
function prepareInvoiceOutput() {
  if (!state.currentInvoice) {
    toast("Abre primero una factura para poder imprimirla.", "error");
    return;
  }
  alert("Se abrira la factura limpia. Elige tu impresora y confirma la impresion.");

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    toast("Permite ventanas emergentes para generar la factura.", "error");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(printableInvoiceHtml(state.currentInvoice));
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 350);
}

// Obtiene la suscripcion activa del miembro.
function getActiveSubscription() {
  const now = new Date();
  return state.subscriptions
    .filter((sub) => sub.status === "Activa" && new Date(sub.endDate) >= now)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
}

// Calcula dias restantes de membresia.
function daysLeft(subscription) {
  if (!subscription) return 0;
  const diff = new Date(subscription.endDate) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// Filtra usuarios con rol entrenador.
function trainers() {
  return state.users
    .filter((user) => user.rol === "Entrenador")
    .map((user) => ({
      ...user,
      profile: state.trainerProfiles.find((profile) => getId(profile.user) === user._id),
    }));
}

// Renderiza todas las secciones.
function renderAll() {
  renderMembershipStatus();
  renderSubscriptionsHistory();
  renderPlans();
  renderRoutine();
  renderTrainerSheet();
  renderTrainers();
  renderBookingForm();
  renderSessions();
  renderMemberUpgradePanels();
  renderProgressPanel();
  renderAttendancePanel();
  renderMemberMessages();
  renderMemberNotifications();
}

function ensureMemberUpgradePanels() {
  if ($("member-upgrade-panels")) return;
  document.querySelector(".dashboard-content")?.insertAdjacentHTML(
    "beforeend",
    `
      <section id="member-upgrade-panels" class="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div class="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div class="border-b border-white/10 pb-4">
            <p class="text-xs uppercase tracking-[0.28em] text-lime-200/80">Check-in digital</p>
            <h3 class="mt-3 text-2xl font-semibold text-white">Entrada por app/QR</h3>
          </div>
          <div class="mt-5 grid gap-3">
            <button id="member-checkin" type="button" class="rounded-2xl bg-lime-300 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-white">Registrar entrada hoy</button>
            <p id="member-checkin-status" class="text-sm leading-6 text-slate-300">Aun no hay registro de hoy.</p>
            <div id="member-attendance-list" class="grid gap-2"></div>
          </div>
        </div>
        <div class="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div class="border-b border-white/10 pb-4">
            <p class="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Progreso fisico</p>
            <h3 class="mt-3 text-2xl font-semibold text-white">Medidas y energia</h3>
          </div>
          <form id="progress-form" class="mt-5 grid gap-3 md:grid-cols-4">
            <input id="progress-weight" type="number" step="0.1" min="0" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" placeholder="Peso kg" />
            <input id="progress-waist" type="number" step="0.1" min="0" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" placeholder="Cintura cm" />
            <input id="progress-energy" type="number" min="1" max="10" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" placeholder="Energia 1-10" />
            <button type="submit" class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100">Guardar</button>
            <textarea id="progress-note" class="md:col-span-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" rows="2" placeholder="Nota de progreso"></textarea>
          </form>
          <div id="progress-chart" class="mt-5 grid gap-3"></div>
        </div>
      </section>
      <section id="member-notifications-panel" class="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div class="border-b border-white/10 pb-4">
          <p class="text-xs uppercase tracking-[0.28em] text-amber-200/80">Centro de avisos</p>
          <h3 class="mt-3 text-2xl font-semibold text-white">Notificaciones inteligentes</h3>
        </div>
        <div id="member-notifications-list" class="mt-5 grid gap-3"></div>
      </section>
      <section id="member-messages-panel" class="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div class="border-b border-white/10 pb-4">
          <p class="text-xs uppercase tracking-[0.28em] text-violet-200/80">Notas entrenador-miembro</p>
          <h3 class="mt-3 text-2xl font-semibold text-white">Conversacion de seguimiento</h3>
        </div>
        <form id="member-message-form" class="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <select id="member-message-trainer" class="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white"></select>
          <button type="submit" class="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-100">Enviar</button>
          <textarea id="member-message-text" rows="3" class="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white" placeholder="Escribe una pregunta o nota para tu entrenador"></textarea>
        </form>
        <div id="member-messages-list" class="mt-5 grid gap-3"></div>
      </section>
    `,
  );
  $("member-checkin")?.addEventListener("click", () =>
    handleCheckIn().catch((error) => toast(error.message, "error")),
  );
  $("progress-form")?.addEventListener("submit", (event) =>
    handleProgressSubmit(event).catch((error) => toast(error.message, "error")),
  );
  $("member-message-form")?.addEventListener("submit", (event) =>
    handleMemberMessageSubmit(event).catch((error) => toast(error.message, "error")),
  );
}

function renderMemberUpgradePanels() {
  ensureMemberUpgradePanels();
}

function renderAttendancePanel() {
  ensureMemberUpgradePanels();
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = state.attendance.some(
    (item) => new Date(item.checkInAt).toISOString().slice(0, 10) === today,
  );
  $("member-checkin").disabled = checkedToday;
  $("member-checkin").classList.toggle("opacity-50", checkedToday);
  $("member-checkin-status").textContent = checkedToday
    ? "Entrada registrada hoy. Tu racha sigue viva."
    : "Registra tu entrada cuando llegues al gimnasio.";
  $("member-attendance-list").innerHTML =
    state.attendance.slice(0, 5).map((item) => `
      <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
        ${fmtDate(item.checkInAt)} · ${new Date(item.checkInAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
      </div>`).join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">Sin asistencias registradas.</div>`;
}

async function handleCheckIn() {
  await api("/attendance", {
    method: "POST",
    body: JSON.stringify({ user: state.user._id, source: "App" }),
  });
  await api("/notifications", {
    method: "POST",
    body: JSON.stringify({
      role: "Admin",
      title: "Nuevo check-in",
      message: `${state.user.name} registro entrada al gimnasio.`,
      type: "success",
    }),
  }).catch(() => {});
  toast("Entrada registrada correctamente.", "success");
  await loadDashboard();
}

function renderProgressPanel() {
  ensureMemberUpgradePanels();
  const latest = state.progressEntries[0];
  if (latest) {
    $("progress-weight").placeholder = `Ultimo ${latest.weight || "-"} kg`;
    $("progress-waist").placeholder = `Ultimo ${latest.waist || "-"} cm`;
    $("progress-energy").placeholder = `Energia ${latest.energy || "-"}`;
  }
  const maxWeight = Math.max(...state.progressEntries.map((item) => Number(item.weight || 0)), 1);
  $("progress-chart").innerHTML =
    state.progressEntries.slice(0, 6).map((item) => `
      <div class="grid grid-cols-[86px_1fr_70px] items-center gap-3 text-sm text-slate-300">
        <span>${fmtDate(item.entryDate)}</span>
        <div class="h-3 overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full bg-gradient-to-r from-cyan-300 to-lime-300" style="width:${Math.max(8, (Number(item.weight || 0) / maxWeight) * 100)}%"></div>
        </div>
        <span class="text-right">${item.weight || "-"} kg</span>
      </div>`).join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">Guarda tu primera medida para ver evolucion.</div>`;
}

async function handleProgressSubmit(event) {
  event.preventDefault();
  await api("/progress", {
    method: "POST",
    body: JSON.stringify({
      user: state.user._id,
      weight: Number($("progress-weight").value || 0),
      waist: Number($("progress-waist").value || 0),
      energy: Number($("progress-energy").value || 0),
      note: $("progress-note").value.trim(),
    }),
  });
  $("progress-form").reset();
  toast("Progreso guardado.", "success");
  await loadDashboard();
}

function renderMemberNotifications() {
  ensureMemberUpgradePanels();
  const localAlerts = [];
  if (state.activeSubscription) {
    const days = daysLeft(state.activeSubscription);
    if (days <= 7) localAlerts.push(["Membresia por vencer", `Te quedan ${days} dias. Puedes renovar desde planes.`, "warning"]);
  }
  const nextSession = state.sessions
    .filter((session) => new Date(session.date) >= new Date() && session.status !== "Cancelada")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (nextSession) localAlerts.push(["Proxima cita", `${fmtDate(nextSession.date)} a las ${nextSession.hour || "--:--"}.`, "info"]);
  const alerts = [
    ...localAlerts,
    ...state.notifications.slice(0, 5).map((item) => [item.title, item.message, item.type]),
  ];
  $("member-notifications-list").innerHTML =
    alerts.map(([title, message, type]) => `
      <article class="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p class="text-sm font-semibold ${type === "warning" ? "text-amber-100" : "text-cyan-100"}">${title}</p>
        <p class="mt-1 text-sm leading-6 text-slate-400">${message}</p>
      </article>`).join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">Sin avisos por ahora.</div>`;
}

function renderMemberMessages() {
  ensureMemberUpgradePanels();
  const trainerOptions = trainers();
  $("member-message-trainer").innerHTML =
    `<option value="" class="bg-slate-900">Selecciona entrenador</option>` +
    trainerOptions.map((trainer) => `<option value="${trainer._id}" class="bg-slate-900">${trainer.name}</option>`).join("");
  $("member-messages-list").innerHTML =
    state.trainerMessages.slice(0, 8).map((item) => `
      <article class="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-violet-200">${item.author?.name || "Usuario"} · ${fmtDate(item.createdAt)}</p>
        <p class="mt-2 text-sm leading-6 text-slate-200">${item.message}</p>
      </article>`).join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">Aun no hay notas con entrenadores.</div>`;
}

async function handleMemberMessageSubmit(event) {
  event.preventDefault();
  const trainer = $("member-message-trainer").value;
  const message = $("member-message-text").value.trim();
  if (!trainer || !message) {
    toast("Selecciona entrenador y escribe un mensaje.", "error");
    return;
  }
  await api("/trainer-messages", {
    method: "POST",
    body: JSON.stringify({
      trainer,
      member: state.user._id,
      author: state.user._id,
      category: "Pregunta",
      message,
    }),
  });
  $("member-message-form").reset();
  toast("Mensaje enviado.", "success");
  await loadDashboard();
}

// Muestra el generador y la rutina activa del miembro.
function renderRoutine() {
  const hasMembership = Boolean(state.activeSubscription);
  $("routine-generate-button").disabled = !hasMembership;
  $("routine-generate-button").classList.toggle("opacity-50", !hasMembership);
  $("routine-generate-button").classList.toggle("cursor-not-allowed", !hasMembership);
  $("routine-helper").textContent = hasMembership
    ? "Responde unas preguntas y generamos el orden de entrenamiento con series, repeticiones, descanso y video de tecnica."
    : "Activa una membresia para desbloquear el generador de rutinas.";

  const routine = state.currentRoutine;
  $("routine-pill").textContent = routine ? "Rutina activa" : "Pendiente";
  $("routine-summary").textContent = routine
    ? `${routine.answers?.goal || "Objetivo"} · ${(routine.answers?.focuses || []).join(", ")} · ${routine.answers?.daysPerWeek || 3} dias/semana`
    : "Aun no tienes rutina activa.";
  const routineExercises = routine?.exercises?.length
    ? [...routine.exercises]
        .map((exercise, originalIndex) => ({ exercise, originalIndex }))
        .sort(
          (a, b) =>
            Number(a.exercise.order || 0) - Number(b.exercise.order || 0),
        )
    : [];
  const totalRoutinePages = Math.max(
    1,
    Math.ceil(routineExercises.length / state.routinePerPage),
  );
  state.routinePage = Math.min(
    Math.max(1, state.routinePage),
    totalRoutinePages,
  );
  const pageExercises = routineExercises.slice(
    (state.routinePage - 1) * state.routinePerPage,
    state.routinePage * state.routinePerPage,
  );

  $("routine-results").innerHTML =
    routineExercises.length
      ? pageExercises
          .map(({ exercise, originalIndex }, pageIndex) => {
            const index =
              (state.routinePage - 1) * state.routinePerPage + pageIndex;
            const embedUrl = youtubeEmbed(exercise.videoUrl);
            return `
              <article class="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-400/[0.06] lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p class="text-xs uppercase tracking-[0.24em] text-cyan-200">Paso ${index + 1} · ${exercise.focus || "Rutina"}</p>
                  <h4 class="mt-2 text-xl font-semibold text-white">${exercise.name}</h4>
                  <div class="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p class="text-[11px] uppercase tracking-wide text-slate-400">Series</p>
                      <p class="mt-1 text-lg font-semibold text-white">${exercise.sets || 3}</p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p class="text-[11px] uppercase tracking-wide text-slate-400">Reps</p>
                      <p class="mt-1 text-lg font-semibold text-white">${exercise.reps || "10-12"}</p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p class="text-[11px] uppercase tracking-wide text-slate-400">Descanso</p>
                      <p class="mt-1 text-sm font-semibold text-white">${exercise.rest || "60s"}</p>
                    </div>
                  </div>
                  <p class="mt-4 text-sm leading-6 text-slate-300">${exercise.technique || "Ejecuta el movimiento con control y postura estable."}</p>
                  <div class="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-sm font-semibold ${exercise.completed ? "text-emerald-100" : "text-slate-300"}">${exercise.completed ? "Completado" : "Pendiente"}</span>
                      <button data-routine-complete="${originalIndex}" type="button" class="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                        ${exercise.completed ? "Actualizar" : "Marcar hecho"}
                      </button>
                    </div>
                    <p class="mt-2 text-xs leading-5 text-slate-400">
                      ${exercise.weightUsed ? `${exercise.weightUsed} kg` : "Sin peso registrado"} · RPE ${exercise.rpe || "-"} ${exercise.notes ? `· ${exercise.notes}` : ""}
                    </p>
                  </div>
                </div>
                <div class="overflow-hidden rounded-[22px] border border-white/10 bg-black/30">
                  ${
                    embedUrl
                      ? `<iframe class="aspect-video w-full" src="${embedUrl}" title="${exercise.name}" allowfullscreen loading="lazy"></iframe>`
                      : `<div class="grid aspect-video place-items-center px-4 text-center text-sm text-slate-400">Video pendiente de configurar desde admin</div>`
                  }
                </div>
              </article>`;
          })
          .join("")
      : `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Crea tu rutina para ver el paso a paso y los videos.</div>`;
  $("routine-pagination").classList.toggle(
    "hidden",
    routineExercises.length <= state.routinePerPage,
  );
  $("routine-pagination").classList.toggle(
    "flex",
    routineExercises.length > state.routinePerPage,
  );
  $("routine-page-info").textContent =
    `Pagina ${state.routinePage} de ${totalRoutinePages}`;
  $("routine-prev").disabled = state.routinePage === 1;
  $("routine-next").disabled = state.routinePage === totalRoutinePages;
  $("routine-prev").classList.toggle("opacity-50", state.routinePage === 1);
  $("routine-next").classList.toggle(
    "opacity-50",
    state.routinePage === totalRoutinePages,
  );
}

async function updateRoutineExercise(index) {
  if (!state.currentRoutine?._id) return;
  const exercise = state.currentRoutine.exercises[index];
  const weightUsed = prompt("Peso usado en kg:", exercise?.weightUsed || "");
  if (weightUsed === null) return;
  const rpe = prompt("Dificultad percibida RPE 1-10:", exercise?.rpe || "7");
  if (rpe === null) return;
  const notes = prompt("Nota corta del ejercicio:", exercise?.notes || "");
  if (notes === null) return;
  state.currentRoutine = await api(
    `/member-routines/${state.currentRoutine._id}/exercises/${index}`,
    {
      method: "PUT",
      body: JSON.stringify({
        completed: true,
        weightUsed,
        rpe,
        notes,
      }),
    },
  );
  renderRoutine();
  toast("Ejercicio actualizado.", "success");
}

// Genera una rutina personalizada desde las respuestas del formulario.
async function generateRoutine() {
  if (!state.activeSubscription) {
    toast("Necesitas una membresia activa para crear tu rutina.", "error");
    return;
  }
  const focuses = [...$("routine-focuses").querySelectorAll("input:checked")].map(
    (input) => input.value,
  );
  if (!focuses.length) {
    toast("Elige al menos una zona para trabajar.", "error");
    return;
  }

  $("routine-generate-button").textContent = "Generando...";
  const routine = await api("/member-routines/generate", {
    method: "POST",
    body: JSON.stringify({
      user: state.user._id,
      gender: $("routine-gender").value,
      level: $("routine-level").value,
      goal: $("routine-goal").value,
      daysPerWeek: Number($("routine-days").value || 3),
      focuses,
    }),
  });
  state.currentRoutine = routine;
  state.routinePage = 1;
  $("routine-generate-button").textContent = "Crear mi rutina";
  renderRoutine();
  toast("Rutina generada con videos y orden de trabajo.", "success");
}

// Muestra la ficha enviada al entrenador.
function renderTrainerSheet() {
  const sheet = state.user.trainerSheet || {};
  $("sheet-age").value = sheet.age ?? "";
  $("sheet-weight").value = sheet.initialWeight ?? "";
  $("sheet-height").value = sheet.height ?? "";
  $("sheet-availability").value = sheet.availability || "";
  $("sheet-goal").value = sheet.goal || "";
  $("sheet-history").value = sheet.sportHistory || "";
  $("sheet-notes").value = sheet.medicalNotes || "";

  const requiredValues = [
    sheet.age,
    sheet.initialWeight,
    sheet.height,
    sheet.availability,
    sheet.goal,
    sheet.sportHistory,
    sheet.medicalNotes,
  ];
  const completed = requiredValues.filter((value) => String(value || "").trim()).length;
  $("trainer-sheet-pill").textContent =
    completed === requiredValues.length
      ? "Ficha completa"
      : `${completed}/${requiredValues.length} respuestas`;
  $("trainer-sheet-helper").textContent =
    completed === requiredValues.length
      ? "Tu entrenador ya puede revisar tu ficha completa."
      : "Completa la ficha para que tu entrenador tenga contexto antes de aceptar la cita.";
}

// Guarda los datos de la ficha del entrenador.
async function handleTrainerSheetSubmit(event) {
  event.preventDefault();
  const numberOrNull = (value) => {
    const normalized = value.trim();
    return normalized ? Number(normalized) : null;
  };
  const payload = {
    trainerSheet: {
      age: numberOrNull($("sheet-age").value),
      initialWeight: numberOrNull($("sheet-weight").value),
      height: numberOrNull($("sheet-height").value),
      availability: $("sheet-availability").value.trim(),
      goal: $("sheet-goal").value.trim(),
      sportHistory: $("sheet-history").value.trim(),
      medicalNotes: $("sheet-notes").value.trim(),
    },
  };

  const updatedUser = await api(`/users/${state.user._id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  state.user = updatedUser;
  localStorage.setItem("user", JSON.stringify(updatedUser));
  renderTrainerSheet();
  toast("Ficha guardada para tu entrenador.", "success");
}

// Renderiza estado de membresia actual.
function renderMembershipStatus() {
  const subscription = state.activeSubscription;
  const plan = subscription?.membership;
  const remaining = daysLeft(subscription);

  $("membership-status-value").textContent = subscription ? "Activa" : "Sin plan";
  $("membership-status-caption").textContent = subscription
    ? `Tu plan vence el ${fmtDate(subscription.endDate)}`
    : "Compra una membresia para comenzar";
  $("membership-days-left").textContent = remaining;
  $("membership-days-caption").textContent = subscription
    ? `${remaining} dias disponibles`
    : "Aun no tienes una suscripcion activa";
  $("membership-badge").textContent = subscription ? "Suscripcion activa" : "Sin suscripcion";
  $("current-membership-name").textContent = plan?.name || "Sin membresia";
  $("current-membership-range").textContent = subscription
    ? `${fmtDate(subscription.startDate)} - ${fmtDate(subscription.endDate)}`
    : "Sin fechas";
  $("current-membership-price").textContent = money(plan?.price || 0);
  $("membership-alert").textContent = subscription
    ? `Estas usando el plan ${plan?.name || "activo"}. Puedes comprar otro plan cuando quieras renovar.`
    : "Todavia no tienes una membresia activa. Elige un plan para empezar.";
  $("member-status-pill").textContent = subscription ? "Membresia activa" : "Requiere membresia";
  $("cancel-membership").classList.toggle("hidden", !subscription);
}

// Renderiza historial de suscripciones.
function renderSubscriptionsHistory() {
  $("subscriptions-history").innerHTML =
    state.subscriptions
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .map(
        (sub) => {
          const payment = paymentForSubscription(sub);
          return `
        <div class="responsive-row grid grid-cols-[1fr_1fr_0.7fr_0.7fr] gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.04]">
          <span data-label="Plan">${sub.membership?.name || "Membresia"}</span>
          <span data-label="Vigencia">${fmtDate(sub.startDate)} - ${fmtDate(sub.endDate)}</span>
          <span data-label="Estado">
            ${sub.status}
            ${
              sub.cancelReason
                ? `<span class="mt-1 block text-xs leading-5 text-slate-400">Motivo: ${sub.cancelReason}</span>`
                : ""
            }
          </span>
          <span data-label="Factura">
            <button data-invoice="${sub._id}" class="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
              Ver factura
            </button>
            ${payment ? `<span class="mt-1 block text-xs text-slate-500">${money(payment.amount)}</span>` : ""}
          </span>
        </div>`;
        },
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Aun no has comprado membresias</div>`;
}

// Cancela la membresia activa con motivo.
async function cancelMembership() {
  const subscription = state.activeSubscription;
  if (!subscription) {
    toast("No tienes una membresia activa para cancelar.", "info");
    return;
  }
  const reason = prompt("Escribe el motivo de cancelacion de la membresia:");
  if (reason === null) return;
  const cleanReason = reason.trim();
  if (!cleanReason) {
    toast("Debes escribir un motivo para cancelar la membresia.", "error");
    return;
  }

  await api(`/subscriptions/${subscription._id}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "Cancelada",
      cancelReason: cleanReason,
    }),
  });
  toast("Membresia cancelada con motivo registrado.", "success");
  await loadDashboard();
}

// Renderiza planes disponibles para compra.
function renderPlans() {
  const activePlans = state.memberships.filter((plan) => plan.isActive);
  $("plans-counter").textContent = `${activePlans.length} planes activos`;
  $("memberships-grid").innerHTML =
    activePlans
      .map(
        (plan) => `
        <article class="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p class="text-xs uppercase tracking-[0.22em] text-sky-200">${plan.category || "General"}</p>
          <h4 class="mt-3 text-2xl font-semibold text-white">${plan.name}</h4>
          <p class="mt-3 text-3xl font-semibold text-white">${money(plan.price)}</p>
          <p class="mt-2 text-sm text-slate-300">${plan.durationInDays} dias de acceso</p>
          <p class="mt-4 text-sm leading-6 text-slate-300">${plan.description || "Plan disponible para tu entrenamiento."}</p>
          <ul class="mt-4 space-y-2 text-sm text-slate-300">
            ${(plan.benefits || []).slice(0, 4).map((benefit) => `<li>${benefit}</li>`).join("")}
          </ul>
          <button data-buy-plan="${plan._id}" class="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
            Comprar plan
          </button>
        </article>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">No hay membresias activas disponibles</div>`;
}

// Compra un plan y crea el pago.
async function buyPlan(planId) {
  const plan = state.memberships.find((item) => item._id === planId);
  if (!plan) return;
  const activeSubscription = getActiveSubscription();
  if (activeSubscription) {
    toast(
      "Ya tienes una membresia activa. Para comprar otra, cancela primero la membresia actual.",
      "error",
    );
    return;
  }
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + Number(plan.durationInDays || 1));

  const methodChoice = prompt(
    "Metodo de pago simulado: 1 Tarjeta aprobada, 2 Mercado Pago aprobado, 3 Transferencia pendiente",
    "1",
  );
  if (methodChoice === null) return;
  const methodMap = { 1: "Tarjeta", 2: "Mercado Pago", 3: "Transferencia" };
  const method = methodMap[methodChoice.trim()] || "Tarjeta";
  const status = method === "Transferencia" ? "Pendiente" : "Pagado";
  const payment = await api("/payments", {
    method: "POST",
    body: JSON.stringify({
      user: state.user._id,
      membership: plan._id,
      amount: plan.price,
      method,
      status,
      paymentDate: new Date(),
      providerReference: `SIM-${Date.now()}`,
      checkoutUrl: `https://checkout.gym-system.local/${plan._id}`,
    }),
  });

  if (status === "Pagado") {
    await api("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        user: state.user._id,
        membership: plan._id,
        startDate,
        endDate,
        status: "Activa",
      }),
    });
  }
  await api("/notifications", {
    method: "POST",
    body: JSON.stringify({
      role: "Admin",
      title: status === "Pagado" ? "Pago aprobado" : "Pago pendiente",
      message: `${state.user.name} inicio checkout ${payment.providerReference || ""} por ${plan.name}.`,
      type: status === "Pagado" ? "success" : "warning",
    }),
  }).catch(() => {});

  toast(
    status === "Pagado"
      ? `Compraste ${plan.name}.`
      : `Checkout generado para ${plan.name}. Queda pendiente de confirmacion.`,
    status === "Pagado" ? "success" : "info",
  );
  await loadDashboard();
}

// Renderiza entrenadores disponibles.
function renderTrainers() {
  const available = trainers();
  $("available-trainers-count").textContent = available.length;
  $("available-trainers-caption").textContent =
    available.length === 1 ? "Entrenador disponible" : "Entrenadores disponibles";
  $("trainer-helper-pill").textContent =
    available.length > 0 ? "Elige un entrenador" : "Sin entrenadores";
  $("trainers-grid").innerHTML =
    available
      .map(
        (trainer) => `
        <article class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 class="text-xl font-semibold text-white">${trainer.name}</h4>
          <p class="mt-2 text-sm text-slate-400">${trainer.email}</p>
          <p class="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">${trainer.profile?.specialty || "Entrenamiento general"}</p>
        </article>`,
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">No hay entrenadores disponibles todavia</div>`;
}

// Prepara opciones del formulario de reserva.
function renderBookingForm() {
  const available = trainers();
  $("booking-trainer").innerHTML =
    `<option value="" class="bg-slate-900">Selecciona un entrenador</option>` +
    available
      .map(
        (trainer) =>
          `<option value="${trainer._id}" class="bg-slate-900">${trainer.name}</option>`,
      )
      .join("");

  $("booking-hour").innerHTML =
    `<option value="" class="bg-slate-900">Selecciona una hora</option>` +
    ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00", "20:00"]
      .map((hour) => `<option value="${hour}" class="bg-slate-900">${hour}</option>`)
      .join("");

  const minDate = new Date().toISOString().slice(0, 10);
  $("booking-date").min = minDate;
  $("booking-membership-pill").textContent = state.activeSubscription
    ? "Listo para reservar"
    : "Requiere membresia activa";
  $("booking-helper").textContent = state.activeSubscription
    ? "Elige entrenador, fecha y hora para reservar."
    : "Compra una membresia activa antes de reservar sesiones.";
}

// Crea una solicitud de cita con entrenador.
async function handleBooking(event) {
  event.preventDefault();
  if (!state.activeSubscription) {
    toast("Necesitas una membresia activa para reservar.", "error");
    return;
  }

  const trainer = $("booking-trainer").value;
  const date = $("booking-date").value;
  const hour = $("booking-hour").value;
  if (!trainer || !date || !hour) {
    toast("Completa entrenador, fecha y hora.", "error");
    return;
  }

  const hasConflict = state.allSessions.some(
    (session) =>
      getId(session.trainer) === trainer &&
      new Date(session.date).toISOString().slice(0, 10) === date &&
      session.hour === hour &&
      session.status !== "Cancelada",
  );
  if (hasConflict) {
    toast("Ya tienes una reserva con ese entrenador en esa fecha y hora.", "error");
    return;
  }

  await api("/training-sessions", {
    method: "POST",
    body: JSON.stringify({
      trainer,
      member: state.user._id,
      date,
      hour,
      status: "Pendiente",
    }),
  });

  $("booking-form").reset();
  toast("Solicitud enviada al entrenador.", "success");
  await loadDashboard();
}

// Renderiza citas con paginacion.
function renderSessions() {
  const perPage = 3;
  const confirmed = state.sessions.filter((session) => session.status === "Confirmada");
  const pending = state.sessions.filter((session) => session.status === "Pendiente");
  const cancelled = state.sessions.filter((session) => session.status === "Cancelada");
  const next = state.sessions
    .filter(
      (session) =>
        new Date(session.date) >= new Date() && session.status !== "Cancelada",
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  $("sessions-summary-pill").textContent = `${state.sessions.length} sesiones`;
  $("clear-sessions-history").disabled = cancelled.length === 0;
  $("clear-sessions-history").classList.toggle("opacity-50", cancelled.length === 0);
  $("clear-sessions-history").classList.toggle("cursor-not-allowed", cancelled.length === 0);
  $("confirmed-sessions-count").textContent = confirmed.length;
  $("pending-sessions-count").textContent = pending.length;
  $("next-session-date").textContent = next ? fmtDate(next.date) : "Sin agenda";
  $("next-session-caption").textContent = next
    ? `${next.trainer?.name || "Entrenador"} a las ${next.hour || "--:--"}`
    : "Agenda una sesion con tu entrenador";
  const orderedSessions = [...state.sessions].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const totalPages = Math.max(1, Math.ceil(orderedSessions.length / perPage));
  state.sessionsPage = Math.min(Math.max(1, state.sessionsPage), totalPages);
  const pageSessions = orderedSessions.slice(
    (state.sessionsPage - 1) * perPage,
    state.sessionsPage * perPage,
  );

  $("member-sessions-list").innerHTML =
    pageSessions
      .map(
        (session) => {
          const canCancel = session.status !== "Cancelada";
          return `
        <div class="responsive-row grid items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.04]" style="grid-template-columns: 1fr 0.9fr 0.85fr 0.75fr">
          <span data-label="Entrenador">${session.trainer?.name || "Entrenador"}</span>
          <span data-label="Fecha">${fmtDate(session.date)} ${session.hour || ""}</span>
          <span data-label="Estado">
            ${session.status}
            ${
              session.cancelReason
                ? `<span class="mt-1 block text-xs leading-5 text-slate-400">Motivo: ${session.cancelReason}</span>`
                : ""
            }
          </span>
          <span data-label="Accion">
            ${
              canCancel
                ? `<button data-cancel-session="${session._id}" class="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-400/20">Cancelar</button>`
                : `<span class="text-xs text-slate-500">Sin acciones</span>`
            }
          </span>
        </div>`;
        },
      )
      .join("") ||
    `<div class="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">Todavia no tienes citas reservadas</div>`;

  $("sessions-pagination").classList.toggle("hidden", orderedSessions.length <= perPage);
  $("sessions-pagination").classList.toggle("flex", orderedSessions.length > perPage);
  $("sessions-page-info").textContent =
    `Pagina ${state.sessionsPage} de ${totalPages}`;
  $("sessions-prev").disabled = state.sessionsPage === 1;
  $("sessions-next").disabled = state.sessionsPage === totalPages;
  $("sessions-prev").classList.toggle("opacity-50", state.sessionsPage === 1);
  $("sessions-next").classList.toggle("opacity-50", state.sessionsPage === totalPages);
}

// Cancela una cita con motivo.
async function cancelSession(id) {
  const reason = prompt("Escribe el motivo de cancelacion de la cita:");
  if (reason === null) return;
  const cleanReason = reason.trim();
  if (!cleanReason) {
    toast("Debes escribir un motivo para cancelar.", "error");
    return;
  }

  await api(`/training-sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "Cancelada",
      cancelReason: cleanReason,
    }),
  });
  toast("Cita cancelada con motivo registrado.", "success");
  await loadDashboard();
}

// Elimina del historial las citas canceladas.
async function clearSessionsHistory() {
  const cancelled = state.sessions.filter((session) => session.status === "Cancelada");
  if (!cancelled.length) {
    toast("No hay historial cancelado para limpiar.", "info");
    return;
  }
  if (!confirm(`Eliminar ${cancelled.length} cita(s) cancelada(s) del historial?`)) {
    return;
  }

  await Promise.all(
    cancelled.map((session) => api(`/training-sessions/${session._id}`, { method: "DELETE" })),
  );
  state.sessionsPage = 1;
  toast("Historial de citas canceladas limpiado.", "success");
  await loadDashboard();
}

// Conecta formularios y botones.
function bindEvents() {
  $("member-logout").addEventListener("click", logout);
  $("invoice-close").addEventListener("click", () => toggleInvoiceModal(false));
  $("invoice-modal").addEventListener("click", (event) => {
    if (event.target.id === "invoice-modal") toggleInvoiceModal(false);
  });
  $("invoice-pdf").addEventListener("click", downloadInvoicePdf);
  $("invoice-print").addEventListener("click", prepareInvoiceOutput);
  $("routine-generate-button").addEventListener("click", () =>
    generateRoutine()
      .catch((error) => toast(error.message, "error"))
      .finally(() => {
        $("routine-generate-button").textContent = "Crear mi rutina";
      }),
  );
  $("cancel-membership").addEventListener("click", () =>
    cancelMembership().catch((error) => toast(error.message, "error")),
  );
  $("clear-sessions-history").addEventListener("click", () =>
    clearSessionsHistory().catch((error) => toast(error.message, "error")),
  );
  $("sessions-prev").addEventListener("click", () => {
    state.sessionsPage -= 1;
    renderSessions();
  });
  $("sessions-next").addEventListener("click", () => {
    state.sessionsPage += 1;
    renderSessions();
  });
  $("trainer-sheet-form").addEventListener("submit", (event) =>
    handleTrainerSheetSubmit(event).catch((error) =>
      toast(error.message, "error"),
    ),
  );
  $("member-checkin")?.addEventListener("click", () =>
    handleCheckIn().catch((error) => toast(error.message, "error")),
  );
  $("progress-form")?.addEventListener("submit", (event) =>
    handleProgressSubmit(event).catch((error) => toast(error.message, "error")),
  );
  $("member-message-form")?.addEventListener("submit", (event) =>
    handleMemberMessageSubmit(event).catch((error) => toast(error.message, "error")),
  );
  $("booking-form").addEventListener("submit", (event) =>
    handleBooking(event).catch((error) => toast(error.message, "error")),
  );
  document.addEventListener("click", (event) => {
    const buyButton = event.target.closest("[data-buy-plan]");
    const cancelButton = event.target.closest("[data-cancel-session]");
    const invoiceButton = event.target.closest("[data-invoice]");
    const routineButton = event.target.closest("[data-routine-complete]");
    const routinePrev = event.target.closest("[data-routine-prev]");
    const routineNext = event.target.closest("[data-routine-next]");
    if (buyButton) {
      buyPlan(buyButton.dataset.buyPlan).catch((error) =>
        toast(error.message, "error"),
      );
    }
    if (invoiceButton) {
      showInvoice(invoiceButton.dataset.invoice);
    }
    if (routineButton) {
      updateRoutineExercise(Number(routineButton.dataset.routineComplete)).catch((error) =>
        toast(error.message, "error"),
      );
    }
    if (routinePrev) {
      state.routinePage = Math.max(1, state.routinePage - 1);
      renderRoutine();
    }
    if (routineNext) {
      state.routinePage += 1;
      renderRoutine();
    }
    if (cancelButton) {
      cancelSession(cancelButton.dataset.cancelSession).catch((error) =>
        toast(error.message, "error"),
      );
    }
  });
}

// Inicializa el panel del miembro.
async function init() {
  injectDashboardStyles();
  if (!requireMember()) return;
  bindEvents();
  document.body.classList.add("dashboard-ready");
  try {
    await loadDashboard();
    toast("Dashboard de miembro actualizado.", "success");
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

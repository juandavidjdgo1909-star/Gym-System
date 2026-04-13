const API_BASE_URL = "http://localhost:3000/api";

const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("login-password");

const registerNameInput = document.getElementById("register-name");
const registerEmailInput = document.getElementById("register-email");
const registerPhoneInput = document.getElementById("register-phone");
const registerDocumentInput = document.getElementById("register-document");
const registerPasswordInput = document.getElementById("register-password");

const planCountElement = document.getElementById("plan-count");

let membershipUpdateInterval = null;

/**
 * Muestra un mensaje de notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning'
 */
function showNotification(message, type = "info") {
  alert(message);
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que la contraseña tenga al menos 6 caracteres
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
function isValidPassword(password) {
  return password.length >= 6;
}

/**
 * Desactiva un elemento (botón o input)
 * @param {HTMLElement} element - Elemento a desactivar
 * @param {boolean} disabled - true para desactivar, false para activar
 */
function setElementDisabled(element, disabled) {
  if (element) {
    element.disabled = disabled;
    element.style.opacity = disabled ? "0.5" : "1";
    element.style.cursor = disabled ? "not-allowed" : "pointer";
  }
}

/**
 * Maneja el login del usuario
 * @param {Event}  - Evento del formulario
 */
async function handleLogin(e) {
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    showNotification("Por favor completa todos los campos", "warning");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Por favor ingresa un email válido", "warning");
    return;
  }

  if (!isValidPassword(password)) {
    showNotification(
      "La contraseña debe tener al menos 6 caracteres",
      "warning",
    );
    return;
  }

  try {
    const submitBtn =
      loginForm.querySelector("button[type='submit']") ||
      loginForm.querySelector("button");
    setElementDisabled(submitBtn, true);
    submitBtn.textContent = "Accediendo...";

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al iniciar sesión");
    }

    const users = await response.json();

    const user = users.find((u) => u.email === email);

    if (!user) {
      showNotification("Email o contraseña incorrectos", "error");
      setElementDisabled(submitBtn, false);
      submitBtn.textContent = "Acceder";
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    showNotification("¡Bienvenido! Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Error en login:", error);
    showNotification(error.message || "Error al iniciar sesión", "error");

    const submitBtn =
      loginForm.querySelector("button[type='submit']") ||
      loginForm.querySelector("button");
    setElementDisabled(submitBtn, false);
    submitBtn.textContent = "Acceder";
  }
}

/**
 * Maneja el registro de un nuevo usuario
 * @param {Event} e - Evento del formulario
 */

async function handleRegister(e) {
  e.preventDefault();

  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();
  const phone = registerPhoneInput.value.trim();
  const document = registerDocumentInput.value.trim();
  const password = registerPasswordInput.value.trim();

  if (!name || !email || !phone || !document || !password) {
    showNotification("Por favor completa todos los campos", "warning");
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Por favor ingresa un email válido", "warning");
    return;
  }

  if (!isValidPassword(password)) {
    showNotification(
      "La contraseña debe tener al menos 6 caracteres",
      "warning",
    );
    return;
  }

  try {
    const submitBtn =
      registerForm.querySelector("button[type='submit']") ||
      registerForm.querySelector("button");
    setElementDisabled(submitBtn, true);
    submitBtn.textContent = "Creando cuenta...";

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        document,
        password,
        role: "member",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear cuenta");
    }

    const newUser = await response.json();

    showNotification(
      "¡Cuenta creada exitosamente! Redirigiendo al login...",
      "success",
    );

    registerForm.reset();
    setTimeout(() => {
      switchToLogin();
    }, 1500);
  } catch (error) {
    console.error("Error en registro:", error);
    showNotification(error.message || "Error al crear la cuenta", "error");

    const submitBtn =
      registerForm.querySelector("button[type='submit']") ||
      registerForm.querySelector("button");
    setElementDisabled(submitBtn, false);
    submitBtn.textContent = "Crear cuenta";
  }
}

/**
 * Carga el conteo de membresías disponibles
 */
async function loadMembershipCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/memberships`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener membresías");
    }

    const memberships = await response.json();
    const newCount = memberships.length || 0;

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
  } catch (error) {
    console.error("Error al cargar membresías:", error);
    if (planCountElement) {
      planCountElement.textContent = "0";
    }
  }
}

function startMembershipRealTimeUpdate() {
  loadMembershipCount();

  membershipUpdateInterval = setInterval(() => {
    loadMembershipCount();
  }, 5000);

  console.log("Actualización en tiempo real iniciada (cada 5 segundos)");
}

function stopMembershipRealTimeUpdate() {
  if (membershipUpdateInterval) {
    clearInterval(membershipUpdateInterval);
    membershipUpdateInterval = null;
    console.log("Actualización en tiempo real detenida");
  }
}
/**
 * Cambia la vista al formulario de login
 */
function switchToLogin() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  btnLogin.classList.add("bg-white", "text-slate-950");
  btnLogin.classList.remove("text-slate-300");

  btnRegister.classList.add("text-slate-300");
  btnRegister.classList.remove("bg-white", "text-slate-950");

  registerForm.reset();
}

/**
 * Cambia la vista al formulario de registro
 */
function switchToRegister() {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");

  btnRegister.classList.add("bg-white", "text-slate-950");
  btnRegister.classList.remove("text-slate-300");

  btnLogin.classList.add("text-slate-300");
  btnLogin.classList.remove("bg-white", "text-slate-950");

  loginForm.reset();
}

loginForm.reset();

btnLogin.addEventListener("click", switchToLogin);
btnRegister.addEventListener("click", switchToRegister);

// Envío de formularios
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

function initializeApp() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    window.location.href = "./dashboard.html";
    return;
  }

  // Establecer login como activo por defecto
  switchToLogin();

  startMembershipRealTimeUpdate();

  window.addEventListener("beforeunload", stopMembershipRealTimeUpdate);

  console.log("Aplicación Gym-System inicializada");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

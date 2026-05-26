// Activa el menu lateral en celulares y tablets.
function initResponsiveMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const sidebar = document.querySelector(".dashboard-sidebar");
  if (!toggle || !sidebar) return;
  const actionLabel = toggle.querySelector("span:last-child");

  const syncLabel = () => {
    const isOpen = document.body.classList.contains("mobile-menu-open");
    if (actionLabel) actionLabel.textContent = isOpen ? "Cerrar" : "Menu";
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("mobile-menu-open");
    syncLabel();
  });

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      document.body.classList.remove("mobile-menu-open");
      syncLabel();
    }
  });

  syncLabel();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initResponsiveMenu);
} else {
  initResponsiveMenu();
}

// ===== NAVIGATION: mobile menu toggle, dropdown, and active link =====

document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".main-nav a:not(.dropdown-toggle)").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mainNav && mainNav.classList.contains("open")) {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.querySelectorAll(".dropdown-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      if (window.innerWidth <= 768) {
        event.preventDefault();
        this.parentElement.classList.toggle("open");
      }
    });
  });

  var currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    var linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) link.classList.add("active");
  });
});
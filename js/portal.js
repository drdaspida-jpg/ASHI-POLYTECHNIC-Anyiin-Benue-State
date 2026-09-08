// ===== PORTAL UI HELPERS =====
// Authentication is handled by js/auth.js using Supabase Auth.
document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var selectedPortal = params.get("portal");
  var portalMap = {
    student: "studentLoginForm",
    applicant: "applicantLoginForm",
    staff: "staffLoginForm"
  };

  var allForms = document.querySelectorAll(".portal-login-form");
  var activePortal = selectedPortal && portalMap[selectedPortal] ? portalMap[selectedPortal] : "studentLoginForm";
  allForms.forEach(function (form) {
    form.classList.toggle("active", form.id === activePortal);
  });

  var selectedForm = document.getElementById(activePortal);
  if (selectedForm) {
    selectedForm.scrollIntoView({ behavior: "smooth", block: "center" });
    var firstInput = selectedForm.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  document.querySelectorAll(".portal-password-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var targetId = button.getAttribute("data-target");
      var input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
      } else {
        input.type = "password";
        button.textContent = "Show";
      }
    });
  });

  document.querySelectorAll(".logout-btn").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      var filename = window.location.pathname.split("/").pop();
      var fallback = {
        "student-portal.html": "student-login.html",
        "applicant-portal.html": "applicant-login.html",
        "staff-portal.html": "staff-login.html"
      }[filename] || "student-login.html";

      if (!window.ashiSupabase) {
        window.location.href = fallback;
        return;
      }

      window.ashiSupabase.auth.signOut().finally(function () {
        window.location.href = fallback;
      });
    });
  });
});

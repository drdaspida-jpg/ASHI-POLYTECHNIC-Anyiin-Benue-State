// ===== PORTAL / LOGIN LOGIC (front-end demo only — no real backend) =====
// Replace this simulated logic with real authentication (PHP/Node/Firebase/etc.)

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

  function handleLogin(formId, redirectUrl, roleLabel) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var idInput = form.querySelector('input[name="loginId"]');
      var passInput = form.querySelector('input[name="password"]');
      var errorBox = form.querySelector(".login-error");

      if (!idInput.value.trim() || !passInput.value.trim()) {
        if (errorBox) {
          errorBox.style.display = "block";
          errorBox.textContent = "Please enter both your ID and password.";
        }
        return;
      }

      if (errorBox) errorBox.style.display = "none";
      var welcomeBox = document.getElementById("loginStatus");
      if (welcomeBox) {
        welcomeBox.style.display = "block";
        welcomeBox.innerHTML = "Welcome, <strong>" + idInput.value.trim() + "</strong> (" + roleLabel + "). Redirecting to your portal...";
      }
      setTimeout(function () {
        window.location.href = redirectUrl;
      }, 500);
      form.reset();
    });
  }

  function setFormStatus(element, message) {
    if (!element) return;
    element.classList.add("active");
    element.textContent = message;
  }

  function setPasswordToggle(button) {
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
  }

  function validateSignup(formId, redirectUrl) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var statusBox = document.getElementById(formId.replace("Form", "Status"));
      var fields = form.querySelectorAll("input, select");
      var valid = true;
      var firstInvalid = null;

      fields.forEach(function (field) {
        if (!field.required) return;
        if (field.tagName === "SELECT" && !field.value.trim()) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
          field.style.borderColor = "#d62828";
          return;
        }
        if (field.type !== "checkbox" && !field.value.trim()) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
          field.style.borderColor = "#d62828";
          return;
        }

        field.style.borderColor = "";

        if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
          field.style.borderColor = "#d62828";
        }

        if (field.name === "phone" && !/^[0-9]{10,15}$/.test(field.value.replace(/\D/g, ""))) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
          field.style.borderColor = "#d62828";
        }

        if (field.name === "password" && field.value.length < 8) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
          field.style.borderColor = "#d62828";
        }

        if (field.name === "confirmPassword") {
          var passwordField = form.querySelector('input[name="password"]');
          if (passwordField && field.value !== passwordField.value) {
            valid = false;
            if (!firstInvalid) firstInvalid = field;
            field.style.borderColor = "#d62828";
          }
        }
      });

      if (!valid) {
        if (statusBox) {
          setFormStatus(statusBox, "Please complete all fields correctly before continuing.");
          statusBox.style.borderColor = "#d62828";
          statusBox.style.background = "#fff0f0";
          statusBox.style.color = "#c62828";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (statusBox) {
        statusBox.style.borderColor = "rgba(11, 110, 44, 0.2)";
        statusBox.style.background = "#eaf7ee";
        statusBox.style.color = "#0b6e2c";
        setFormStatus(statusBox, "Account created successfully. Redirecting you to the login page...");
      }

      setTimeout(function () {
        window.location.href = redirectUrl;
      }, 1200);
    });
  }

  document.querySelectorAll(".portal-password-toggle").forEach(setPasswordToggle);

  handleLogin("studentLoginForm", "student-portal.html", "Student");
  handleLogin("applicantLoginForm", "applicant-portal.html", "Applicant");
  handleLogin("staffLoginForm", "staff-portal.html", "Staff");
  validateSignup("applicantSignupForm", "applicant-login.html");
  validateSignup("staffSignupForm", "staff-login.html");

  // Generic logout button used across all portal pages
  document.querySelectorAll(".logout-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var redirectMap = {
        "student-portal.html": "student-login.html",
        "applicant-portal.html": "applicant-login.html",
        "staff-portal.html": "staff-login.html"
      };
      var filename = window.location.pathname.split("/").pop();
      window.location.href = redirectMap[filename] || "student-login.html";
    });
  });
});
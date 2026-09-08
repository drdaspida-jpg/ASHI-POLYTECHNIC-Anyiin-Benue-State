// ===== PORTAL UI + AUTHENTICATED SESSION GUARDS =====
// Supabase Auth is the source of truth for portal access.
(function () {
  function waitForSupabase(callback) {
    if (window.ashiSupabase) return callback(window.ashiSupabase);
    window.addEventListener("ashi:supabase-ready", function () {
      callback(window.ashiSupabase);
    }, { once: true });
  }

  function currentPortal() {
    return window.location.pathname.split("/").pop();
  }

  function portalConfig() {
    var configs = {
      "applicant-portal.html": { type: "applicant", login: "applicant-login.html", table: "applicants", nameSelector: ".portal-profile-name", welcomeSelector: ".portal-panel h2" },
      "student-portal.html": { type: "student", login: "student-login.html", table: "students", nameSelector: ".portal-profile-name", welcomeSelector: ".portal-panel h2" },
      "staff-portal.html": { type: "staff", login: "staff-login.html", table: "staff", nameSelector: ".portal-profile-name", welcomeSelector: ".portal-panel h2" }
    };
    return configs[currentPortal()] || null;
  }

  async function guardPortal(supabase, config) {
    var sessionResult = await supabase.auth.getSession();
    if (sessionResult.error || !sessionResult.data || !sessionResult.data.session) {
      window.location.href = config.login;
      return null;
    }

    var user = sessionResult.data.session.user;
    var accountType = user.user_metadata && user.user_metadata.account_type;
    if (accountType && accountType !== config.type) {
      await supabase.auth.signOut();
      window.location.href = config.login;
      return null;
    }

    var profile = null;
    var profileResult = await supabase
      .from(config.table)
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!profileResult.error) profile = profileResult.data;

    var displayName = (profile && (profile.full_name || profile.name)) ||
      (user.user_metadata && user.user_metadata.full_name) ||
      user.email || "Portal User";

    var nameElement = document.querySelector(config.nameSelector);
    if (nameElement) nameElement.textContent = displayName;

    var welcomeElement = document.querySelector(config.welcomeSelector);
    if (welcomeElement) {
      if (config.type === "applicant") welcomeElement.textContent = "Welcome, " + displayName;
      if (config.type === "student") welcomeElement.textContent = "Welcome back, " + displayName;
      if (config.type === "staff") welcomeElement.textContent = "Welcome, " + displayName;
    }

    var meta = document.querySelector(".portal-profile-meta");
    if (meta) meta.textContent = user.email || "Authenticated account";

    return user;
  }

  function setupLogout(supabase) {
    document.querySelectorAll(".logout-btn").forEach(function (btn) {
      btn.addEventListener("click", async function (event) {
        event.preventDefault();
        btn.disabled = true;
        btn.textContent = "Signing out...";
        var filename = currentPortal();
        var fallback = {
          "student-portal.html": "student-login.html",
          "applicant-portal.html": "applicant-login.html",
          "staff-portal.html": "staff-login.html"
        }[filename] || "../index.html";
        await supabase.auth.signOut();
        window.location.href = fallback;
      });
    });
  }

  function setupLoginFormSwitcher() {
    // Only run the login-form switcher on pages that actually contain login forms.
    // Applicant sign-up also uses .portal-login-form, so blindly applying the old
    // default (studentLoginForm) was hiding the entire sign-up form.
    var portalMap = {
      student: "studentLoginForm",
      applicant: "applicantLoginForm",
      staff: "staffLoginForm"
    };
    var allForms = document.querySelectorAll(".portal-login-form");
    if (!allForms.length || !document.getElementById("studentLoginForm") &&
        !document.getElementById("applicantLoginForm") && !document.getElementById("staffLoginForm")) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var selectedPortal = params.get("portal");
    var activePortal = selectedPortal && portalMap[selectedPortal]
      ? portalMap[selectedPortal]
      : (document.getElementById("studentLoginForm") ? "studentLoginForm" : null);

    if (!activePortal) return;

    allForms.forEach(function (form) {
      form.classList.toggle("active", form.id === activePortal);
    });

    var selectedForm = document.getElementById(activePortal);
    if (selectedForm) {
      selectedForm.scrollIntoView({ behavior: "smooth", block: "center" });
      var firstInput = selectedForm.querySelector("input");
      if (firstInput) firstInput.focus();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupLoginFormSwitcher();

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

    var config = portalConfig();
    if (config) {
      waitForSupabase(function (supabase) {
        guardPortal(supabase, config).then(function () {
          setupLogout(supabase);
        }).catch(function () {
          window.location.href = config.login;
        });
      });
    }
  });
})();

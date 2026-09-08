/* Ashi Polytechnic — Supabase authentication */
(function () {
  function waitForSupabase(callback) {
    if (window.ashiSupabase) return callback(window.ashiSupabase);
    window.addEventListener("ashi:supabase-ready", function () {
      callback(window.ashiSupabase);
    }, { once: true });
  }

  function statusBox(form, message, type) {
    var box = form && form.querySelector(".portal-form-status, .login-error");
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
    box.classList.remove("success", "error");
    box.classList.add(type || "error");
  }

  function friendlyError(error) {
    var message = error && error.message ? error.message : "Something went wrong. Please try again.";
    if (/invalid login credentials/i.test(message)) return "Incorrect email or password.";
    if (/email not confirmed/i.test(message)) return "Please confirm your email address before logging in.";
    if (/user already registered/i.test(message)) return "An account already exists with this email. Please log in instead.";
    return message;
  }

  function setBusy(form, busy, text) {
    var button = form && form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = text || "Please wait...";
    } else {
      button.textContent = button.dataset.originalText || "Submit";
    }
  }

  async function signupApplicant(form, supabase) {
    var name = form.querySelector('[name="fullName"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim().toLowerCase();
    var phone = form.querySelector('[name="phone"]').value.trim();
    var programme = form.querySelector('[name="programme"]').value.trim();
    var password = form.querySelector('[name="password"]').value;
    var confirm = form.querySelector('[name="confirmPassword"]').value;

    if (!name || !email || !phone || !programme || password.length < 8 || password !== confirm) {
      statusBox(form, password.length < 8 ? "Password must be at least 8 characters." : "Please complete all fields correctly and make sure the passwords match.", "error");
      return;
    }

    setBusy(form, true, "Creating account...");
    var result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone: phone,
          programme: programme,
          account_type: "applicant"
        }
      }
    });

    if (result.error) {
      statusBox(form, friendlyError(result.error), "error");
      setBusy(form, false);
      return;
    }

    statusBox(form, "Account created. Check your email to confirm your account, then log in.", "success");
    form.reset();
    setBusy(form, false);
  }

  async function login(form, destination, expectedType, supabase) {
    var email = form.querySelector('[name="loginId"]').value.trim().toLowerCase();
    var password = form.querySelector('[name="password"]').value;
    if (!email || !password) {
      statusBox(form, "Please enter both your email and password.", "error");
      return;
    }

    setBusy(form, true, "Signing in...");
    var result = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (result.error) {
      statusBox(form, friendlyError(result.error), "error");
      setBusy(form, false);
      return;
    }

    var user = result.data && result.data.user;
    var accountType = user && user.user_metadata ? user.user_metadata.account_type : null;

    if (expectedType && accountType && accountType !== expectedType) {
      await supabase.auth.signOut();
      statusBox(form, "This account is not registered for the " + expectedType + " portal.", "error");
      setBusy(form, false);
      return;
    }

    window.location.href = destination;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var applicantSignup = document.getElementById("applicantSignupForm");
    var applicantLogin = document.getElementById("applicantLoginForm");
    var studentLogin = document.getElementById("studentLoginForm");
    var staffLogin = document.getElementById("staffLoginForm");

    waitForSupabase(function (supabase) {
      if (applicantSignup) applicantSignup.addEventListener("submit", function (e) {
        e.preventDefault();
        signupApplicant(applicantSignup, supabase).catch(function (error) {
          statusBox(applicantSignup, friendlyError(error), "error");
          setBusy(applicantSignup, false);
        });
      });

      if (applicantLogin) applicantLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        login(applicantLogin, "applicant-portal.html", "applicant", supabase).catch(function (error) {
          statusBox(applicantLogin, friendlyError(error), "error");
          setBusy(applicantLogin, false);
        });
      });

      if (studentLogin) studentLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        login(studentLogin, "student-portal.html", "student", supabase).catch(function (error) {
          statusBox(studentLogin, friendlyError(error), "error");
          setBusy(studentLogin, false);
        });
      });

      if (staffLogin) staffLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        login(staffLogin, "staff-portal.html", "staff", supabase).catch(function (error) {
          statusBox(staffLogin, friendlyError(error), "error");
          setBusy(staffLogin, false);
        });
      });
    });
  });
})();

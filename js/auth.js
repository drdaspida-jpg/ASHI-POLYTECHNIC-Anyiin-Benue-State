/* Ashi Polytechnic — real Supabase authentication */
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

  function signupApplicant(form) {
    waitForSupabase(async function (supabase) {
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

      var button = form.querySelector('button[type="submit"]');
      if (button) { button.disabled = true; button.textContent = "Creating account..."; }

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
        if (button) { button.disabled = false; button.textContent = "Create account"; }
        return;
      }

      statusBox(form, "Account created. Check your email to confirm your account, then log in.", "success");
      form.reset();
      if (button) { button.disabled = false; button.textContent = "Create account"; }
    });
  }

  function login(form, destination) {
    waitForSupabase(async function (supabase) {
      var email = form.querySelector('[name="loginId"]').value.trim().toLowerCase();
      var password = form.querySelector('[name="password"]').value;
      if (!email || !password) {
        statusBox(form, "Please enter both your email and password.", "error");
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      if (button) { button.disabled = true; button.textContent = "Signing in..."; }

      var result = await supabase.auth.signInWithPassword({ email: email, password: password });
      if (result.error) {
        statusBox(form, friendlyError(result.error), "error");
        if (button) { button.disabled = false; button.textContent = "Log in"; }
        return;
      }

      window.location.href = destination;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var applicantSignup = document.getElementById("applicantSignupForm");
    if (applicantSignup) applicantSignup.addEventListener("submit", function (e) {
      e.preventDefault();
      signupApplicant(applicantSignup);
    });

    var applicantLogin = document.getElementById("applicantLoginForm");
    if (applicantLogin) applicantLogin.addEventListener("submit", function (e) {
      e.preventDefault();
      login(applicantLogin, "applicant-portal.html");
    });
  });
})();

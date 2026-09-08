/* Ashi Polytechnic — protect authenticated portal pages */
(function () {
  var file = window.location.pathname.split("/").pop();
  var pages = {
    "student-portal.html": { login: "student-login.html", type: "student" },
    "applicant-portal.html": { login: "applicant-login.html", type: "applicant" },
    "staff-portal.html": { login: "staff-login.html", type: "staff" }
  };
  var page = pages[file];
  if (!page) return;

  function start(client) {
    client.auth.getSession().then(function (result) {
      var session = result.data && result.data.session;
      if (!session) {
        window.location.replace(page.login);
        return;
      }
      var metadata = session.user && session.user.user_metadata ? session.user.user_metadata : {};
      if (metadata.account_type && metadata.account_type !== page.type) {
        client.auth.signOut().finally(function () {
          window.location.replace(page.login);
        });
        return;
      }
      var nameNode = document.querySelector(".portal-profile-name");
      if (nameNode && metadata.full_name) nameNode.textContent = metadata.full_name;
    });
  }

  if (window.ashiSupabase) {
    start(window.ashiSupabase);
  } else {
    window.addEventListener("ashi:supabase-ready", function () {
      start(window.ashiSupabase);
    }, { once: true });
  }
})();

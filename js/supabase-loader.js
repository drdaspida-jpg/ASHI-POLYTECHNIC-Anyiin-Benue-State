/* Loads Supabase JS v2 and exposes a single client promise. */
(function () {
  var script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = function () {
    if (!window.ashiSupabaseReady || !window.ashiSupabaseReady()) return;
    window.ashiSupabase = window.supabase.createClient(
      window.ASHI_SUPABASE_CONFIG.url,
      window.ASHI_SUPABASE_CONFIG.anonKey
    );
    window.dispatchEvent(new Event("ashi:supabase-ready"));
  };
  script.onerror = function () {
    console.error("Unable to load Supabase client.");
  };
  document.head.appendChild(script);
})();

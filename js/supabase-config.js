/* Ashi Polytechnic — Supabase client configuration
 *
 * ONLY the public Supabase project URL and anon/publishable key belong here.
 * NEVER put the Supabase service_role/secret key in this file or anywhere in
 * the browser-facing repository.
 *
 * Replace the two placeholders after creating the Supabase project.
 */
window.ASHI_SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_PROJECT_URL",
  anonKey: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
};

window.ashiSupabaseReady = function () {
  return Boolean(
    window.supabase &&
    window.ASHI_SUPABASE_CONFIG &&
    window.ASHI_SUPABASE_CONFIG.url &&
    window.ASHI_SUPABASE_CONFIG.anonKey &&
    !window.ASHI_SUPABASE_CONFIG.url.includes("YOUR_") &&
    !window.ASHI_SUPABASE_CONFIG.anonKey.includes("YOUR_")
  );
};

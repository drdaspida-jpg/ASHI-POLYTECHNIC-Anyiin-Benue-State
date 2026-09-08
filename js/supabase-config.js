/* Ashi Polytechnic — Supabase client configuration
 *
 * This file contains ONLY the public Supabase project URL and
 * publishable/anon key. Never put a Supabase secret/service_role key here.
 */
window.ASHI_SUPABASE_CONFIG = {
  url: "https://fqfnmnllhsnwykczitlv.supabase.co",
  anonKey: "sb_publishable_c1AdU7H1q5UG0CzPxZZlhg_6V4yjifP"
};

window.ashiSupabaseReady = function () {
  return Boolean(
    window.supabase &&
    window.ASHI_SUPABASE_CONFIG &&
    window.ASHI_SUPABASE_CONFIG.url &&
    window.ASHI_SUPABASE_CONFIG.anonKey
  );
};

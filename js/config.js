/* Fill in the two values from Supabase → Project Settings → API (or "API Keys").
   The anon / publishable key is meant to be public: row-level security in supabase/schema.sql protects the data.
   Never put the service_role / secret key in this file. */
window.DD_CONFIG = {
  SUPABASE_URL: 'https://xhowbcwyxhicobjridyp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_16SNgd3vnNgwmRtKzpyWpQ_E3RooK9g' // publishable key (public by design)
};

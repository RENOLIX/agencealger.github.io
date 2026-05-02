import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://kyvxdxzepwpksubhgaov.supabase.co/rest/v1/";

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_iPR5t6sfttrv-EC_1GdfaQ_auz5nHR_";

const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "");

export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

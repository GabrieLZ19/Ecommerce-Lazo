import { createClient } from "@supabase/supabase-js";
import { config } from "./environment";

// Crear cliente de Supabase
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
);

// Cliente para operaciones públicas (sin service key)
export const supabasePublic = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export default supabase;

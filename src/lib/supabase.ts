import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase CoreMotion
 * Projeto: https://erpwfjdycdlygxwkdakv.supabase.co
 * 
 * Variáveis configuradas:
 * NEXT_PUBLIC_SUPABASE_URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY (suporta formato novo sb_publishable_...)
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://erpwfjdycdlygxwkdakv.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_v7H-hjMHbYENMzTaGYo5Uw_5eiRtIYH";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey;
}

export async function checkSupabaseConnection() {
  try {
    // Tenta listar tabelas via REST — se não existirem, retorna erro mas conexão ok
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      // Se erro for "relation does not exist", conexão está ok mas precisa rodar migrations
      if (error.message.includes("does not exist") || error.message.includes("not found")) {
        return { ok: true, needsMigration: true, message: "Conectado, mas tabelas precisam ser criadas no Supabase" };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

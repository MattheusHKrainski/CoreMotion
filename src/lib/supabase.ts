import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para CoreMotion
 * - Usa SUPABASE_URL e SUPABASE_ANON_KEY se configurados
 * - Caso contrário, retorna null e o app continua usando Drizzle + DATABASE_URL (que pode ser o Postgres do Supabase)
 *
 * Para conectar no seu projeto Supabase:
 * 1. Crie um projeto em https://supabase.com
 * 2. Vá em Settings > Database > Connection String > copie a URI
 * 3. Coloque no .env como DATABASE_URL
 * 4. Vá em Settings > API > copie URL e anon key para SUPABASE_URL e SUPABASE_ANON_KEY
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

/** Helper para verificar conexão */
export async function checkSupabaseConnection() {
  if (!supabase) return { ok: false, reason: "Supabase não configurado (.env)" };
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

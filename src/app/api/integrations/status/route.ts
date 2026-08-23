import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { supabase } from "@/lib/supabase";
import { execSync } from "node:child_process";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  // Database (Drizzle) — funciona com Postgres local ou Supabase Postgres
  try {
    await db.execute(sql`select 1`);
    result.database = {
      ok: true,
      type: process.env.DATABASE_URL?.includes("supabase") ? "Supabase Postgres" : "Local Postgres",
      url: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.slice(0, 30)}...` : "não configurado",
    };
  } catch (e) {
    result.database = { ok: false, error: String(e) };
  }

  // Supabase JS client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  if (supabase && supabaseUrl) {
    try {
      const { error } = await supabase.from("users").select("id").limit(1);
      result.supabase = {
        ok: !error,
        configured: true,
        url: supabaseUrl,
        hasAnonKey,
        error: error?.message,
      };
    } catch (e) {
      result.supabase = { ok: false, configured: true, url: supabaseUrl, hasAnonKey, error: String(e) };
    }
  } else {
    result.supabase = {
      ok: false,
      configured: false,
      url: supabaseUrl || null,
      hasAnonKey,
      hint: "Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env para ativar Storage/Auth do Supabase",
    };
  }

  // GitHub
  try {
    const remote = execSync("git remote -v 2>&1 || echo 'no git'", { encoding: "utf8" }).trim();
    const isGit = !remote.includes("no git") && !remote.includes("not a git repository");
    result.github = {
      ok: isGit,
      remote: isGit ? remote.split("\n")[0] : null,
      hint: isGit ? "Conectado" : "Rode: git init && git remote add origin https://github.com/SEU_USUARIO/coremotion.git",
    };
  } catch {
    result.github = { ok: false, hint: "Git não inicializado" };
  }

  return NextResponse.json(result);
}

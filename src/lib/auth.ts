import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { createSupabaseServerClient } from "./supabase-server";

export const SESSION_COOKIE = "sporthub_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function cookieOptions(maxAge = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSession(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });

  // Também limpa sessão Supabase
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {}
}

export type CurrentUser = typeof users.$inferSelect;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    // 1. Tenta sessão custom (legado + admin/demo)
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) {
      const rows = await db
        .select({ user: users })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
        .limit(1);
      const user = rows[0]?.user ?? null;
      if (user) {
        if (user.banned || user.status === "banned") {
          await db.delete(sessions).where(eq(sessions.token, token));
          return null;
        }
        return user;
      }
    }

    // 2. Tenta Supabase Auth (Google + e-mail/senha novo)
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      const supaUser = data.user;
      if (supaUser?.email) {
        // Busca perfil por supabase_id ou email
        const [bySupaId] = await db
          .select()
          .from(users)
          .where(eq(users.supabaseId, supaUser.id))
          .limit(1);
        if (bySupaId) {
          if (bySupaId.banned || bySupaId.status === "banned") return null;
          return bySupaId;
        }
        const [byEmail] = await db
          .select()
          .from(users)
          .where(eq(users.email, supaUser.email.toLowerCase()))
          .limit(1);
        if (byEmail) {
          // Vincula supabase_id se ainda não vinculado
          if (!byEmail.supabaseId) {
            await db.update(users).set({ supabaseId: supaUser.id, updatedAt: new Date() }).where(eq(users.id, byEmail.id));
          }
          if (byEmail.banned || byEmail.status === "banned") return null;
          return byEmail;
        }
        // Se não tem perfil, mas está autenticado no Supabase, cria perfil automaticamente (primeiro acesso Google)
        // Role padrão user
        const name = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email.split("@")[0];
        const handleBase = slugify(name) || `user-${supaUser.id.slice(0, 8)}`;
        let handle = handleBase;
        const existingHandle = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1);
        if (existingHandle.length) handle = `${handleBase}-${Math.floor(Math.random() * 9000)}`;

        const [created] = await db
          .insert(users)
          .values({
            supabaseId: supaUser.id,
            name,
            handle,
            email: supaUser.email.toLowerCase(),
            passwordHash: hashPassword(randomBytes(16).toString("hex")), // senha aleatória, não usada (Supabase Auth gerencia)
            role: "user",
            status: "active",
            avatar: supaUser.user_metadata?.avatar_url || "",
          })
          .returning();
        return created;
      }
    } catch {
      // ignora erro Supabase Auth
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (!["admin", "super_admin"].includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export function isAdmin(user: CurrentUser | null | undefined) {
  return user ? ["admin", "super_admin"].includes(user.role) : false;
}

export function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Aceita apenas e-mails de provedores reais + contas especiais */
const REAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
  "globomail.com",
  "oi.com.br",
  "zipmail.com.br",
  "aol.com",
  "gmx.com",
  "mail.com",
]);

const ALLOWED_SPECIAL = new Set(["demo@sporthub.com", "operacaoamd@gmail.com"]);

export function isAllowedEmail(email: string): { ok: boolean; reason?: string } {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return { ok: false, reason: "Formato de e-mail inválido." };
  }
  if (ALLOWED_SPECIAL.has(e)) return { ok: true };
  const domain = e.split("@")[1];
  if (!domain || !REAL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: "Use um e-mail real (Gmail, Outlook, Yahoo, iCloud, UOL…). E-mails inventados não são aceitos.",
    };
  }
  return { ok: true };
}

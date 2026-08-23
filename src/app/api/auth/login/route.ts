import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  isAllowedEmail,
  SESSION_COOKIE,
  cookieOptions,
} from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSeed();

    const contentType = req.headers.get("content-type") ?? "";
    let email = "";
    let password = "";
    let next = "/";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = String(body.email ?? "").trim().toLowerCase();
      password = String(body.password ?? "");
      next = String(body.next ?? "/");
    } else {
      const form = await req.formData();
      email = String(form.get("email") ?? "").trim().toLowerCase();
      password = String(form.get("password") ?? "");
      next = String(form.get("next") ?? "/");
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Preencha e-mail e senha." },
        { status: 400 },
      );
    }

    const emailCheck = isAllowedEmail(email);
    if (!emailCheck.ok) {
      return NextResponse.json({ error: emailCheck.reason }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    if (user.banned) {
      return NextResponse.json(
        {
          error: `Conta suspensa${user.banReason ? `: ${user.banReason}` : "."}`,
        },
        { status: 403 },
      );
    }

    await db.delete(sessions).where(eq(sessions.userId, user.id));
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 864e5);
    await db.insert(sessions).values({ token, userId: user.id, expiresAt });
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const dest = user.role === "admin" ? "/admin" : next || "/";
    const res = NextResponse.json({
      ok: true,
      redirect: dest,
      user: { name: user.name, role: user.role, email: user.email },
    });

    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    return res;
  } catch (e) {
    console.error("login route error", e);
    return NextResponse.json(
      { error: "Erro ao entrar. Tente novamente." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  isAllowedEmail,
  slugify,
  SESSION_COOKIE,
  cookieOptions,
} from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { PEOPLE } from "@/lib/media";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSeed();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const roleRaw = String(body.role ?? "athlete");
    const role = roleRaw === "coach" ? "coach" : "athlete";
    const sport = String(body.sport ?? "Multi-esportes");
    const city = String(body.city ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Informe seu nome completo." },
        { status: 400 },
      );
    }

    const emailCheck = isAllowedEmail(email);
    if (!emailCheck.ok) {
      return NextResponse.json({ error: emailCheck.reason }, { status: 400 });
    }

    if (email === "demo@sporthub.com" || email === "operacaoamd@gmail.com") {
      return NextResponse.json(
        { error: "Este e-mail é reservado. Faça login na conta existente." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter ao menos 6 caracteres." },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Faça login." },
        { status: 400 },
      );
    }

    let handle = slugify(name) || "atleta";
    const taken = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.handle, handle))
      .limit(1);
    if (taken.length)
      handle = `${handle}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        handle,
        passwordHash: hashPassword(password),
        role,
        sport,
        city,
        avatar: PEOPLE.training,
        bio:
          role === "coach"
            ? "Treinador no SportHub. Atualize sua bio no perfil."
            : "Atleta no SportHub. Atualize sua bio no perfil.",
        pricePerHour: role === "coach" ? 120 : null,
        lastLoginAt: new Date(),
      })
      .returning({ id: users.id, name: users.name, role: users.role });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 864e5);
    await db
      .insert(sessions)
      .values({ token, userId: created.id, expiresAt });

    const res = NextResponse.json({
      ok: true,
      redirect: "/",
      user: { name: created.name, role: created.role, email },
    });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    return res;
  } catch (e) {
    console.error("register route error", e);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 },
    );
  }
}

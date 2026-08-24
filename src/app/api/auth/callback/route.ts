import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, slugify } from "@/lib/auth";
import { PEOPLE } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user?.email) {
      const supaUser = data.user;
      const email = supaUser.email!;
      const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (!existing) {
        const name = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || email.split("@")[0];
        let handle = slugify(name) || `user-${supaUser.id.slice(0, 8)}`;
        const taken = await db.select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1);
        if (taken.length) handle = `${handle}-${Math.floor(Math.random() * 9000)}`;

        await db.insert(users).values({
          supabaseId: supaUser.id,
          name,
          handle,
          email: email.toLowerCase(),
          passwordHash: hashPassword(`oauth-${supaUser.id}`),
          role: "user",
          status: "active",
          avatar: supaUser.user_metadata?.avatar_url || PEOPLE.training,
        });
      } else if (!existing.supabaseId) {
        await db.update(users).set({ supabaseId: supaUser.id }).where(eq(users.id, existing.id));
      }
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}

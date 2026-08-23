import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import StoreCreateForm from "./StoreCreateForm";

export const dynamic = "force-dynamic";

export default async function CriarLojaPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.banned) redirect("/");

  if (me.role !== "admin") {
    const [existing] = await db.select({ id: stores.id }).from(stores).where(eq(stores.ownerId, me.id)).limit(1);
    if (existing) redirect("/minha-loja");
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight">Criar minha loja</h1>
      <p className="text-slate-500 text-sm mt-1">
        Preencha os dados da sua loja. Você terá uma vitrine própria em /loja/sua-loja e seus produtos aparecerão no marketplace.
      </p>
      <StoreCreateForm email={me.email} city={me.city} />
    </div>
  );
}

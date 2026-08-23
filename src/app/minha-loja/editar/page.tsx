import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import StoreEditForm from "./StoreEditForm";

export const dynamic = "force-dynamic";

export default async function EditarLojaPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, me.id)).limit(1);
  if (!store) redirect("/minha-loja");

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight">Editar loja</h1>
      <p className="text-slate-500 text-sm mt-1">Atualize as informações da sua vitrine.</p>
      <StoreEditForm store={store} />
    </div>
  );
}

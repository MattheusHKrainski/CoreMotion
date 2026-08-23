import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import ProductCreateForm from "./ProductCreateForm";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, me.id)).limit(1);
  if (!store) redirect("/minha-loja");

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight">Novo produto</h1>
      <p className="text-sm text-slate-500 mt-1">Cadastre um produto para sua loja {store.name}. Ele aparecerá na vitrine pública e no marketplace.</p>
      <ProductCreateForm storeId={store.id} />
    </div>
  );
}

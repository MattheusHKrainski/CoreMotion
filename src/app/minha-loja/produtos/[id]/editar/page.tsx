import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import ProductEditForm from "./ProductEditForm";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const { id } = await params;
  const pid = Number(id);
  if (!pid) notFound();

  const [p] = await db.select().from(products).where(eq(products.id, pid)).limit(1);
  if (!p) notFound();

  if (p.storeId) {
    const [s] = await db.select().from(stores).where(eq(stores.id, p.storeId)).limit(1);
    if (!s) notFound();
    if (s.ownerId !== me.id && me.role !== "admin") redirect("/minha-loja");
  } else {
    if (p.sellerId !== me.id && me.role !== "admin") redirect("/minha-loja");
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight">Editar produto</h1>
      <p className="text-sm text-slate-500 mt-1">Atualize as informações do produto da sua loja.</p>
      <ProductEditForm product={p} />
    </div>
  );
}

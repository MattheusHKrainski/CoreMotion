import Link from "next/link";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureSeed } from "@/lib/seed";
import { money } from "@/components/ProductCard";
import { deleteStoreProductAction } from "@/app/actions";
import { IconBag, IconArrowLeft } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function MeusProdutosPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, me.id)).limit(1);
  if (!store) redirect("/minha-loja");

  const list = await db.select().from(products).where(eq(products.storeId, store.id)).orderBy(desc(products.createdAt));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link href="/minha-loja" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600 mb-4">
        <IconArrowLeft width={16} height={16} /> Voltar para Minha Loja
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Produtos da loja</h1>
          <p className="text-sm text-slate-500">{list.length} produtos · {store.name}</p>
        </div>
        <Link href="/minha-loja/produtos/novo" className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-full">
          + Novo produto
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
            <IconBag width={28} height={28} />
          </div>
          <div className="mt-3 font-bold text-lg">Nenhum produto cadastrado</div>
          <p className="text-sm text-slate-500">Comece adicionando seu primeiro produto para aparecer na vitrine.</p>
          <Link href="/minha-loja/produtos/novo" className="inline-block mt-4 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">Cadastrar produto</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Produto</th>
                  <th className="px-4 py-3 font-bold">Preço</th>
                  <th className="px-4 py-3 font-bold">Estoque</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.brand} · {p.category} · /produto/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-black whitespace-nowrap">
                      <div>{money(p.price)}</div>
                      {p.oldPrice && <div className="text-[11px] line-through text-slate-400">{money(p.oldPrice)}</div>}
                    </td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                        {p.active ? "Ativo" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <Link href={`/produto/${p.slug}`} className="text-[11px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Ver</Link>
                        <Link href={`/minha-loja/produtos/${p.id}/editar`} className="text-[11px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Editar</Link>
                        <form action={deleteStoreProductAction}>
                          <input type="hidden" name="productId" value={p.id} />
                          <button className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-600 text-white">Excluir</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

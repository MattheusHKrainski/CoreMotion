import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { adminToggleStoreAction, adminDeleteStoreAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const list = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      active: stores.active,
      verified: stores.verified,
      productCount: stores.productCount,
      followers: stores.followers,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id))
    .orderBy(desc(stores.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight">Lojas</h1>
      <p className="text-sm text-slate-500">Gerencie lojas B2C do marketplace.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Loja</th>
                <th className="px-4 py-3 font-bold">Dono</th>
                <th className="px-4 py-3 font-bold">Produtos</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((s) => (
                <tr key={s.id} className={!s.active ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[11px] text-slate-500">/{s.slug} {s.verified && "✓ verificado"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-xs">{s.ownerName}</div>
                    <div className="text-[11px] text-slate-500">{s.ownerEmail}</div>
                  </td>
                  <td className="px-4 py-3">{s.productCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {s.active ? "Ativa" : "Oculta"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <form action={adminToggleStoreAction}>
                        <input type="hidden" name="storeId" value={s.id} />
                        <button className="text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                          {s.active ? "Ocultar" : "Ativar"}
                        </button>
                      </form>
                      <form action={adminDeleteStoreAction}>
                        <input type="hidden" name="storeId" value={s.id} />
                        <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white">Excluir</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

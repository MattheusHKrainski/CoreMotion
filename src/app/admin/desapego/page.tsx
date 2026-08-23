import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { adminToggleListingAction, adminDeleteListingAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const list = await db
    .select({
      id: listings.id,
      title: listings.title,
      price: listings.price,
      condition: listings.condition,
      status: listings.status,
      views: listings.views,
      sellerName: users.name,
      sellerEmail: users.email,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .orderBy(desc(listings.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight">Desapego C2C</h1>
      <p className="text-sm text-slate-500">Modere anúncios entre usuários.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Anúncio</th>
                <th className="px-4 py-3 font-bold">Vendedor</th>
                <th className="px-4 py-3 font-bold">Preço</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <div className="font-bold line-clamp-1">{l.title}</div>
                    <div className="text-[11px] text-slate-500">{l.condition} · {l.views} views</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-xs">{l.sellerName}</div>
                    <div className="text-[11px] text-slate-500">{l.sellerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-black">R$ {Number(l.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${l.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : l.status === "Vendido" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <form action={adminToggleListingAction}>
                        <input type="hidden" name="listingId" value={l.id} />
                        <button className="text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                          {l.status === "Ativo" ? "Pausar" : "Ativar"}
                        </button>
                      </form>
                      <form action={adminDeleteListingAction}>
                        <input type="hidden" name="listingId" value={l.id} />
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

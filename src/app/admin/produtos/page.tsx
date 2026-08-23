import { db } from "@/db";
import { products } from "@/db/schema";
import { asc } from "drizzle-orm";
import { money } from "@/components/ProductCard";
import {
  adminToggleProductAction,
  adminDeleteProductAction,
  adminUpdateStockAction,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const list = await db.select().from(products).orderBy(asc(products.id));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Produtos</h1>
        <p className="text-sm text-slate-500">
          Ative/desative itens do marketplace, ajuste estoque ou remova
          listagens fraudulentas.
        </p>
      </div>

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
                <tr key={p.id} className={!p.active ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt=""
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold line-clamp-1">{p.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.brand} · {p.category} · {p.scanCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black whitespace-nowrap">
                    {money(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={adminUpdateStockAction}
                      className="flex items-center gap-1"
                    >
                      <input type="hidden" name="productId" value={p.id} />
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        defaultValue={p.stock}
                        className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs"
                      />
                      <button className="text-[10px] font-bold text-slate-500 hover:text-red-600">
                        OK
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        p.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.active ? "Ativo" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <form action={adminToggleProductAction}>
                        <input type="hidden" name="productId" value={p.id} />
                        <button className="text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                          {p.active ? "Ocultar" : "Ativar"}
                        </button>
                      </form>
                      <form action={adminDeleteProductAction}>
                        <input type="hidden" name="productId" value={p.id} />
                        <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white">
                          Excluir
                        </button>
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

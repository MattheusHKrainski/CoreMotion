import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { money } from "@/components/ProductCard";
import { adminCancelOrderAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const list = await db
    .select({
      id: orders.id,
      code: orders.code,
      subtotal: orders.subtotal,
      shipping: orders.shipping,
      total: orders.total,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      address: orders.address,
      createdAt: orders.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Pedidos</h1>
        <p className="text-sm text-slate-500">
          Acompanhe vendas e cancele pedidos fraudulentos.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          Nenhum pedido ainda.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Pedido</th>
                  <th className="px-4 py-3 font-bold">Cliente</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Pagamento</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-xs">{o.code}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{o.userName}</div>
                      <div className="text-[11px] text-slate-500">
                        {o.userEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-black whitespace-nowrap">
                      {money(o.total)}
                    </td>
                    <td className="px-4 py-3 uppercase text-xs">
                      {o.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          o.status === "Cancelado"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.status !== "Cancelado" && (
                        <form action={adminCancelOrderAction}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <button className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-600 text-white">
                            Cancelar
                          </button>
                        </form>
                      )}
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

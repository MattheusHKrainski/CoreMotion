import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { money } from "@/components/ProductCard";
import {
  IconPackage,
  IconCheckCircle,
  IconTruck,
  IconClock,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const me = await getCurrentUser();
  const { novo } = await searchParams;

  if (!me)
    return (
      <div className="max-w-md mx-auto p-8 py-20 text-center">
        <IconPackage width={40} height={40} className="mx-auto text-slate-400" />
        <h1 className="mt-4 text-2xl font-black">Entre para ver seus pedidos</h1>
        <Link
          href="/login"
          className="inline-block mt-5 bg-red-600 text-white font-bold px-6 py-3 rounded-full"
        >
          Entrar na conta
        </Link>
      </div>
    );

  const list = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, me.id))
    .orderBy(desc(orders.createdAt));

  const items = list.length
    ? await db
        .select()
        .from(orderItems)
        .where(
          inArray(
            orderItems.orderId,
            list.map((o) => o.id),
          ),
        )
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Meus pedidos
      </h1>
      <p className="text-slate-500 text-sm mt-0.5">
        Acompanhe suas compras e entregas.
      </p>

      {novo && (
        <div className="mt-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <IconCheckCircle
            width={24}
            height={24}
            className="text-emerald-600 shrink-0 mt-0.5"
          />
          <div>
            <div className="font-black text-emerald-900">
              Pedido {novo} confirmado!
            </div>
            <p className="text-sm text-emerald-800 mt-0.5">
              Você receberá o código de rastreio por e-mail assim que o pedido
              for despachado.
            </p>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <IconPackage
            width={40}
            height={40}
            className="mx-auto text-slate-300"
          />
          <div className="mt-3 font-bold text-lg">Nenhum pedido ainda</div>
          <p className="text-slate-500 text-sm mt-1">
            Que tal começar pelos lançamentos da loja?
          </p>
          <Link
            href="/marketplace"
            className="inline-block mt-4 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((o) => {
            const oItems = items.filter((i) => i.orderId === o.id);
            const steps = ["Confirmado", "Em separação", "Enviado", "Entregue"];
            const currentStep = 1;
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 bg-slate-50 border-b border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Pedido
                    </div>
                    <div className="font-mono font-bold text-sm">{o.code}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Data
                    </div>
                    <div className="text-sm">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Total
                    </div>
                    <div className="text-sm font-black">{money(o.total)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      Pagamento
                    </div>
                    <div className="text-sm uppercase">{o.paymentMethod}</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <IconCheckCircle width={13} height={13} /> {o.status}
                  </span>
                </div>

                {/* Tracking */}
                <div className="px-5 pt-4">
                  <div className="flex items-center">
                    {steps.map((s, i) => (
                      <div key={s} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-7 h-7 rounded-full grid place-items-center text-white ${
                              i <= currentStep ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            {i === 0 ? (
                              <IconCheckCircle width={14} height={14} />
                            ) : i === 2 ? (
                              <IconTruck width={14} height={14} />
                            ) : (
                              <IconClock width={14} height={14} />
                            )}
                          </div>
                          <span
                            className={`mt-1 text-[10px] font-semibold text-center ${
                              i <= currentStep
                                ? "text-slate-800"
                                : "text-slate-400"
                            }`}
                          >
                            {s}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 -mt-4 ${
                              i < currentStep ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {oItems.map((i) => (
                    <div key={i.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={i.image}
                          alt={i.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-1">
                          {i.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Tam. {i.size} · Qtd {i.qty}
                        </div>
                      </div>
                      <div className="text-sm font-bold shrink-0">
                        {money(Number(i.unitPrice) * i.qty)}
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <strong className="text-slate-700">Entrega:</strong>{" "}
                    {o.address}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

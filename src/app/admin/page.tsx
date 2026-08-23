import Link from "next/link";
import { db } from "@/db";
import {
  users,
  products,
  orders,
  reports,
  posts,
  adminLogs,
  sessions,
} from "@/db/schema";
import { sql, desc, eq, and, gte } from "drizzle-orm";
import { money } from "@/components/ProductCard";
import {
  IconUsers,
  IconBag,
  IconPackage,
  IconShield,
  IconTrendUp,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    [userCount],
    [bannedCount],
    [productCount],
    [activeProductCount],
    [orderCount],
    [revenue],
    [openReports],
    [postCount],
    [sessionCount],
    recentLogs,
    recentOrders,
    topReported,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.banned, true)),
    db.select({ n: sql<number>`count(*)::int` }).from(products),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.active, true)),
    db.select({ n: sql<number>`count(*)::int` }).from(orders),
    db
      .select({
        n: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
      })
      .from(orders)
      .where(eq(orders.status, "Confirmado")),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "Aberto")),
    db.select({ n: sql<number>`count(*)::int` }).from(posts),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(sessions)
      .where(gte(sessions.expiresAt, new Date())),
    db
      .select({
        id: adminLogs.id,
        action: adminLogs.action,
        details: adminLogs.details,
        createdAt: adminLogs.createdAt,
        adminName: users.name,
      })
      .from(adminLogs)
      .innerJoin(users, eq(adminLogs.adminId, users.id))
      .orderBy(desc(adminLogs.createdAt))
      .limit(10),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db
      .select()
      .from(users)
      .where(and(eq(users.banned, false), sql`${users.reportCount} > 0`))
      .orderBy(desc(users.reportCount))
      .limit(5),
  ]);

  const cards = [
    {
      label: "Usuários",
      value: userCount.n,
      sub: `${bannedCount.n} banidos · ${sessionCount.n} online`,
      href: "/admin/usuarios",
      Icon: IconUsers,
      color: "from-sky-500 to-blue-600",
    },
    {
      label: "Produtos",
      value: productCount.n,
      sub: `${activeProductCount.n} ativos no marketplace`,
      href: "/admin/produtos",
      Icon: IconBag,
      color: "from-red-500 to-orange-500",
    },
    {
      label: "Pedidos",
      value: orderCount.n,
      sub: `Receita ${money(revenue.n)}`,
      href: "/admin/pedidos",
      Icon: IconPackage,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Denúncias abertas",
      value: openReports.n,
      sub: `${postCount.n} posts na comunidade`,
      href: "/admin/denuncias",
      Icon: IconShield,
      color: "from-purple-500 to-fuchsia-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Visão geral da operação SportHub
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, value, sub, href, Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} grid place-items-center text-white`}
            >
              <Icon width={18} height={18} />
            </div>
            <div className="mt-3 text-2xl font-black">
              {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
            </div>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black">Pedidos recentes</h2>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-red-600"
            >
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <div className="font-mono font-bold text-xs">{o.code}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(o.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black">{money(o.total)}</div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black">Usuários com denúncias</h2>
            <Link
              href="/admin/usuarios"
              className="text-xs font-bold text-red-600"
            >
              Moderação
            </Link>
          </div>
          {topReported.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum usuário com denúncias abertas.
            </p>
          ) : (
            <div className="space-y-2">
              {topReported.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <div className="font-bold">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-1 rounded-full">
                    {u.reportCount} denúncias
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <IconTrendUp width={18} height={18} className="text-purple-600" />
          <h2 className="font-black">Log de ações admin</h2>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma ação registrada ainda. Banimentos, exclusões e alterações
            de estoque aparecem aqui.
          </p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm py-2 border-b border-slate-50 last:border-0"
              >
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(l.createdAt).toLocaleString("pt-BR")}
                </span>
                <span className="font-bold">{l.adminName}</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {l.action}
                </span>
                {l.details && (
                  <span className="text-slate-500 text-xs truncate">
                    {l.details}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

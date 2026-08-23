import Link from "next/link";
import { db } from "@/db";
import { posts, orders, bookings, follows, wishlist } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import ProfileForm from "./ProfileForm";
import {
  IconUser,
  IconPackage,
  IconHeart,
  IconCalendar,
  IconUsers,
  IconVerified,
  IconPin,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await getCurrentUser();

  if (!me)
    return (
      <div className="max-w-md mx-auto p-8 py-20 text-center">
        <IconUser width={40} height={40} className="mx-auto text-slate-400" />
        <h1 className="mt-4 text-2xl font-black">Você não está logado</h1>
        <p className="text-slate-500 mt-1">
          Entre para acessar seu perfil, pedidos e agendamentos.
        </p>
        <div className="mt-5 flex gap-2 justify-center">
          <Link
            href="/login"
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-full"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="border-2 border-slate-900 font-bold px-6 py-3 rounded-full"
          >
            Criar conta
          </Link>
        </div>
      </div>
    );

  const c = async (t: ReturnType<typeof db.select>) => t;
  void c;

  const [[postCount], [orderCount], [bookingCount], [followingCount], [favCount]] =
    await Promise.all([
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(posts)
        .where(eq(posts.userId, me.id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.userId, me.id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(bookings)
        .where(eq(bookings.userId, me.id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(follows)
        .where(eq(follows.followerId, me.id)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(wishlist)
        .where(eq(wishlist.userId, me.id)),
    ]);

  const stats = [
    { label: "Publicações", value: postCount.n, href: "/feed" },
    { label: "Seguidores", value: me.followers, href: "/atletas" },
    { label: "Seguindo", value: followingCount.n, href: "/atletas" },
    { label: "Pedidos", value: orderCount.n, href: "/pedidos" },
  ];

  const quick = [
    {
      href: "/pedidos",
      label: "Meus pedidos",
      desc: `${orderCount.n} pedido(s)`,
      Icon: IconPackage,
    },
    {
      href: "/favoritos",
      label: "Favoritos",
      desc: `${favCount.n} salvo(s)`,
      Icon: IconHeart,
    },
    {
      href: "/agendamentos",
      label: "Agendamentos",
      desc: `${bookingCount.n} sessão(ões)`,
      Icon: IconCalendar,
    },
    {
      href: "/atletas",
      label: "Minha rede",
      desc: `Seguindo ${followingCount.n}`,
      Icon: IconUsers,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-red-600 to-red-800 relative">
          <svg
            className="absolute inset-0 w-full h-full opacity-15"
            viewBox="0 0 400 100"
            fill="none"
          >
            <path
              d="M0 80 L60 55 L120 65 L180 30 L240 45 L300 15 L400 30"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="px-5 md:px-7 pb-6">
          <div className="flex items-end gap-4 -mt-10">
            <div className="ring-4 ring-white rounded-3xl">
              <Avatar src={me.avatar} name={me.name} size={84} rounded="2xl" />
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-black truncate">{me.name}</h1>
                {me.verified && (
                  <IconVerified
                    width={18}
                    height={18}
                    className="text-blue-500 shrink-0"
                  />
                )}
              </div>
              <div className="text-sm text-slate-500">@{me.handle}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {me.role === "coach" ? "Treinador" : "Atleta"} · {me.level}
            </span>
            <span className="text-slate-600">{me.sport}</span>
            {me.city && (
              <span className="text-slate-500 flex items-center gap-1">
                <IconPin width={13} height={13} /> {me.city}
              </span>
            )}
          </div>

          {me.bio && <p className="mt-3 text-slate-700 text-sm">{me.bio}</p>}

          <div className="mt-5 grid grid-cols-4 gap-2">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="text-center bg-slate-50 hover:bg-slate-100 rounded-xl py-3 transition"
              >
                <div className="text-xl font-black">
                  {s.value.toLocaleString("pt-BR")}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {s.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {quick.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition"
          >
            <Icon width={22} height={22} className="text-red-600" />
            <div className="mt-2 font-bold text-sm">{label}</div>
            <div className="text-[11px] text-slate-500">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Edit form */}
      <div className="mt-5">
        <ProfileForm
          user={{
            name: me.name,
            bio: me.bio,
            city: me.city,
            sport: me.sport,
            level: me.level,
            role: me.role,
            pricePerHour: me.pricePerHour,
            email: me.email,
          }}
        />
      </div>
    </div>
  );
}

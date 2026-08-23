import Link from "next/link";
import { db } from "@/db";
import { users, posts, products, news, stores, listings } from "@/db/schema";
import { desc, eq, and, isNotNull, sql } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import ProductCard from "@/components/ProductCard";
import {
  IconArrowRight,
  IconScan,
  IconBag,
  IconWhistle,
  IconTrophy,
  IconStar,
  IconVerified,
  IconTrendUp,
  IconNews,
  IconClock,
  IconTruck,
  IconShield,
  IconCreditCard,
  IconUsers,
  IconPackage,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeed();
  const me = await getCurrentUser();

  const [featuredCoaches, latestPosts, deals, runningShoes, topNews, storeList, c2cList] = await Promise.all([
    db.select().from(users).where(eq(users.role, "coach")).limit(3),
    db
      .select({
        id: posts.id,
        content: posts.content,
        sport: posts.sport,
        likes: posts.likes,
        authorName: users.name,
        authorAvatar: users.avatar,
        authorVerified: users.verified,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.likes))
      .limit(3),
    db.select().from(products).where(and(eq(products.active, true), isNotNull(products.oldPrice))).orderBy(sql`random()`).limit(8),
    db.select().from(products).where(and(eq(products.active, true), eq(products.category, "Tênis de Corrida"))).limit(4),
    db.select().from(news).orderBy(desc(news.publishedAt)).limit(4),
    db.select().from(stores).where(eq(stores.active, true)).orderBy(desc(stores.followers)).limit(6),
    db.select().from(listings).where(eq(listings.status, "Ativo")).orderBy(desc(listings.createdAt)).limit(4),
  ]);

  const [leadNews, ...restNews] = topNews;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      {/* Hero CoreMotion */}
      <section className="grid lg:grid-cols-[1fr_340px] gap-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-600 to-red-800 text-white p-7 md:p-12 min-h-[380px] flex flex-col justify-center">
          <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] rounded-full bg-red-400/30 blur-3xl" />
          <svg className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-15" viewBox="0 0 400 200" fill="none">
            <path d="M0 180 L60 140 L120 155 L180 90 L240 110 L300 40 L400 60" stroke="white" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <IconTrendUp width={13} height={13} /> CoreMotion Marketplace
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">Lojas + Desapego</span>
            </div>
            <h1 className="mt-3 text-3xl md:text-6xl font-black leading-[1.05] tracking-tight">
              {me ? `Bora treinar, ${me.name.split(" ")[0]}?` : "CoreMotion."}
              <br />
              <span className="text-white/90">{me ? "Seu marketplace esportivo." : "Sua performance em movimento."}</span>
            </h1>
            <p className="mt-3 max-w-md text-white/90 text-base md:text-lg">
              Lojas oficiais, desapego entre atletas, comunidade, treinadores e notícias. Tudo do esporte em um só lugar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 md:px-6 py-3 rounded-full hover:bg-slate-100 transition text-sm">
                Marketplace B2C <IconArrowRight width={16} height={16} />
              </Link>
              <Link href="/desapego" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-5 md:px-6 py-3 rounded-full hover:bg-emerald-600 transition text-sm">
                <IconUsers width={16} height={16} /> Desapego C2C
              </Link>
              <Link href="/scanner" className="inline-flex items-center gap-2 bg-white/10 border border-white/40 font-bold px-5 md:px-6 py-3 rounded-full hover:bg-white/20 transition text-sm">
                <IconScan width={16} height={16} /> SmartScan câmera
              </Link>
            </div>
          </div>
        </div>

        {leadNews && (
          <Link href={`/noticias/${leadNews.slug}`} className="group relative rounded-3xl overflow-hidden bg-slate-900 min-h-[240px] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={leadNews.image} alt={leadNews.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-5 text-white">
              <span className="inline-flex items-center gap-1.5 self-start bg-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                <IconNews width={11} height={11} /> Notícia do dia
              </span>
              <h3 className="mt-2.5 text-lg font-black leading-tight line-clamp-3">{leadNews.title}</h3>
              <div className="mt-1.5 text-[11px] text-white/70 flex items-center gap-1"><IconClock width={11} height={11} /> {leadNews.sport} · {leadNews.source}</div>
            </div>
          </Link>
        )}
      </section>

      {/* Trust bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { Icon: IconTruck, t: "Frete grátis", d: "acima de R$249" },
          { Icon: IconCreditCard, t: "10x sem juros", d: "ou 5% off no PIX" },
          { Icon: IconShield, t: "Lojas verificadas", d: "B2C oficial" },
          { Icon: IconUsers, t: "Desapego seguro", d: "C2C entre atletas" },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3">
            <Icon width={22} height={22} className="text-red-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{t}</div>
              <div className="text-[11px] text-slate-500 truncate">{d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Quick nav CoreMotion */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/marketplace", label: "Marketplace", desc: "B2C oficial", Icon: IconBag, accent: "from-red-500 to-orange-500" },
          { href: "/lojas", label: "Lojas", desc: "Vitrine própria", Icon: IconPackage, accent: "from-slate-700 to-slate-900" },
          { href: "/desapego", label: "Desapego", desc: "C2C entre atletas", Icon: IconUsers, accent: "from-emerald-500 to-teal-600" },
          { href: "/scanner", label: "SmartScan", desc: "Câmera do celular", Icon: IconScan, accent: "from-purple-500 to-fuchsia-600" },
          { href: "/treinadores", label: "Treinadores", desc: "Contrate", Icon: IconWhistle, accent: "from-amber-500 to-orange-600" },
          { href: "/atletas", label: "Atletas", desc: "Networking", Icon: IconTrophy, accent: "from-sky-500 to-blue-600" },
        ].map(({ href, label, desc, Icon, accent }) => (
          <Link key={href} href={href} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} grid place-items-center text-white shadow-md`}>
              <Icon width={20} height={20} />
            </div>
            <div className="mt-2.5 font-bold text-sm">{label}</div>
            <div className="text-[11px] text-slate-500">{desc}</div>
          </Link>
        ))}
      </section>

      {/* Lojas */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Lojas oficiais (B2C)</h2>
          <Link href="/lojas" className="text-sm font-bold text-red-600">Ver todas</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {storeList.map((s) => (
            <Link key={s.id} href={`/lojas/${s.slug}`} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo} alt={s.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm truncate">{s.name}</span>
                  {s.verified && <IconVerified width={12} height={12} className="text-blue-500" />}
                </div>
                <div className="text-[11px] text-slate-500">{s.category} · {s.productCount} produtos</div>
                <div className="text-[11px] text-slate-400">★ {Number(s.rating).toFixed(1)} · {s.followers.toLocaleString("pt-BR")} seguidores</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-xl md:text-3xl font-black tracking-tight">Ofertas da semana</h2>
            <p className="text-sm text-slate-500">Marketplace B2C com desconto real</p>
          </div>
          <Link href="/marketplace" className="text-sm font-bold text-red-600">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {deals.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Desapego C2C */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Desapego em destaque (C2C)</h2>
          <Link href="/desapego" className="text-sm font-bold text-emerald-600">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {c2cList.map((l) => (
            <Link key={l.id} href={`/desapego/${l.id}`} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-square bg-white border-b border-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.images[0]} alt={l.title} className="w-full h-full object-contain p-3" loading="lazy" />
              </div>
              <div className="p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{l.condition} · {l.sport}</div>
                <div className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{l.title}</div>
                <div className="mt-2 font-black text-emerald-600">R$ {Number(l.price).toFixed(2)}</div>
                <div className="text-[11px] text-slate-400">{l.city}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Noticias */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Notícias do esporte</h2>
          <Link href="/noticias" className="text-sm font-bold text-red-600">Todas as notícias</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {restNews.map((n) => (
            <Link key={n.id} href={`/noticias/${n.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition">
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <span className="absolute top-3 left-3 bg-white text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{n.sport}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-red-600 transition">{n.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Corrida */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Tênis de corrida oficiais</h2>
          <Link href="/marketplace?category=T%C3%AAnis%20de%20Corrida" className="text-sm font-bold text-red-600">Ver linha completa</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {runningShoes.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Comunidade + coaches */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Em alta na comunidade</h2>
            <Link href="/feed" className="text-sm font-bold text-red-600">Ver feed</Link>
          </div>
          <div className="space-y-3">
            {latestPosts.map((p) => (
              <Link key={p.id} href="/feed" className="flex gap-3 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition">
                <Avatar src={p.authorAvatar} name={p.authorName} size={42} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm truncate">{p.authorName}</span>
                    {p.authorVerified && <IconVerified width={13} height={13} className="text-blue-500 shrink-0" />}
                    <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">{p.sport}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">{p.content}</p>
                  <div className="text-[11px] text-slate-400 mt-1">{p.likes} curtidas</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Treinadores em destaque</h2>
            <Link href="/treinadores" className="text-sm font-bold text-red-600">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {featuredCoaches.map((c) => (
              <Link key={c.id} href="/treinadores" className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition">
                <Avatar src={c.avatar} name={c.name} size={48} rounded="2xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm truncate">{c.name}</span>
                    {c.verified && <IconVerified width={13} height={13} className="text-blue-500 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">{c.sport} · {c.city}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <IconStar width={11} height={11} className="text-amber-500" />
                    {Number(c.rating).toFixed(1)} · {c.followers.toLocaleString("pt-BR")} seguidores
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">a partir de</div>
                  <div className="font-black text-emerald-600 text-sm">R${c.pricePerHour}/h</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!me && (
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-7 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-black">CoreMotion — marketplace esportivo B2C + C2C</h2>
          <p className="mt-2 text-slate-300 max-w-2xl mx-auto text-sm md:text-base">
            Lojas oficiais vendem como vitrine digital. Usuários desapegam de equipamentos usados. Comunidades esportivas e notícias completam a plataforma.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5 justify-center">
            <Link href="/cadastro" className="bg-red-500 hover:bg-red-600 font-bold px-6 py-3 rounded-full text-sm">Criar conta com e-mail real</Link>
            <Link href="/login" className="border border-white/40 hover:bg-white/10 font-bold px-6 py-3 rounded-full text-sm">Entrar</Link>
          </div>
        </section>
      )}

      <footer className="pt-6 pb-8 border-t border-slate-200 text-xs text-slate-400">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6">
          <div>CoreMotion © 2026 · Marketplace esportivo B2C + C2C · Lojas, desapego, comunidades e notícias</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <span>Trocas em 30 dias</span>
            <span>Frete grátis acima de R$249</span>
            <span>PIX 5% off</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

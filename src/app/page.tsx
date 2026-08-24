import Link from "next/link";
import { db } from "@/db";
import { products, news, stores, listings } from "@/db/schema";
import { desc, and, eq, isNotNull, sql, lt } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconArrowRight, IconBag, IconUsers, IconShield, IconTruck, IconCreditCard } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeed();
  const me = await getCurrentUser();

  let featuredProducts: any[] = [];
  let recentNews: any[] = [];
  let verifiedStores: any[] = [];
  let recentC2C: any[] = [];

  try {
    [featuredProducts, recentNews, verifiedStores, recentC2C] = await Promise.all([
      db.select().from(products).where(eq(products.active, true)).limit(8),
      db.select().from(news).where(eq(news.featured, true)).limit(2),
      db.select().from(stores).where(and(eq(stores.active, true), eq(stores.verified, true))).limit(4),
      db.select().from(listings).where(eq(listings.status, "published")).limit(4),
    ]);
  } catch (e) {
    console.error("Home page query error:", e);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="relative px-4 md:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Tudo para o seu esporte.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              Encontre produtos de lojas oficiais e atletas. Compre, venda e conecte-se com a comunidade esportiva.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-full hover:bg-slate-100 transition">
                Explorar marketplace <IconArrowRight width={18} height={18} />
              </Link>
              <Link href="/desapego" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-600 transition">
                <IconUsers width={18} height={18} /> Ver desapego
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges - only show what's real */}
      <section className="px-4 md:px-8 py-8 border-b border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: IconShield, t: "Compra segura", d: "Proteção ao comprador" },
            { Icon: IconCreditCard, t: "Pagamento flexível", d: "Até 10x sem juros" },
            { Icon: IconTruck, t: "Entrega rápida", d: "Todo o Brasil" },
            { Icon: IconUsers, t: "Comunidade ativa", d: "Milhares de atletas" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center">
                <Icon width={20} height={20} className="text-slate-700" />
              </div>
              <div>
                <div className="text-sm font-bold">{t}</div>
                <div className="text-[11px] text-slate-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="px-4 md:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Destaques</h2>
            <p className="text-sm text-slate-500 mt-1">Produtos selecionados para você</p>
          </div>
          <Link href="/marketplace" className="text-sm font-bold text-red-600 hover:underline">Ver tudo</Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-200 grid place-items-center text-slate-400 mb-3">
              <IconBag width={24} height={24} />
            </div>
            <div className="font-bold">Nenhum produto disponível</div>
            <p className="text-sm text-slate-500 mt-1">Volte em breve para conferir novidades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Verified stores - only show if exist */}
      {verifiedStores.length > 0 && (
        <section className="px-4 md:px-8 py-12 bg-slate-50">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Lojas verificadas</h2>
              <p className="text-sm text-slate-500 mt-1">Lojas certificadas pelo CoreMotion</p>
            </div>
            <Link href="/lojas" className="text-sm font-bold text-red-600 hover:underline">Ver todas</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {verifiedStores.map((s) => (
              <Link key={s.id} href={`/loja/${s.slug}`} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"} alt={s.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold truncate">{s.name}</span>
                      <VerifiedBadge size="sm" withLabel={false} />
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{s.city} {s.state && `- ${s.state}`}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 line-clamp-2">{s.shortDescription || s.description}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent C2C listings */}
      {recentC2C.length > 0 && (
        <section className="px-4 md:px-8 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Desapego recente</h2>
              <p className="text-sm text-slate-500 mt-1">Produtos de atletas como você</p>
            </div>
            <Link href="/desapego" className="text-sm font-bold text-red-600 hover:underline">Ver tudo</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentC2C.map((l) => (
              <Link key={l.id} href={`/desapego/${l.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.images[0] || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"} alt={l.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">{l.condition}</div>
                  <div className="font-semibold text-sm line-clamp-2 mt-0.5">{l.title}</div>
                  <div className="text-lg font-black text-slate-900 mt-1">R$ {Number(l.price).toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{l.city} {l.state && `- ${l.state}`}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* News */}
      {recentNews.length > 0 && (
        <section className="px-4 md:px-8 py-12 bg-slate-50">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Notícias do esporte</h2>
              <p className="text-sm text-slate-500 mt-1">Acompanhe o que acontece no mundo esportivo</p>
            </div>
            <Link href="/noticias" className="text-sm font-bold text-red-600 hover:underline">Ver todas</Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {recentNews.map((n) => (
              <Link key={n.id} href={`/noticias/${n.slug}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-video md:aspect-auto bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 md:w-2/3 flex flex-col justify-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500">{n.sport} · {n.source}</div>
                  <h3 className="font-bold text-lg mt-1 line-clamp-2">{n.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{n.excerpt}</p>
                  <div className="text-[11px] text-slate-400 mt-3">{new Date(n.publishedAt).toLocaleDateString("pt-BR")}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA for non-authenticated */}
      {!me && (
        <section className="px-4 md:px-8 py-16">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-black">Faça parte do CoreMotion</h2>
            <p className="text-slate-300 mt-3 max-w-xl mx-auto">Crie sua conta grátis para comprar, vender e conectar-se com atletas de todo o Brasil.</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/cadastro" className="bg-red-500 hover:bg-red-600 font-bold px-6 py-3 rounded-full">Criar conta</Link>
              <Link href="/login" className="border border-white/40 hover:bg-white/10 font-bold px-6 py-3 rounded-full">Entrar</Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-4 md:px-8 py-12 border-t border-slate-200 text-sm text-slate-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>CoreMotion © {new Date().getFullYear()} — Marketplace esportivo</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <span>Termos de uso</span>
            <span>Privacidade</span>
            <span>Segurança</span>
            <span>Contato</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

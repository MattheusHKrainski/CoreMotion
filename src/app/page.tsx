import Link from "next/link";
import { db } from "@/db";
import { products, stores, listings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconArrowRight, IconBag, IconUsers, IconShield, IconCreditCard, IconZap, IconTrendingUp } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const me = await getCurrentUser();

  let featuredProducts: any[] = [];
  let verifiedStores: any[] = [];
  let recentC2C: any[] = [];

  try {
    [featuredProducts, verifiedStores, recentC2C] = await Promise.all([
      db.select().from(products).where(eq(products.active, true)).orderBy(desc(products.featured)).limit(8),
      db.select().from(stores).where(eq(stores.verified, true)).limit(4),
      db.select().from(listings).where(eq(listings.status, "published")).limit(4),
    ]);
  } catch (e) {
    console.error("Home page query error:", e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <section className="gradient-red text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full mb-6">
              <IconZap width={16} height={16} className="text-white" />
              <span className="text-sm font-semibold">Marketplace Esportivo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              SUA PERFORMANCE
              <br />
              EM MOVIMENTO
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              Lojas oficiais, desapego entre atletas, comunidade e treinadores.
              Tudo do esporte em um só lugar.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/marketplace" className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition inline-flex items-center gap-2">
                Explorar produtos <IconArrowRight width={20} height={20} />
              </Link>
              <Link href="/desapego" className="bg-emerald-500 text-white font-bold px-8 py-4 rounded-lg hover:bg-emerald-600 transition inline-flex items-center gap-2">
                <IconUsers width={20} height={20} /> Desapego
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
              {[
                { num: "10K+", label: "Produtos" },
                { num: "500+", label: "Lojas" },
                { num: "50K+", label: "Atletas" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-black">{stat.num}</div>
                  <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="px-4 md:px-8 py-12 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: IconShield, t: "Compra segura", d: "Proteção total" },
              { Icon: IconCreditCard, t: "12x sem juros", d: "Todos cartões" },
              { Icon: IconZap, t: "Entrega rápida", d: "Todo Brasil" },
              { Icon: IconTrendingUp, t: "Melhores preços", d: "Garantido" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm grid place-items-center text-red-600">
                  <Icon width={24} height={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t}</div>
                  <div className="text-xs text-gray-500">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="px-4 md:px-8 py-20 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <IconTrendingUp width={14} height={14} />
                EM ALTA
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                Produtos em Destaque
              </h2>
              <p className="text-sm text-gray-500 mt-3 max-w-md">
                Selecionados especialmente para você.
              </p>
            </div>
            <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2 self-start">
              Ver todos <IconArrowRight width={18} height={18} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 grid place-items-center text-gray-400 mb-6">
                <IconBag width={40} height={40} />
              </div>
              <div className="font-bold text-xl text-gray-900">Em breve</div>
              <p className="text-sm text-gray-500 mt-2">Novos produtos chegando.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="px-4 md:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
              Categorias
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              Encontre exatamente o que precisa
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Corrida" },
              { name: "Futebol" },
              { name: "Basquete" },
              { name: "Treino" },
              { name: "Natação" },
              { name: "Ciclismo" },
              { name: "Tênis" },
              { name: "Luta" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="group p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition text-center border border-gray-200"
              >
                <div className="font-bold text-gray-900 group-hover:text-red-600 transition">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VERIFIED STORES ===== */}
      {verifiedStores.length > 0 && (
        <section className="px-4 md:px-8 py-20 gradient-subtle">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <IconShield width={14} height={14} />
                  VERIFICADAS
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                  Lojas Oficiais
                </h2>
                <p className="text-sm text-gray-500 mt-3 max-w-md">
                  Marcas certificadas pelo CoreMotion.
                </p>
              </div>
              <Link href="/lojas" className="btn-primary inline-flex items-center gap-2 self-start">
                Ver todas <IconArrowRight width={18} height={18} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {verifiedStores.map((s) => (
                <Link key={s.id} href={`/loja/${s.slug}`} className="card p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"} alt={s.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate text-gray-900">{s.name}</span>
                        <VerifiedBadge size="sm" withLabel={false} />
                      </div>
                      <div className="text-xs text-gray-500 truncate">{s.city} {s.state && `- ${s.state}`}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">{s.shortDescription || s.description}</div>
                  <div className="mt-4 text-xs font-bold text-red-600 group-hover:underline inline-flex items-center gap-1">
                    Visitar loja <IconArrowRight width={12} height={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== C2C ===== */}
      {recentC2C.length > 0 && (
        <section className="px-4 md:px-8 py-20 gradient-dark text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <IconUsers width={14} height={14} />
                  OPORTUNIDADES
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  De Outros Atletas
                </h2>
                <p className="text-sm text-gray-400 mt-3 max-w-md">
                  Produtos usados em ótimo estado.
                </p>
              </div>
              <Link href="/desapego" className="btn-primary inline-flex items-center gap-2 self-start">
                Ver tudo <IconArrowRight width={18} height={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentC2C.map((l) => (
                <Link key={l.id} href={`/desapego/${l.id}`} className="card overflow-hidden group">
                  <div className="aspect-square bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.images[0] || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 bg-white">
                    <div className="text-xs uppercase font-bold text-emerald-600 mb-1">{l.condition}</div>
                    <div className="font-semibold text-sm line-clamp-2 text-gray-900">{l.title}</div>
                    <div className="text-xl font-black text-red-600 mt-2">R$ {Number(l.price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{l.city} {l.state && `- ${l.state}`}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      {!me && (
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="gradient-red rounded-2xl p-8 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-5xl font-black">
                Faça Parte do CoreMotion
              </h2>
              <p className="text-gray-200 mt-4 max-w-xl mx-auto text-lg">
                Crie sua conta grátis para comprar, vender e conectar-se.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/cadastro" className="bg-white text-red-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition">
                  Criar conta grátis
                </Link>
                <Link href="/login" className="border-2 border-white/40 hover:bg-white/10 font-bold px-8 py-4 rounded-lg transition">
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="px-4 md:px-8 py-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="font-black text-3xl text-red-600">CoreMotion</div>
              <p className="text-sm text-gray-500 mt-3 max-w-xs">
                Seu marketplace esportivo.
              </p>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Comprar</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/marketplace">Marketplace</Link></li>
                <li><Link href="/lojas">Lojas</Link></li>
                <li><Link href="/desapego">Oportunidades</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Vender</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/desapego">Publicar produto</Link></li>
                <li><Link href="/minha-loja">Criar loja</Link></li>
                <li><Link href="/vender/meus-anuncios">Meus anúncios</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Ajuda</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/ajuda">Central de ajuda</Link></li>
                <li><Link href="/contato">Contato</Link></li>
                <li><Link href="/termos">Termos de uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>CoreMotion © {new Date().getFullYear()}</div>
            <div className="flex flex-wrap gap-6 justify-center">
              <span>Privacidade</span>
              <span>Termos</span>
              <span>Segurança</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

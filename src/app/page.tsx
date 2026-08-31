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
    <div className="min-h-screen">
      {/* ===== INNOVATIVE HERO ===== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-racing-green/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-racing-green-neon/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] hero-pattern opacity-30" />
        </div>

        {/* Content */}
        <div className="relative px-4 md:px-8 py-32 md:py-48">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-8 animate-float">
              <IconZap width={16} height={16} className="text-racing-green-neon" />
              <span className="text-sm font-bold">Marketplace Esportivo Premium</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
              O ESPORTE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-green-neon to-racing-green-accent">
                EM MOVIMENTO
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A plataforma definitiva para atletas. Compre de lojas oficiais, 
              venda seus equipamentos e conecte-se com a comunidade esportiva.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/marketplace" className="btn-neon inline-flex items-center gap-2">
                Explorar produtos <IconArrowRight width={20} height={20} />
              </Link>
              <Link href="/vender" className="btn-secondary inline-flex items-center gap-2">
                <IconUsers width={20} height={20} /> Vender agora
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16">
              {[
                { num: "10K+", label: "Produtos" },
                { num: "500+", label: "Lojas" },
                { num: "50K+", label: "Atletas" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-white">{stat.num}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-racing-green-neon rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="px-4 md:px-8 py-12 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: IconShield, t: "Compra 100% segura", d: "Proteção total ao comprador", color: "text-racing-green" },
              { Icon: IconCreditCard, t: "Até 12x sem juros", d: "Todos os cartões", color: "text-racing-green" },
              { Icon: IconZap, t: "Entrega rápida", d: "Todo o Brasil", color: "text-racing-green-neon" },
              { Icon: IconTrendingUp, t: "Melhores preços", d: "Garantia de economia", color: "text-racing-green" },
            ].map(({ Icon, t, d, color }) => (
              <div key={t} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition">
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-premium grid place-items-center ${color}`}>
                  <Icon width={28} height={28} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t}</div>
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
              <div className="inline-flex items-center gap-2 bg-racing-green text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <IconTrendingUp width={14} height={14} />
                EM ALTA
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                Produtos em Destaque
              </h2>
              <p className="text-sm text-gray-500 mt-3 max-w-md">
                Selecionados especialmente para você. Qualidade garantida e os melhores preços do mercado.
              </p>
            </div>
            <Link href="/marketplace" className="btn-primary inline-flex items-center gap-2 self-start">
              Ver todos <IconArrowRight width={18} height={18} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 grid place-items-center text-gray-400 mb-6">
                <IconBag width={40} height={40} />
              </div>
              <div className="font-bold text-xl text-gray-900">Em breve</div>
              <p className="text-sm text-gray-500 mt-2">Novos produtos estão chegando. Volte em breve!</p>
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
              Encontre exatamente o que você precisa
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Corrida", icon: "🏃", color: "from-blue-500 to-blue-600" },
              { name: "Futebol", icon: "⚽", color: "from-green-500 to-green-600" },
              { name: "Basquete", icon: "🏀", color: "from-orange-500 to-orange-600" },
              { name: "Treino", icon: "💪", color: "from-red-500 to-red-600" },
              { name: "Natação", icon: "🏊", color: "from-cyan-500 to-cyan-600" },
              { name: "Ciclismo", icon: "🚴", color: "from-yellow-500 to-yellow-600" },
              { name: "Tênis", icon: "🎾", color: "from-lime-500 to-lime-600" },
              { name: "Luta", icon: "", color: "from-purple-500 to-purple-600" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-3xl p-8 text-center transition hover:shadow-premium-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition`} />
                <div className="text-5xl mb-4">{cat.icon}</div>
                <div className="font-bold text-gray-900 group-hover:text-racing-green transition">{cat.name}</div>
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
                <div className="inline-flex items-center gap-2 bg-racing-green text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <IconShield width={14} height={14} />
                  VERIFICADAS
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                  Lojas Oficiais
                </h2>
                <p className="text-sm text-gray-500 mt-3 max-w-md">
                  Marcas certificadas pelo CoreMotion. Qualidade e procedência garantidas.
                </p>
              </div>
              <Link href="/lojas" className="btn-primary inline-flex items-center gap-2 self-start">
                Ver todas <IconArrowRight width={18} height={18} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {verifiedStores.map((s) => (
                <Link key={s.id} href={`/loja/${s.slug}`} className="card-premium p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"} alt={s.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{s.name}</span>
                        <VerifiedBadge size="sm" withLabel={false} />
                      </div>
                      <div className="text-xs text-gray-500 truncate">{s.city} {s.state && `- ${s.state}`}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2">{s.shortDescription || s.description}</div>
                  <div className="mt-4 text-xs font-bold text-racing-green group-hover:underline inline-flex items-center gap-1">
                    Visitar loja <IconArrowRight width={12} height={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== C2C OPPORTUNITIES ===== */}
      {recentC2C.length > 0 && (
        <section className="px-4 md:px-8 py-20 bg-gray-950 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-racing-green-neon text-racing-green-dark text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <IconUsers width={14} height={14} />
                  OPORTUNIDADES
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                  De Outros Atletas
                </h2>
                <p className="text-sm text-gray-400 mt-3 max-w-md">
                  Produtos usados em ótimo estado. Economia e sustentabilidade.
                </p>
              </div>
              <Link href="/vender" className="btn-neon inline-flex items-center gap-2 self-start">
                Ver tudo <IconArrowRight width={18} height={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentC2C.map((l) => (
                <Link key={l.id} href={`/vender/${l.id}`} className="card-premium overflow-hidden group">
                  <div className="aspect-square bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.images[0] || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"} alt={l.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="text-xs uppercase font-bold text-racing-green mb-1">{l.condition}</div>
                    <div className="font-semibold text-sm line-clamp-2 text-gray-900">{l.title}</div>
                    <div className="text-xl font-black text-racing-green mt-2">R$ {Number(l.price).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">{l.city} {l.state && `- ${l.state}`}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      {!me && (
        <section className="px-4 md:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="gradient-racing rounded-[2.5rem] p-8 md:p-16 text-white text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-racing-green-neon/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-black">
                  Faça Parte do CoreMotion
                </h2>
                <p className="text-gray-300 mt-4 max-w-xl mx-auto text-lg">
                  Crie sua conta grátis para comprar, vender e conectar-se com atletas de todo o Brasil.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link href="/cadastro" className="bg-white text-racing-green font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition shadow-premium-lg">
                    Criar conta grátis
                  </Link>
                  <Link href="/login" className="border-2 border-white/40 hover:bg-white/10 font-bold px-8 py-4 rounded-full transition">
                    Já tenho conta
                  </Link>
                </div>
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
              <div className="font-black text-3xl text-racing-green">CoreMotion</div>
              <p className="text-sm text-gray-500 mt-3 max-w-xs">
                Seu marketplace esportivo premium. Compre de lojas oficiais e atletas. Venda seus equipamentos.
              </p>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Comprar</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/marketplace" className="hover:text-racing-green">Marketplace</Link></li>
                <li><Link href="/lojas" className="hover:text-racing-green">Lojas</Link></li>
                <li><Link href="/vender" className="hover:text-racing-green">Oportunidades</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Vender</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/vender" className="hover:text-racing-green">Publicar produto</Link></li>
                <li><Link href="/minha-loja" className="hover:text-racing-green">Criar loja</Link></li>
                <li><Link href="/vender/meus-anuncios" className="hover:text-racing-green">Meus anúncios</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-sm mb-4 text-gray-900">Ajuda</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/ajuda" className="hover:text-racing-green">Central de ajuda</Link></li>
                <li><Link href="/contato" className="hover:text-racing-green">Contato</Link></li>
                <li><Link href="/termos" className="hover:text-racing-green">Termos de uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>CoreMotion © {new Date().getFullYear()} — Marketplace esportivo premium</div>
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

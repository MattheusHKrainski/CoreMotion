import Link from "next/link";
import { db } from "@/db";
import { products, stores, listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { IconArrowRight, IconBag, IconUsers, IconShield, IconCreditCard } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const me = await getCurrentUser();

  let featuredProducts: any[] = [];
  let verifiedStores: any[] = [];
  let recentC2C: any[] = [];

  try {
    [featuredProducts, verifiedStores, recentC2C] = await Promise.all([
      db.select().from(products).where(eq(products.active, true)).limit(8),
      db.select().from(stores).where(eq(stores.verified, true)).limit(4),
      db.select().from(listings).where(eq(listings.status, "published")).limit(4),
    ]);
  } catch (e) {
    console.error("Home page query error:", e);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-racing text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="relative px-4 md:px-8 py-28 md:py-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              O esporte
              <br />
              <span className="text-white/80">em movimento.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl">
              Produtos, marcas, atletas e oportunidades em um só lugar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-racing-green font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition shadow-premium-lg">
                Comprar agora <IconArrowRight width={20} height={20} />
              </Link>
              <Link href="/vender" className="inline-flex items-center gap-2 bg-racing-green-accent text-white font-bold px-8 py-4 rounded-full border border-white/30 hover:bg-racing-green-light transition">
                <IconUsers width={20} height={20} /> Vender produto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-4 md:px-8 py-12 border-b border-gray-200 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { Icon: IconShield, t: "Compra segura", d: "Proteção ao comprador" },
            { Icon: IconCreditCard, t: "Até 10x sem juros", d: "Cartões de crédito" },
            { Icon: IconBag, t: "Lojas oficiais", d: "Marcas verificadas" },
            { Icon: IconUsers, t: "Comunidade ativa", d: "Milhares de atletas" },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 grid place-items-center">
                <Icon width={24} height={24} className="text-racing-green" />
              </div>
              <div>
                <div className="text-sm font-bold">{t}</div>
                <div className="text-xs text-gray-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Destaques</h2>
            <p className="text-sm text-gray-500 mt-2">Produtos selecionados para você</p>
          </div>
          <Link href="/marketplace" className="text-sm font-bold text-racing-green hover:underline inline-flex items-center gap-1">
            Ver tudo <IconArrowRight width={16} height={16} />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-gray-100 rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-200 grid place-items-center text-gray-400 mb-4">
              <IconBag width={32} height={32} />
            </div>
            <div className="font-bold text-lg">Nenhum produto disponível</div>
            <p className="text-sm text-gray-500 mt-2">Volte em breve para conferir novidades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Verified stores */}
      {verifiedStores.length > 0 && (
        <section className="px-4 md:px-8 py-16 bg-gray-100">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Lojas verificadas</h2>
              <p className="text-sm text-gray-500 mt-2">Lojas certificadas pelo CoreMotion</p>
            </div>
            <Link href="/lojas" className="text-sm font-bold text-racing-green hover:underline inline-flex items-center gap-1">
              Ver todas <IconArrowRight width={16} height={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verifiedStores.map((s) => (
              <Link key={s.id} href={`/loja/${s.slug}`} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"} alt={s.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate">{s.name}</span>
                      <VerifiedBadge size="sm" withLabel={false} />
                    </div>
                    <div className="text-xs text-gray-500 truncate">{s.city} {s.state && `- ${s.state}`}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 line-clamp-2">{s.shortDescription || s.description}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* C2C listings */}
      {recentC2C.length > 0 && (
        <section className="px-4 md:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Oportunidades</h2>
              <p className="text-sm text-gray-500 mt-2">Produtos de atletas como você</p>
            </div>
            <Link href="/vender" className="text-sm font-bold text-racing-green hover:underline inline-flex items-center gap-1">
              Ver tudo <IconArrowRight width={16} height={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentC2C.map((l) => (
              <Link key={l.id} href={`/vender/${l.id}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.images[0] || "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"} alt={l.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase font-bold text-racing-green">{l.condition}</div>
                  <div className="font-semibold text-sm mt-1 line-clamp-2">{l.title}</div>
                  <div className="text-xl font-black text-gray-900 mt-2">R$ {Number(l.price).toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">{l.city} {l.state && `- ${l.state}`}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {!me && (
        <section className="px-4 md:px-8 py-20">
          <div className="gradient-racing rounded-3xl p-8 md:p-16 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-black">Faça parte do CoreMotion</h2>
            <p className="text-gray-300 mt-4 max-w-2xl mx-auto text-lg">
              Crie sua conta grátis para comprar, vender e conectar-se com atletas de todo o Brasil.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/cadastro" className="bg-white text-racing-green font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition">
                Criar conta
              </Link>
              <Link href="/login" className="border border-white/40 hover:bg-white/10 font-bold px-8 py-4 rounded-full transition">
                Entrar
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-4 md:px-8 py-16 border-t border-gray-200 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="font-black text-2xl text-racing-green">CoreMotion</div>
            <p className="text-sm text-gray-500 mt-3 max-w-xs">
              Seu marketplace esportivo. Compre de lojas oficiais e atletas. Venda seus equipamentos.
            </p>
          </div>
          <div>
            <div className="font-bold text-sm mb-4">Comprar</div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/marketplace" className="hover:text-racing-green">Marketplace</Link></li>
              <li><Link href="/lojas" className="hover:text-racing-green">Lojas</Link></li>
              <li><Link href="/vender" className="hover:text-racing-green">Oportunidades</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm mb-4">Vender</div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/vender" className="hover:text-racing-green">Publicar produto</Link></li>
              <li><Link href="/minha-loja" className="hover:text-racing-green">Criar loja</Link></li>
              <li><Link href="/vender/meus-anuncios" className="hover:text-racing-green">Meus anúncios</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm mb-4">Ajuda</div>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/ajuda" className="hover:text-racing-green">Central de ajuda</Link></li>
              <li><Link href="/contato" className="hover:text-racing-green">Contato</Link></li>
              <li><Link href="/termos" className="hover:text-racing-green">Termos de uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>CoreMotion © {new Date().getFullYear()} — Marketplace esportivo</div>
          <div className="flex flex-wrap gap-6 justify-center">
            <span>Privacidade</span>
            <span>Termos</span>
            <span>Segurança</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

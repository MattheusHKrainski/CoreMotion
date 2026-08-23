import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { stores, products, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import ProductCard from "@/components/ProductCard";
import Avatar from "@/components/Avatar";
import { IconVerified, IconPin, IconArrowLeft, IconBag, IconMail, IconShield } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function LojaPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureSeed();
  const { slug } = await params;

  const [store] = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      shortDescription: stores.shortDescription,
      category: stores.category,
      logo: stores.logo,
      banner: stores.banner,
      email: stores.email,
      phone: stores.phone,
      city: stores.city,
      state: stores.state,
      social: stores.social,
      rating: stores.rating,
      followers: stores.followers,
      productCount: stores.productCount,
      verified: stores.verified,
      active: stores.active,
      ownerName: users.name,
      ownerAvatar: users.avatar,
      ownerHandle: users.handle,
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id))
    .where(eq(stores.slug, slug))
    .limit(1);

  if (!store || !store.active) notFound();

  const list = await db.select().from(products).where(and(eq(products.storeId, store.id), eq(products.active, true)));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Cabeçalho vitrine */}
      <div className="relative h-64 md:h-80 bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <Link href="/lojas" className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <IconArrowLeft width={14} height={14} /> Voltar
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end gap-4">
          <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-2" />
          </div>
          <div className="min-w-0 flex-1 text-white">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{store.name}</h1>
              {store.verified && <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full"><IconVerified width={12} height={12} /> Loja verificada</span>}
            </div>
            <p className="text-white/90 text-sm md:text-base mt-1 max-w-2xl line-clamp-2">{store.shortDescription || store.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-bold">{store.category}</span>
              <span className="flex items-center gap-1"><IconPin width={12} height={12} /> {store.city}{store.state ? `, ${store.state}` : ""}</span>
              <span>★ {Number(store.rating).toFixed(1)} · {store.followers.toLocaleString("pt-BR")} seguidores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Produtos */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Produtos da loja</h2>
            <span className="text-sm text-slate-500">{list.length} itens</span>
          </div>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 grid place-items-center text-slate-400"><IconBag width={24} height={24} /></div>
              <div className="mt-3 font-bold">Nenhum produto ainda</div>
              <p className="text-sm text-slate-500 mt-1">Esta loja ainda não cadastrou produtos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-black">Sobre a loja</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{store.description || store.shortDescription}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-black mb-3">Informações</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center shrink-0"><IconPin width={16} height={16} /></div>
                <div>
                  <div className="font-bold">Localização</div>
                  <div className="text-slate-600">{store.city}{store.state ? ` - ${store.state}` : ""}</div>
                </div>
              </div>
              {store.email && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center shrink-0"><IconMail width={16} height={16} /></div>
                  <div>
                    <div className="font-bold">Contato</div>
                    <div className="text-slate-600 text-xs">{store.email}</div>
                    {store.phone && <div className="text-slate-600 text-xs mt-0.5">{store.phone}</div>}
                  </div>
                </div>
              )}
              {store.social && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center shrink-0"><IconShield width={16} height={16} /></div>
                  <div>
                    <div className="font-bold">Redes sociais</div>
                    <div className="text-slate-600 text-xs">{store.social}</div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center shrink-0">
                  <Avatar src={store.ownerAvatar} name={store.ownerName} size={28} />
                </div>
                <div>
                  <div className="font-bold">Vendedor</div>
                  <div className="text-slate-600 text-xs">{store.ownerName} · @{store.ownerHandle}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-5 text-white">
            <div className="font-black">Compre com segurança</div>
            <p className="text-sm text-white/80 mt-1">Pedidos processados pelo CoreMotion com proteção ao comprador e trocas em 30 dias.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, reviews, wishlist, stores, users } from "@/db/schema";
import { and, eq, ne, desc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { money } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import ProductBuyBox from "./ProductBuyBox";
import ReviewForm from "./ReviewForm";
import {
  IconStar,
  IconStarOutline,
  IconTruck,
  IconShield,
  IconRefresh,
  IconScan,
  IconCheck,
  IconVerified,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureSeed();
  const { slug } = await params;

  const [row] = await db
    .select({
      product: products,
      store: stores,
      ownerName: users.name,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(users, eq(stores.ownerId, users.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!row || !row.product.active) notFound();
  const product = row.product;
  const store = row.store;
  const me = await getCurrentUser();

  const [productReviews, related, fav] = await Promise.all([
    db.select().from(reviews).where(eq(reviews.productId, product.id)).orderBy(desc(reviews.createdAt)).limit(10),
    db.select().from(products).where(and(eq(products.category, product.category), ne(products.id, product.id), eq(products.active, true))).limit(4),
    me
      ? db.select({ id: wishlist.id }).from(wishlist).where(and(eq(wishlist.userId, me.id), eq(wishlist.productId, product.id))).limit(1)
      : Promise.resolve([]),
  ]);

  const discount = product.oldPrice && Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100);
  const pixPrice = Number(product.price) * 0.95;
  const gallery = product.gallery.length ? product.gallery : [product.image];

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => r.rating === star).length,
  }));
  const totalR = productReviews.length || 1;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <nav className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">Início</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-red-600">Marketplace</Link>
        {store && (
          <>
            <span>/</span>
            <Link href={`/lojas/${store.slug}`} className="hover:text-red-600">{store.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[0]} alt={product.name} className="w-full h-full object-contain p-6" />
            {discount ? <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-black px-3 py-1.5 rounded-full">-{discount}%</span> : null}
            {product.badge && <span className="absolute top-4 right-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">{product.badge}</span>}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.slice(0, 4).map((g, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt="" className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-red-600 uppercase tracking-widest">{product.brand}</div>
            {store && (
              <Link href={`/lojas/${store.slug}`} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full font-bold">
                <IconVerified width={12} height={12} className="text-blue-500" /> {store.name}
              </Link>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mt-1">{product.name}</h1>
          <div className="text-sm text-slate-500 mt-1">{product.colorway} · {product.gender} · Cód. {product.scanCode} · EAN {product.ean}</div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (s <= Math.round(Number(product.rating)) ? <IconStar key={s} width={16} height={16} /> : <IconStarOutline key={s} width={16} height={16} className="text-slate-300" />))}
            </div>
            <span className="text-sm font-bold">{Number(product.rating).toFixed(1)}</span>
            <a href="#avaliacoes" className="text-sm text-slate-500 hover:text-red-600">({product.reviewCount} avaliações)</a>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            {product.oldPrice && <div className="text-sm line-through text-slate-400">De {money(product.oldPrice)}</div>}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="text-4xl font-black text-slate-900">{money(product.price)}</div>
              {discount ? <span className="mb-1.5 bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-1 rounded-full">Economize {money(Number(product.oldPrice) - Number(product.price))}</span> : null}
            </div>
            <div className="mt-1 text-sm text-emerald-700 font-bold">{money(pixPrice)} à vista no PIX (5% off)</div>
            <div className="text-sm text-slate-500">ou 10x de {money(Number(product.price) / 10)} sem juros</div>

            <ProductBuyBox productId={product.id} sizes={product.sizes} stock={product.stock} isFavorite={fav.length > 0} isLogged={!!me} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { Icon: IconTruck, t: "Frete grátis", d: "acima de R$249" },
              { Icon: IconRefresh, t: "Troca fácil", d: "em até 30 dias" },
              { Icon: IconShield, t: "100% original", d: store ? store.name : "garantia da marca" },
              { Icon: IconScan, t: "SmartScan", d: `código ${product.scanCode}` },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                <Icon width={19} height={19} className="text-slate-700 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{t}</div>
                  <div className="text-[10px] text-slate-500 truncate">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-xl mb-3">Sobre o produto</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.description}</p>
          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((t) => <span key={t} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{t}</span>)}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-black text-xl mb-3">Especificações técnicas</h2>
          <dl className="divide-y divide-slate-100">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{s.label}</dt>
                <dd className="font-semibold text-right">{s.value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-2.5 text-sm"><dt className="text-slate-500">Código EAN</dt><dd className="font-mono text-right">{product.ean}</dd></div>
            <div className="flex justify-between py-2.5 text-sm"><dt className="text-slate-500">Estoque</dt><dd className="font-semibold text-right">{product.stock > 0 ? `${product.stock} unidades` : "Esgotado"}</dd></div>
          </dl>
        </div>
      </div>

      <section id="avaliacoes" className="mt-10">
        <h2 className="text-2xl font-black tracking-tight mb-4">Avaliações de quem comprou</h2>
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit">
            <div className="text-5xl font-black">{Number(product.rating).toFixed(1)}</div>
            <div className="flex text-amber-500 mt-1">{[1,2,3,4,5].map((s) => (s <= Math.round(Number(product.rating)) ? <IconStar key={s} width={16} height={16} /> : <IconStarOutline key={s} width={16} height={16} className="text-slate-300" />))}</div>
            <div className="text-xs text-slate-500 mt-1">{product.reviewCount} avaliações</div>
            <div className="mt-4 space-y-1.5">
              {[5,4,3,2,1].map((star) => {
                const count = productReviews.filter((r) => r.rating === star).length;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-500">{star}</span>
                    <IconStar width={10} height={10} className="text-amber-500" />
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: `${(count / totalR) * 100}%` }} /></div>
                    <span className="w-5 text-right text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <ReviewForm productId={product.id} isLogged={!!me} />
            {productReviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-white text-xs font-black">{r.authorName.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">{r.authorName}<span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold"><IconCheck width={10} height={10} /> Compra verificada</span></div>
                    <div className="flex text-amber-500">{[1,2,3,4,5].map((s) => (s <= r.rating ? <IconStar key={s} width={12} height={12} /> : <IconStarOutline key={s} width={12} height={12} className="text-slate-300" />))}</div>
                  </div>
                  <div className="ml-auto text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</div>
                </div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{r.comment}</p>
              </div>
            ))}
            {productReviews.length === 0 && <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">Ainda não há avaliações. Seja o primeiro a avaliar!</div>}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-black tracking-tight mb-4">Quem viu, também viu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

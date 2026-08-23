import Link from "next/link";
import { db } from "@/db";
import { cartItems, products, listings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { money } from "@/components/ProductCard";
import CartControls from "./CartControls";
import CheckoutForm from "./CheckoutForm";
import { IconBag, IconTruck } from "@/components/Icons";

export const dynamic = "force-dynamic";

type CartDisplay = {
  cartId: number;
  qty: number;
  size: string;
  href: string;
  name: string;
  brand: string;
  image: string;
  price: string;
  stock: number;
  type: "B2C" | "C2C";
};

export default async function CartPage() {
  const me = await getCurrentUser();
  if (!me) {
    return (
      <EmptyState
        title="Entre para ver seu carrinho"
        desc="Faça login para adicionar produtos e finalizar sua compra."
        cta={{ href: "/login", label: "Entrar na conta" }}
      />
    );
  }

  const raw = await db.select().from(cartItems).where(eq(cartItems.userId, me.id));

  const productIds = raw.filter((r) => r.productId).map((r) => r.productId!) as number[];
  const listingIds = raw.filter((r) => r.listingId).map((r) => r.listingId!) as number[];

  const [prods, lists] = await Promise.all([
    productIds.length ? db.select().from(products).where(inArray(products.id, productIds)) : Promise.resolve([]),
    listingIds.length ? db.select().from(listings).where(inArray(listings.id, listingIds)) : Promise.resolve([]),
  ]);

  const items: CartDisplay[] = raw
    .map((c) => {
      if (c.productId) {
        const p = prods.find((x) => x.id === c.productId);
        if (!p) return null;
        return {
          cartId: c.id,
          qty: c.qty,
          size: c.size,
          href: `/produto/${p.slug}`,
          name: p.name,
          brand: p.brand,
          image: p.image,
          price: p.price,
          stock: p.stock,
          type: "B2C" as const,
        };
      }
      if (c.listingId) {
        const l = lists.find((x) => x.id === c.listingId);
        if (!l) return null;
        return {
          cartId: c.id,
          qty: c.qty,
          size: l.size,
          href: `/desapego/${l.id}`,
          name: l.title,
          brand: l.brand || "Desapego",
          image: l.images[0] || "",
          price: l.price,
          stock: 1,
          type: "C2C" as const,
        };
      }
      return null;
    })
    .filter(Boolean) as CartDisplay[];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        desc="Explore o catálogo e encontre o equipamento certo para o seu esporte."
        cta={{ href: "/marketplace", label: "Ir para a loja" }}
      />
    );
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const shipping = subtotal >= 249 ? 0 : 24.9;
  const missingForFree = Math.max(0, 249 - subtotal);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Carrinho</h1>
      <p className="text-slate-500 text-sm mt-0.5">
        {items.length} {items.length === 1 ? "item" : "itens"} · lojas e desapego
      </p>

      {missingForFree > 0 && (
        <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <IconTruck width={22} height={22} className="text-amber-700 shrink-0" />
          <div className="text-sm text-amber-900">
            Faltam <strong>{money(missingForFree)}</strong> para frete grátis.
          </div>
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.cartId} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4">
              <Link href={i.href} className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt={i.name} className="w-full h-full object-contain p-1.5" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${i.type === "B2C" ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                    {i.type === "B2C" ? "Loja" : "Desapego"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{i.brand}</span>
                </div>
                <Link href={i.href} className="font-bold text-sm hover:text-red-600 line-clamp-2">
                  {i.name}
                </Link>
                <div className="text-xs text-slate-500 mt-0.5">Tam. {i.size}</div>
                <CartControls itemId={i.cartId} qty={i.qty} max={i.stock} />
              </div>
              <div className="text-right shrink-0">
                <div className="font-black">{money(Number(i.price) * i.qty)}</div>
                {i.qty > 1 && <div className="text-[11px] text-slate-500">{money(i.price)} cada</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <CheckoutForm subtotal={subtotal} shipping={shipping} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  cta,
}: {
  title: string;
  desc: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="max-w-md mx-auto p-8 py-20 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
        <IconBag width={30} height={30} />
      </div>
      <h1 className="mt-4 text-2xl font-black">{title}</h1>
      <p className="text-slate-500 mt-1">{desc}</p>
      <Link href={cta.href} className="inline-block mt-5 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full">
        {cta.label}
      </Link>
    </div>
  );
}

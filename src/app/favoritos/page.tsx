import Link from "next/link";
import { db } from "@/db";
import { wishlist, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import { IconHeart } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const me = await getCurrentUser();

  if (!me)
    return (
      <div className="max-w-md mx-auto p-8 py-20 text-center">
        <IconHeart width={40} height={40} className="mx-auto text-slate-400" />
        <h1 className="mt-4 text-2xl font-black">
          Entre para ver seus favoritos
        </h1>
        <Link
          href="/login"
          className="inline-block mt-5 bg-red-600 text-white font-bold px-6 py-3 rounded-full"
        >
          Entrar na conta
        </Link>
      </div>
    );

  const list = await db
    .select({ p: products })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .where(eq(wishlist.userId, me.id))
    .orderBy(desc(wishlist.createdAt));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Favoritos
      </h1>
      <p className="text-slate-500 text-sm mt-0.5">
        {list.length} produto{list.length !== 1 ? "s" : ""} salvo
        {list.length !== 1 ? "s" : ""}
      </p>

      {list.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <IconHeart width={40} height={40} className="mx-auto text-slate-300" />
          <div className="mt-3 font-bold text-lg">
            Você ainda não salvou nada
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Toque no coração dos produtos que quiser acompanhar.
          </p>
          <Link
            href="/marketplace"
            className="inline-block mt-4 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Explorar a loja
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {list.map(({ p }) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

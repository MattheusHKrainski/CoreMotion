import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import { IconPin, IconEye, IconArrowLeft } from "@/components/Icons";
import { addListingToCartAction } from "@/app/actions";
import ListingActions from "./ListingActions";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureSeed();
  const { id } = await params;
  const lid = Number(id);
  if (!lid) notFound();

  const [listing] = await db
    .select({
      id: listings.id,
      sellerId: listings.sellerId,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      condition: listings.condition,
      category: listings.category,
      sport: listings.sport,
      brand: listings.brand,
      size: listings.size,
      images: listings.images,
      city: listings.city,
      status: listings.status,
      views: listings.views,
      createdAt: listings.createdAt,
      sellerName: users.name,
      sellerHandle: users.handle,
      sellerAvatar: users.avatar,
      sellerCity: users.city,
      sellerRating: users.rating,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(eq(listings.id, lid))
    .limit(1);

  if (!listing) notFound();

  await db.update(listings).set({ views: sql`${listings.views} + 1` }).where(eq(listings.id, lid));

  const me = await getCurrentUser();
  const isOwner = me?.id === listing.sellerId;
  const isAdmin = me?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link href="/desapego" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4">
        <IconArrowLeft width={16} height={16} /> Voltar ao desapego
      </Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-contain p-6" />
            <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-full">{listing.condition}</span>
            <span className="absolute top-4 right-4 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full border">{listing.sport}</span>
            {listing.status !== "Ativo" && (
              <div className="absolute inset-0 bg-white/70 grid place-items-center">
                <span className="bg-slate-900 text-white font-bold px-4 py-2 rounded-full">{listing.status}</span>
              </div>
            )}
          </div>

          {listing.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {listing.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="font-black text-lg">Descrição</h2>
            <p className="mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h1 className="text-2xl font-black leading-tight">{listing.title}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {listing.brand} · {listing.category} · Tam. {listing.size}
            </div>
            <div className="mt-4 text-4xl font-black text-emerald-600">R$ {Number(listing.price).toFixed(2)}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><IconEye width={12} height={12} /> {listing.views + 1} visualizações</span>
              <span className="flex items-center gap-1"><IconPin width={12} height={12} /> {listing.city}</span>
            </div>

            <ListingActions
              listingId={listing.id}
              isOwner={isOwner}
              isAdmin={isAdmin}
              isLogged={!!me}
              status={listing.status}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Vendedor</div>
            <div className="flex items-center gap-3">
              <Avatar src={listing.sellerAvatar} name={listing.sellerName} size={52} rounded="2xl" />
              <div>
                <div className="font-black">{listing.sellerName}</div>
                <div className="text-xs text-slate-500">@{listing.sellerHandle} · ★ {Number(listing.sellerRating).toFixed(1)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1"><IconPin width={11} height={11} /> {listing.sellerCity || listing.city}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="bg-slate-900 text-white font-bold text-sm py-2.5 rounded-full">Conversar</button>
              <Link href={`/atletas?sport=${encodeURIComponent(listing.sport)}`} className="text-center border border-slate-200 font-bold text-sm py-2.5 rounded-full hover:border-slate-400">
                Ver perfil
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <div className="font-bold text-sm text-amber-900">Dicas de segurança</div>
            <ul className="mt-1.5 space-y-1 text-xs text-amber-800 list-disc pl-4">
              <li>Combine entrega em local público e movimentado</li>
              <li>Confira o produto antes de pagar</li>
              <li>Desconfie de preços muito abaixo do mercado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { IconVerified, IconPin, IconBag } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  await ensureSeed();

  const list = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      shortDescription: stores.shortDescription,
      logo: stores.logo,
      banner: stores.banner,
      city: stores.city,
      state: stores.state,
      category: stores.category,
      rating: stores.rating,
      followers: stores.followers,
      productCount: stores.productCount,
      verified: stores.verified,
      ownerName: users.name,
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id))
    .where(eq(stores.active, true))
    .orderBy(desc(stores.followers));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Lojas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {list.length} lojas parceiras · produtos oficiais e multimarcas no CoreMotion
          </p>
        </div>
        <Link href="/minha-loja" className="bg-slate-900 hover:bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">
          Minha Loja
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => (
          <Link
            key={s.id}
            href={`/loja/${s.slug}`}
            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition"
          >
            <div className="h-28 bg-slate-100 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[10px] font-black uppercase px-2 py-1 rounded-full">
                {s.category}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 -mt-12 relative">
                <div className="w-14 h-14 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={s.name} className="w-full h-full object-contain p-1" />
                </div>
                <div className="pt-2 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-black truncate">{s.name}</h3>
                    {s.verified && <IconVerified width={14} height={14} className="text-blue-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <IconPin width={11} height={11} /> {s.city}{s.state ? `, ${s.state}` : ""} · por {s.ownerName}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">{s.shortDescription || s.description}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><IconBag width={12} height={12} /> {s.productCount} produtos</span>
                <span>★ {Number(s.rating).toFixed(1)}</span>
                <span>{s.followers.toLocaleString("pt-BR")} seguidores</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-600">Visitar loja →</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row gap-5 items-center">
        <div className="flex-1">
          <h3 className="text-xl font-black">Venda no CoreMotion</h3>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Crie sua loja gratuita, cadastre produtos e venda para atletas de todo o Brasil com checkout e frete integrados.
          </p>
        </div>
        <Link href="/minha-loja" className="bg-red-600 hover:bg-red-700 font-bold px-6 py-3 rounded-full text-sm shrink-0">
          Abrir minha loja
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq, desc, and, ilike, or, SQL } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import Avatar from "@/components/Avatar";
import { IconScan, IconPin, IconEye } from "@/components/Icons";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days}d`;
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function DesapegoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; condition?: string }>;
}) {
  await ensureSeed();
  const { q, sport, condition } = await searchParams;

  const wheres: SQL[] = [eq(listings.status, "Ativo")];
  if (sport) wheres.push(eq(listings.sport, sport));
  if (condition) wheres.push(eq(listings.condition, condition));
  if (q) {
    const like = `%${q}%`;
    wheres.push(
      or(
        ilike(listings.title, like),
        ilike(listings.brand, like),
        ilike(listings.description, like),
      )!,
    );
  }

  const list = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      price: listings.price,
      condition: listings.condition,
      sport: listings.sport,
      brand: listings.brand,
      size: listings.size,
      images: listings.images,
      city: listings.city,
      views: listings.views,
      createdAt: listings.createdAt,
      sellerName: users.name,
      sellerAvatar: users.avatar,
      sellerHandle: users.handle,
    })
    .from(listings)
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(and(...wheres))
    .orderBy(desc(listings.createdAt));

  const qs = (patch: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    const merged: Record<string, string | undefined> = { q, sport, condition, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && usp.set(k, v));
    const s = usp.toString();
    return s ? `/desapego?${s}` : "/desapego";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
            Desapego esportivo
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">Desapego</h1>
          <p className="text-slate-500 text-sm">
            Compre e venda diretamente entre atletas. Reutilize equipamentos que ainda têm muita vida.
          </p>
        </div>
        <Link href="/desapego/novo" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-full">
          + Anunciar produto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { l: "Todos", href: qs({ sport: undefined }) },
          ...["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf"].map((s) => ({
            l: s,
            href: qs({ sport: s }),
          })),
        ].map((f) => {
          const active = (sport ?? "Todos") === f.l || (!sport && f.l === "Todos");
          return (
            <Link
              key={f.l}
              href={f.href}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"}`}
            >
              {f.l}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["Novo", "Seminovo", "Usado"].map((c) => {
          const active = condition === c;
          return (
            <Link
              key={c}
              href={qs({ condition: active ? undefined : c })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
            >
              {c}
            </Link>
          );
        })}
        <form action="/desapego" className="ml-auto flex gap-2">
          {sport && <input type="hidden" name="sport" value={sport} />}
          {condition && <input type="hidden" name="condition" value={condition} />}
          <input name="q" defaultValue={q} placeholder="Buscar no desapego..." className="rounded-full border border-slate-200 px-4 py-1.5 text-xs w-56" />
          <button className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full">Buscar</button>
        </form>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="font-bold text-lg">Nenhum anúncio encontrado</div>
          <p className="text-slate-500 text-sm mt-1">Seja o primeiro a desapegar de um item esportivo.</p>
          <Link href="/desapego/novo" className="inline-block mt-4 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">
            Criar anúncio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {list.map((l) => (
            <Link key={l.id} href={`/desapego/${l.id}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col">
              <div className="relative aspect-square bg-white border-b border-slate-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.images[0]} alt={l.title} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <span className="absolute top-2.5 left-2.5 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {l.condition}
                </span>
                <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full">
                  {l.sport}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col">
                <div className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{l.title}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {l.brand} · Tam. {l.size}
                </div>
                <div className="mt-2 text-lg font-black text-emerald-600">R$ {Number(l.price).toFixed(2)}</div>
                <div className="mt-auto pt-2.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <Avatar src={l.sellerAvatar} name={l.sellerName} size={20} />
                  <span className="truncate">{l.sellerName}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <IconEye width={11} height={11} /> {l.views}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <IconPin width={10} height={10} /> {l.city} · {timeAgo(l.createdAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 grid place-items-center text-white shrink-0">
          <IconScan width={20} height={20} />
        </div>
        <div className="flex-1">
          <div className="font-black">Como funciona o desapego</div>
          <p className="text-sm text-slate-600">Anuncie seu usado, negocie direto com o comprador e combine entrega. O CoreMotion intermedia para segurança.</p>
        </div>
      </div>
    </div>
  );
}

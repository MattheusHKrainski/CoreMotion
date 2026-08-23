import Link from "next/link";
import { db } from "@/db";
import { news } from "@/db/schema";
import { desc, eq, and, SQL } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { IconEye, IconClock, IconNews } from "@/components/Icons";

export const dynamic = "force-dynamic";

const SPORTS = [
  "Todos",
  "Futebol",
  "Corrida",
  "Basquete",
  "Vôlei",
  "Jiu-Jitsu",
  "Surf",
];

function timeAgo(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  await ensureSeed();
  const { sport } = await searchParams;

  const wheres: SQL[] = [];
  if (sport && sport !== "Todos") wheres.push(eq(news.sport, sport));

  const list = await db
    .select()
    .from(news)
    .where(wheres.length ? and(...wheres) : undefined)
    .orderBy(desc(news.publishedAt));

  const [lead, ...rest] = list;
  const trending = [...list].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 grid place-items-center text-white shrink-0">
          <IconNews width={24} height={24} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Notícias do esporte
          </h1>
          <p className="text-slate-500 text-sm">
            O que aconteceu hoje e na semana, direto para você.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-6">
        {SPORTS.map((s) => {
          const active = (sport ?? "Todos") === s;
          return (
            <Link
              key={s}
              href={s === "Todos" ? "/noticias" : `/noticias?sport=${encodeURIComponent(s)}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
          Nenhuma notícia deste esporte por enquanto.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {/* Lead */}
            {lead && (
              <Link
                href={`/noticias/${lead.slug}`}
                className="group block rounded-3xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl transition"
              >
                <div className="relative aspect-[16/9] bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.image}
                    alt={lead.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-5 md:p-7 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Destaque
                      </span>
                      <span className="bg-white/20 backdrop-blur text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {lead.sport}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black leading-tight">
                      {lead.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/85 line-clamp-2 max-w-2xl">
                      {lead.excerpt}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/70">
                      <span className="flex items-center gap-1">
                        <IconClock width={12} height={12} />
                        {timeAgo(lead.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconEye width={12} height={12} />
                        {lead.views.toLocaleString("pt-BR")}
                      </span>
                      <span>{lead.source}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest */}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {rest.map((n) => (
                <Link
                  key={n.id}
                  href={`/noticias/${n.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition flex flex-col"
                >
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={n.image}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-white text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {n.sport}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold leading-snug group-hover:text-red-600 transition line-clamp-2">
                      {n.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                      {n.excerpt}
                    </p>
                    <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <IconClock width={11} height={11} />
                        {timeAgo(n.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconEye width={11} height={11} />
                        {n.views.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-black mb-3">Mais lidas</h3>
              <ol className="space-y-3">
                {trending.map((t, i) => (
                  <li key={t.id}>
                    <Link
                      href={`/noticias/${t.slug}`}
                      className="flex gap-3 group"
                    >
                      <span className="text-2xl font-black text-slate-200 leading-none">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {t.sport} · {t.views.toLocaleString("pt-BR")} leituras
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-5 text-white">
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                Newsletter
              </div>
              <div className="font-black text-lg mt-1">Resumo da semana</div>
              <p className="text-sm text-white/85 mt-1">
                As principais notícias do esporte todo domingo no seu e-mail.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  placeholder="seu@email.com"
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                />
                <button className="bg-slate-900 hover:bg-black font-bold text-xs px-3 rounded-lg">
                  Assinar
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

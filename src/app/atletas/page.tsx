import Link from "next/link";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { and, eq, ilike, or, SQL } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import AthleteCard from "./AthleteCard";
import { IconTrophy, IconSearch } from "@/components/Icons";

export const dynamic = "force-dynamic";

const SPORTS = ["Todos", "Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf"];
const LEVELS = [
  "Todos",
  "Iniciante",
  "Avançado",
  "Semi-profissional",
  "Profissional",
];

export default async function AthletesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; level?: string; q?: string }>;
}) {
  await ensureSeed();
  const { sport, level, q } = await searchParams;
  const me = await getCurrentUser();

  const wheres: SQL[] = [eq(users.role, "athlete")];
  if (sport && sport !== "Todos") wheres.push(eq(users.sport, sport));
  if (level && level !== "Todos") wheres.push(eq(users.level, level));
  if (q) {
    const like = `%${q}%`;
    const cond = or(
      ilike(users.name, like),
      ilike(users.city, like),
      ilike(users.bio, like),
    );
    if (cond) wheres.push(cond);
  }

  const athletes = await db
    .select()
    .from(users)
    .where(and(...wheres));

  const following = me
    ? await db
        .select({ id: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, me.id))
    : [];
  const followSet = new Set(following.map((f) => f.id));

  const qs = (patch: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    Object.entries({ sport, level, q, ...patch }).forEach(
      ([k, v]) => v && usp.set(k, v),
    );
    const s = usp.toString();
    return s ? `/atletas?${s}` : "/atletas";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 grid place-items-center text-white shrink-0">
          <IconTrophy width={24} height={24} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
            Área de atletas
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Rede de Atletas
          </h1>
          <p className="text-slate-500 text-sm">
            Encontre parceiros de treino, oponentes e inspiração.
          </p>
        </div>
      </div>

      <form action="/atletas" className="relative mb-4">
        {sport && <input type="hidden" name="sport" value={sport} />}
        {level && <input type="hidden" name="level" value={level} />}
        <IconSearch
          width={17}
          height={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, cidade ou palavra-chave..."
          className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        />
      </form>

      <div className="space-y-3 mb-6">
        <Row label="Esporte" items={SPORTS} current={sport ?? "Todos"} param="sport" qs={qs} />
        <Row label="Nível" items={LEVELS} current={level ?? "Todos"} param="level" qs={qs} />
      </div>

      {athletes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="font-bold text-lg">Nenhum atleta encontrado</div>
          <Link
            href="/atletas"
            className="inline-block mt-4 bg-sky-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {athletes.map((a) => (
            <AthleteCard
              key={a.id}
              athlete={{
                id: a.id,
                name: a.name,
                handle: a.handle,
                sport: a.sport,
                city: a.city,
                bio: a.bio,
                avatar: a.avatar,
                level: a.level,
                followers: a.followers,
                rating: a.rating,
                verified: a.verified,
              }}
              isFollowing={followSet.has(a.id)}
              isLogged={!!me}
              isMe={me?.id === a.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  items,
  current,
  param,
  qs,
}: {
  label: string;
  items: string[];
  current: string;
  param: string;
  qs: (p: Record<string, string | undefined>) => string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-16 shrink-0">
        {label}
      </span>
      {items.map((it) => (
        <Link
          key={it}
          href={qs({ [param]: it === "Todos" ? undefined : it })}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
            current === it
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-sky-400"
          }`}
        >
          {it}
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/db";
import { users, coachServices, follows } from "@/db/schema";
import { eq, and, inArray, SQL, lte, or, isNull } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import CoachCard from "./CoachCard";
import { IconWhistle } from "@/components/Icons";

export const dynamic = "force-dynamic";

const SPORTS = ["Todos", "Futebol", "Corrida", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf"];
const MODALITIES = ["Todas", "Presencial", "Online", "Híbrido"];
const PRICES = [
  { l: "Qualquer", v: "" },
  { l: "Até R$150", v: "150" },
  { l: "Até R$200", v: "200" },
  { l: "Até R$300", v: "300" },
];

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; modality?: string; max?: string }>;
}) {
  await ensureSeed();
  const { sport, modality, max } = await searchParams;
  const me = await getCurrentUser();

  const wheres: SQL[] = [eq(users.role, "coach")];
  if (sport && sport !== "Todos") wheres.push(eq(users.sport, sport));
  if (max) {
    const cond = or(lte(users.pricePerHour, Number(max)), isNull(users.pricePerHour));
    if (cond) wheres.push(cond);
  }

  let coaches = await db
    .select()
    .from(users)
    .where(and(...wheres));

  const services = coaches.length
    ? await db
        .select()
        .from(coachServices)
        .where(
          inArray(
            coachServices.coachId,
            coaches.map((c) => c.id),
          ),
        )
    : [];

  if (modality && modality !== "Todas") {
    coaches = coaches.filter((c) =>
      services.some((s) => s.coachId === c.id && s.modality === modality),
    );
  }

  const following = me
    ? await db
        .select({ id: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, me.id))
    : [];
  const followSet = new Set(following.map((f) => f.id));

  const qs = (patch: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    const merged = { sport, modality, max, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && usp.set(k, v));
    const s = usp.toString();
    return s ? `/treinadores?${s}` : "/treinadores";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white shrink-0">
          <IconWhistle width={24} height={24} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Área de treinadores
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Contrate seu Coach
          </h1>
          <p className="text-slate-500 text-sm">
            Profissionais verificados. Agende sessões direto pelo app.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <FilterRow label="Esporte" items={SPORTS} current={sport ?? "Todos"} param="sport" qs={qs} />
        <FilterRow
          label="Modalidade"
          items={MODALITIES}
          current={modality ?? "Todas"}
          param="modality"
          qs={qs}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 shrink-0">
            Preço
          </span>
          {PRICES.map((p) => (
            <Link
              key={p.l}
              href={qs({ max: p.v || undefined })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                (max ?? "") === p.v
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
              }`}
            >
              {p.l}
            </Link>
          ))}
        </div>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="font-bold text-lg">Nenhum treinador encontrado</div>
          <p className="text-slate-500 text-sm mt-1">
            Tente ampliar a faixa de preço ou mudar o esporte.
          </p>
          <Link
            href="/treinadores"
            className="inline-block mt-4 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <CoachCard
              key={c.id}
              coach={{
                id: c.id,
                name: c.name,
                sport: c.sport,
                city: c.city,
                bio: c.bio,
                avatar: c.avatar,
                level: c.level,
                followers: c.followers,
                rating: c.rating,
                pricePerHour: c.pricePerHour,
                verified: c.verified,
              }}
              services={services.filter((s) => s.coachId === c.id)}
              isFollowing={followSet.has(c.id)}
              isLogged={!!me}
            />
          ))}
        </div>
      )}

      {/* CTA to become coach */}
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
        <Avatar src="" name="Coach" size={56} rounded="2xl" />
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-black">Você é treinador?</h3>
          <p className="text-slate-300 text-sm mt-1">
            Cadastre-se como coach, publique seus serviços e receba
            agendamentos de atletas de todo o Brasil.
          </p>
        </div>
        <Link
          href="/cadastro"
          className="bg-emerald-500 hover:bg-emerald-600 font-bold px-6 py-3 rounded-full text-sm shrink-0"
        >
          Criar perfil de treinador
        </Link>
      </div>
    </div>
  );
}

function FilterRow({
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
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 shrink-0">
        {label}
      </span>
      {items.map((it) => {
        const active = current === it;
        const isDefault = it === "Todos" || it === "Todas";
        return (
          <Link
            key={it}
            href={qs({ [param]: isDefault ? undefined : it })}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              active
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
            }`}
          >
            {it}
          </Link>
        );
      })}
    </div>
  );
}

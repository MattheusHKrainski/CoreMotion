"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/app/actions";
import { IconLogout } from "@/components/Icons";

const initial: ActionState = {};

const SPORTS = [
  "Multi-esportes",
  "Corrida",
  "Futebol",
  "Basquete",
  "Vôlei",
  "Jiu-Jitsu",
  "Surf",
  "Natação",
  "Ciclismo",
  "Crossfit",
];

const LEVELS = [
  "Iniciante",
  "Intermediário",
  "Avançado",
  "Semi-profissional",
  "Profissional",
  "Elite",
];

export default function ProfileForm({
  user,
}: {
  user: {
    name: string;
    bio: string;
    city: string;
    sport: string;
    level: string;
    role: string;
    pricePerHour: number | null;
    email: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initial,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
      <h2 className="font-black text-lg">Editar perfil</h2>
      <p className="text-sm text-slate-500">
        Conta: <span className="font-mono">{user.email}</span>
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nome
            </label>
            <input
              name="name"
              defaultValue={user.name}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cidade
            </label>
            <input
              name="city"
              defaultValue={user.city}
              placeholder="São Paulo, SP"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user.bio}
            placeholder="Conte um pouco sobre sua trajetória no esporte..."
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Esporte
            </label>
            <select
              name="sport"
              defaultValue={user.sport}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
            >
              {SPORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nível
            </label>
            <select
              name="level"
              defaultValue={user.level}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white"
            >
              {LEVELS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {user.role === "coach" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Valor por hora (R$)
              </label>
              <input
                name="pricePerHour"
                type="number"
                min={0}
                defaultValue={user.pricePerHour ?? 120}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
          )}
        </div>

        {state.error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {state.error}
          </div>
        )}
        {state.ok && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-bold">
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-full text-sm"
          >
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600"
      >
        <IconLogout width={16} height={16} /> Sair da conta
      </button>
    </div>
  );
}

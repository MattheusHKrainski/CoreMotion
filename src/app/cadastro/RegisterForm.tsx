"use client";

import { useState } from "react";

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

export default function RegisterForm() {
  const [role, setRole] = useState("athlete");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          role,
          sport: fd.get("sport"),
          city: fd.get("city"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha no cadastro.");
        setPending(false);
        return;
      }
      window.location.href = data.redirect || "/";
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: "athlete", label: "Sou atleta", desc: "Treino e compro" },
          { v: "coach", label: "Sou treinador", desc: "Ofereço serviços" },
        ].map((o) => (
          <button
            type="button"
            key={o.v}
            onClick={() => setRole(o.v)}
            className={`text-left p-3 rounded-xl border-2 transition ${
              role === o.v
                ? "border-red-500 bg-red-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="font-bold text-sm">{o.label}</div>
            <div className="text-[11px] text-slate-500">{o.desc}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Nome completo
        </label>
        <input
          name="name"
          required
          placeholder="Seu nome"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          E-mail real
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@gmail.com"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Aceitamos Gmail, Outlook, Yahoo, iCloud, UOL e outros provedores
          reais. E-mails inventados são bloqueados.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Senha
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Esporte
          </label>
          <select
            name="sport"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white"
          >
            {SPORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Cidade
          </label>
          <input
            name="city"
            placeholder="São Paulo, SP"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl"
      >
        {pending ? "Criando conta..." : "Criar minha conta"}
      </button>
    </form>
  );
}

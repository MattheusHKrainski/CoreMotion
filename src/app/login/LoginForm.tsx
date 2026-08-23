"use client";

import { useState } from "react";
import { IconMail, IconLock } from "@/components/Icons";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function doLogin(e?: string, p?: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e ?? email,
          password: p ?? password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha no login.");
        setPending(false);
        return;
      }
      // Força refresh completo para o layout server-side pegar o cookie
      window.location.href = data.redirect || "/";
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          doLogin();
        }}
        className="mt-8 space-y-4"
        noValidate
      >
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            E-mail
          </label>
          <div className="relative mt-1">
            <IconMail
              width={17}
              height={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@gmail.com"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Senha
          </label>
          <div className="relative mt-1">
            <IconLock
              width={17}
              height={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400"
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
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Contas oficiais
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => doLogin("demo@sporthub.com", "sporthub123")}
          className="w-full text-left rounded-lg border border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 px-3 py-2.5 transition disabled:opacity-50"
        >
          <div className="text-sm font-bold text-slate-900">
            Conta demonstração
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            demo@sporthub.com · sporthub123
          </div>
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => doLogin("operacaoamd@gmail.com", "processadores")}
          className="w-full text-left rounded-lg border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 px-3 py-2.5 transition disabled:opacity-50"
        >
          <div className="text-sm font-bold text-slate-900">
            Conta administrador
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            operacaoamd@gmail.com
          </div>
        </button>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Cadastros novos só aceitam e-mails reais (Gmail, Outlook, Yahoo,
          iCloud, UOL…). E-mails inventados são bloqueados.
        </p>
      </div>
    </>
  );
}

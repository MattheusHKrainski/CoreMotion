"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

const SPORTS = ["Multi-esportes","Corrida","Futebol","Basquete","Vôlei","Jiu-Jitsu","Surf","Natação","Ciclismo","Crossfit"];

export default function RegisterForm() {
  const [role, setRole] = useState("user");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const username = String(fd.get("username") ?? "").trim().toLowerCase();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    const sport = String(fd.get("sport") ?? "Multi-esportes");
    const city = String(fd.get("city") ?? "");

    if (name.length < 2) { setError("Informe seu nome completo."); setPending(false); return; }
    if (!username || username.length < 3) { setError("Nome de usuário deve ter ao menos 3 caracteres."); setPending(false); return; }
    if (!/^[a-z0-9-]+$/.test(username)) { setError("Nome de usuário só pode ter letras, números e hífen."); setPending(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("E-mail inválido."); setPending(false); return; }
    if (password.length < 6) { setError("Senha deve ter ao menos 6 caracteres."); setPending(false); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); setPending(false); return; }

    try {
      // 1. Cria no Supabase Auth
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, username },
        },
      });

      if (signUpError) {
        // Se Supabase Auth falhar por já existir, tenta login custom como fallback
        if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("already exists")) {
          setError("Este e-mail já está cadastrado. Faça login.");
          setPending(false);
          return;
        }
        setError(`Erro no cadastro: ${signUpError.message}`);
        setPending(false);
        return;
      }

      // 2. Cria perfil no nosso banco via API (mantém compatibilidade com sistema existente)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password, role, sport, city, supabaseId: data.user?.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Se já existe no nosso banco mas criou no Supabase Auth, considera ok e redireciona para login
        if (json.error?.includes("já está cadastrado")) {
          setError("Conta criada no Auth, mas já existia perfil. Faça login.");
          setPending(false);
          return;
        }
        setError(json.error || "Falha ao criar perfil.");
        setPending(false);
        return;
      }

      // 3. Sucesso — se Supabase exigir confirmação de e-mail, avisa, senão redireciona
      if (data.user && !data.session) {
        setError(null);
        alert("Conta criada! Verifique seu e-mail para confirmar o cadastro (se exigido pelo Supabase). Depois faça login.");
        window.location.href = "/login";
      } else {
        window.location.href = json.redirect || "/";
      }
    } catch (err) {
      setError(`Erro: ${String(err)}`);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: "user", label: "Comprador", desc: "Compro e navego" },
          { v: "store_owner", label: "Vendedor / Loja", desc: "Quero vender" },
        ].map((o) => (
          <button type="button" key={o.v} onClick={() => setRole(o.v)} className={`text-left p-3 rounded-xl border-2 transition ${role === o.v ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}>
            <div className="font-bold text-sm">{o.label}</div>
            <div className="text-[11px] text-slate-500">{o.desc}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome completo *</label>
        <input name="name" required placeholder="Seu nome completo" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40" />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome de usuário *</label>
        <div className="mt-1 flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-red-400/30">
          <span className="bg-slate-50 px-3 py-3 text-xs text-slate-500 font-mono">@</span>
          <input name="username" required minLength={3} placeholder="seu-usuario" className="flex-1 px-3 py-3 text-sm outline-none" />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Apenas letras, números e hífen. Será seu identificador público.</p>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail real *</label>
        <input name="email" type="email" required autoComplete="email" placeholder="seu@gmail.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40" />
        <p className="text-[11px] text-slate-500 mt-1">Aceitamos Gmail, Outlook, Yahoo, iCloud, UOL e outros provedores reais.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha *</label>
          <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Mínimo 6 caracteres" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmar senha *</label>
          <input name="confirm" type="password" required minLength={6} autoComplete="new-password" placeholder="Repita a senha" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Esporte</label>
          <select name="sport" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {SPORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cidade</label>
          <input name="city" placeholder="São Paulo, SP" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

      <button type="submit" disabled={pending} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl">
        {pending ? "Criando conta..." : "Criar minha conta"}
      </button>

      <p className="text-xs text-slate-500 text-center">Ao criar você concorda com os termos do CoreMotion. Auth seguro via Supabase.</p>

      <div className="text-center text-sm">
        Já tem conta? <Link href="/login" className="font-bold text-red-600 hover:underline">Entrar</Link>
      </div>
    </form>
  );
}

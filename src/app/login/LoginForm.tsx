"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail, IconLock } from "@/components/Icons";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function doLogin(e?: string, p?: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e ?? email, password: p ?? password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha no login.");
        setPending(false);
        return;
      }
      window.location.href = data.redirect || "/";
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setPending(false);
    }
  }

  async function loginWithGoogle() {
    setGooglePending(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setError(`Erro no login com Google: ${error.message}. Verifique se Google OAuth está configurado no Supabase.`);
        setGooglePending(false);
      }
    } catch (e) {
      setError(`Erro: ${String(e)}`);
      setGooglePending(false);
    }
  }

  return (
    <>
      {/* Google OAuth */}
      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={googlePending || pending}
        className="mt-8 w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {googlePending ? "Redirecionando..." : "Continuar com Google"}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={(ev) => { ev.preventDefault(); doLogin(); }} className="space-y-4" noValidate>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail</label>
          <div className="relative mt-1">
            <IconMail width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@gmail.com" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha</label>
            <Link href="/recuperar-senha" className="text-[11px] font-bold text-red-600 hover:underline">Esqueci minha senha</Link>
          </div>
          <div className="relative mt-1">
            <IconLock width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

        <button type="submit" disabled={pending || googlePending} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition">
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Acesso rápido (dev)</div>
        <button type="button" disabled={pending || googlePending} onClick={() => doLogin("demo@sporthub.com", "sporthub123")} className="w-full text-left rounded-lg border border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 px-3 py-2.5 transition disabled:opacity-50">
          <div className="text-sm font-bold text-slate-900">Conta demonstração</div>
          <div className="text-[11px] text-slate-500 font-mono">demo@sporthub.com · sporthub123</div>
        </button>
        <button type="button" disabled={pending || googlePending} onClick={() => doLogin("operacaoamd@gmail.com", "processadores")} className="w-full text-left rounded-lg border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 px-3 py-2.5 transition disabled:opacity-50">
          <div className="text-sm font-bold text-slate-900">Conta administrador</div>
          <div className="text-[11px] text-slate-500 font-mono">operacaoamd@gmail.com</div>
        </button>
        <p className="text-[11px] text-slate-500 leading-relaxed">Cadastros novos aceitam apenas e-mails reais (Gmail, Outlook, Yahoo, iCloud, UOL...). Para Google OAuth, configure no Supabase Dashboard → Auth → Providers → Google.</p>
      </div>
    </>
  );
}

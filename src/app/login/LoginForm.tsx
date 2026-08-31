"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMail, IconLock } from "@/components/Icons";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function doLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError(error.message);
        setPending(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(`Erro: ${String(err)}`);
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
        setError(`Erro no login com Google: ${error.message}. Configure no Supabase Dashboard → Auth → Providers → Google.`);
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
        className="mt-8 w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold py-3.5 rounded-xl transition disabled:opacity-50 text-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {googlePending ? "Redirecionando..." : "Continuar com Google"}
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={doLogin} className="space-y-5" noValidate>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">E-mail</label>
          <div className="relative mt-2">
            <IconMail width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-racing-green/20 focus:border-racing-green" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Senha</label>
            <Link href="/recuperar-senha" className="text-xs font-bold text-racing-green hover:underline">Esqueci minha senha</Link>
          </div>
          <div className="relative mt-2">
            <IconLock width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-racing-green/20 focus:border-racing-green" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

        <button type="submit" disabled={pending || googlePending} className="w-full bg-racing-green hover:bg-racing-green-light disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition">
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4">
        Para Google OAuth funcionar, configure no Supabase Dashboard → Authentication → Providers → Google. Adicione as URLs de redirect.
      </p>

      <div className="text-center text-sm mt-8">
        Não tem conta? <Link href="/cadastro" className="font-bold text-racing-green hover:underline">Criar conta</Link>
      </div>
    </>
  );
}

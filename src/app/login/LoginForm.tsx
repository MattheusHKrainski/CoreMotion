"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMail, IconLock, IconGoogle } from "@/components/Icons";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const isConfigured = isSupabaseConfigured();

  async function doLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    if (!isConfigured) {
      setError("Configuração do Supabase incompleta. Verifique as variáveis de ambiente.");
      return;
    }

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
    if (!isConfigured) {
      setError("Configuração do Supabase incompleta. Verifique as variáveis de ambiente.");
      return;
    }

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
        disabled={googlePending || pending || !isConfigured}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed font-semibold py-3.5 rounded-xl transition text-sm text-gray-700"
      >
        <IconGoogle width={20} height={20} />
        {googlePending ? "Redirecionando..." : "Continuar com Google"}
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">ou</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={doLogin} className="space-y-5" noValidate>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">E-mail</label>
          <div className="relative mt-2">
            <IconMail width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={pending || googlePending || !isConfigured}
              className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-racing-green/20 focus:border-racing-green disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Senha</label>
            <Link href="/recuperar-senha" className="text-xs font-bold text-racing-green hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative mt-2">
            <IconLock width={18} height={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={pending || googlePending || !isConfigured}
              className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-racing-green/20 focus:border-racing-green disabled:bg-gray-100"
            />
          </div>
        </div>

        {!isConfigured && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <strong>Atenção:</strong> Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env
          </div>
        )}

        {error && (
          <div className="text-sm text-error-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || googlePending || !isConfigured}
          className="w-full bg-racing-green hover:bg-racing-green-light disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition shadow-premium"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="text-center text-sm mt-8 text-gray-600">
        Ainda não possui uma conta?{" "}
        <Link href="/cadastro" className="font-bold text-racing-green hover:underline">
          Criar conta
        </Link>
      </div>
    </>
  );
}

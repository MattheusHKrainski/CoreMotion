"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail } from "@/components/Icons";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function RecoverForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
        setMessage("Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl border border-slate-100 p-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail</label>
          <div className="relative mt-1">
            <IconMail width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@gmail.com" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30" />
          </div>
        </div>

        {status === "error" && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{message}</div>}
        {status === "success" && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-bold">{message}</div>}

        <button disabled={status === "loading"} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm">
          {status === "loading" ? "Enviando..." : "Enviar link de recuperação"}
        </button>

        <div className="text-center text-xs text-slate-500">
          Lembrou a senha? <Link href="/login" className="font-bold text-red-600 hover:underline">Entrar</Link>
        </div>
      </form>

      <div className="mt-4 text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3">
        Para funcionar, configure no Supabase Dashboard → Auth → URL Configuration → Redirect URLs: adicione <code>{`https://SEU_DOMINIO/redefinir-senha`}</code> e <code>{`http://localhost:3000/redefinir-senha`}</code>
      </div>
    </>
  );
}

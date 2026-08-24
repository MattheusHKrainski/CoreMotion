"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLock } from "@/components/Icons";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setMessage("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("As senhas não coincidem.");
      return;
    }
    setStatus("loading");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("success");
        setMessage("Senha redefinida com sucesso. Redirecionando para login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white rounded-2xl border border-slate-100 p-5">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nova senha</label>
        <div className="relative mt-1">
          <IconLock width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmar nova senha</label>
        <div className="relative mt-1">
          <IconLock width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30" />
        </div>
      </div>

      {status === "error" && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{message}</div>}
      {status === "success" && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-bold">{message}</div>}

      <button disabled={status === "loading"} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm">
        {status === "loading" ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}

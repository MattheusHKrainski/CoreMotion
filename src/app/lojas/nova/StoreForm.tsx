"use client";

import { useActionState } from "react";
import { createStoreAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const CATS = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Lifestyle"];

export default function StoreForm() {
  const [state, formAction, pending] = useActionState(createStoreAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4 bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome da loja</label>
        <input name="name" required placeholder="Ex: Loja Oficial Nike" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição</label>
        <textarea name="description" rows={3} placeholder="O que sua loja vende? Quais marcas?" className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cidade</label>
          <input name="city" placeholder="São Paulo, SP" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoria principal</label>
          <select name="category" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</div>}

      <button disabled={pending} className="w-full bg-slate-900 hover:bg-red-600 text-white font-bold py-3 rounded-full text-sm">
        {pending ? "Criando..." : "Criar loja"}
      </button>
    </form>
  );
}

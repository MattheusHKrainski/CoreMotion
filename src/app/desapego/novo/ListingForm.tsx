"use client";

import { useActionState } from "react";
import { createListingAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const SPORTS = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Natação", "Ciclismo", "Crossfit"];
const CATS = ["Tênis de Corrida", "Tênis de Basquete", "Tênis Casual", "Chuteiras", "Bolas", "Vestuário", "Acessórios", "Equipamento", "Eletrônicos"];

export default function ListingForm({ city }: { city?: string }) {
  const [state, formAction, pending] = useActionState(createListingAction, initial);

  return (
    <form action={formAction} className="mt-6 bg-white rounded-2xl border border-slate-100 p-5 md:p-6 space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Título do anúncio</label>
        <input name="title" required placeholder="Ex: Nike Pegasus 40 — 39, 300km rodados" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição detalhada</label>
        <textarea name="description" rows={4} required placeholder="Conte o estado real, motivo da venda, tamanho, quilometragem, defeitos..." className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço (R$)</label>
          <input name="price" required inputMode="decimal" placeholder="299.90" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Condição</label>
          <select name="condition" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            <option>Seminovo</option>
            <option>Usado</option>
            <option>Novo</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tamanho</label>
          <input name="size" placeholder="39, M, A2, Único" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</label>
          <select name="category" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Esporte</label>
          <select name="sport" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {SPORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Marca</label>
          <input name="brand" placeholder="Nike, Adidas..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cidade</label>
          <input name="city" defaultValue={city} placeholder="São Paulo, SP" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Foto (URL)</label>
          <input name="imageUrl" placeholder="https://... (cole a URL da foto)" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          <p className="text-[11px] text-slate-400 mt-1">Você pode colar URL do seu Drive/Imgur. Em breve upload direto.</p>
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</div>}

      <button disabled={pending} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full">
        {pending ? "Publicando..." : "Publicar no desapego"}
      </button>
    </form>
  );
}

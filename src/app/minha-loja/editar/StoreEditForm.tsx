"use client";

import { useActionState } from "react";
import { updateStoreAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const CATEGORIES = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Lifestyle", "Fitness", "Ciclismo"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

type Store = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  logo: string;
  banner: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  social: string;
};

export default function StoreEditForm({ store }: { store: Store }) {
  const [state, formAction, pending] = useActionState(updateStoreAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <input type="hidden" name="storeId" value={store.id} />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Informações da loja</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome da loja *</label>
            <input name="name" required defaultValue={store.name} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Identificador *</label>
            <div className="mt-1 flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-red-400/30">
              <span className="bg-slate-50 px-3 py-3 text-xs text-slate-500 font-mono">/loja/</span>
              <input name="slug" required defaultValue={store.slug} className="flex-1 px-3 py-3 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Categoria *</label>
            <select name="category" defaultValue={store.category} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição curta *</label>
            <input name="shortDescription" required defaultValue={store.shortDescription} maxLength={200} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição completa *</label>
            <textarea name="description" rows={4} required defaultValue={store.description} className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Logo (URL)</label>
            <input name="logo" defaultValue={store.logo} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Banner (URL)</label>
            <input name="banner" defaultValue={store.banner} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Contato e localização</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">E-mail *</label>
            <input name="email" type="email" required defaultValue={store.email} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Telefone / WhatsApp *</label>
            <input name="phone" required defaultValue={store.phone} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Cidade *</label>
            <input name="city" required defaultValue={store.city} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Estado *</label>
            <select name="state" required defaultValue={store.state} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              <option value="">Selecione</option>
              {STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Instagram / rede social</label>
            <input name="social" defaultValue={store.social} placeholder="@sualoja" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>}
      {state?.ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-bold">{state.message || "Loja atualizada com sucesso."}</div>}

      <button disabled={pending} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-full">
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

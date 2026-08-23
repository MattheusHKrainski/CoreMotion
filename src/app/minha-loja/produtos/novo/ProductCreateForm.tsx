"use client";

import { useActionState } from "react";
import { createStoreProductAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const SPORTS = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Lifestyle", "Fitness"];
const CATS = ["Calçados", "Tênis de Corrida", "Tênis de Basquete", "Tênis Casual", "Chuteiras", "Bolas", "Vestuário", "Acessórios", "Equipamento", "Eletrônicos"];
const CONDITIONS = ["Novo", "Seminovo", "Usado"];

export default function ProductCreateForm({ storeId }: { storeId: number }) {
  const [state, formAction, pending] = useActionState(createStoreProductAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <input type="hidden" name="storeId" value={storeId} />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Informações do produto</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome do produto *</label>
            <input name="name" required placeholder="Ex: Tênis Nike Pegasus 41 — Branco/Azul" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Marca *</label>
            <input name="brand" required placeholder="Nike, Adidas, Asics..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Condição</label>
            <select name="condition" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Categoria *</label>
            <select name="category" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Esporte</label>
            <select name="sport" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              {SPORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço *</label>
            <input name="price" required inputMode="decimal" placeholder="759.99" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço antigo (opcional)</label>
            <input name="oldPrice" inputMode="decimal" placeholder="1099.99" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Tamanhos (separados por vírgula)</label>
            <input name="sizes" placeholder="37, 38, 39, 40, 41, 42" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Estoque</label>
            <input name="stock" type="number" min={0} defaultValue={10} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Imagem (URL) *</label>
            <input name="image" required placeholder="https://.../seu-produto.jpg" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="text-[11px] text-slate-400 mt-1">Use imagem em fundo branco, estilo catálogo. Ex: link do seu Drive, Imgur ou site da marca.</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição</label>
            <textarea name="description" rows={4} placeholder="Descreva o produto, materiais, tecnologias, indicação de uso..." className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
          </div>
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>}
      {state?.ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-bold">{state.message}</div>}

      <button disabled={pending} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-full">
        {pending ? "Cadastrando..." : "Cadastrar produto na loja"}
      </button>
    </form>
  );
}

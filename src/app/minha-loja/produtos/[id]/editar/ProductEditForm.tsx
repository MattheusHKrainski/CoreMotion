"use client";

import { useActionState } from "react";
import { updateStoreProductAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const CATS = ["Calçados", "Tênis de Corrida", "Tênis de Basquete", "Tênis Casual", "Chuteiras", "Bolas", "Vestuário", "Acessórios", "Equipamento", "Eletrônicos"];
const SPORTS = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Lifestyle", "Fitness"];

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  sport: string;
  price: string;
  oldPrice: string | null;
  description: string;
  image: string;
  stock: number;
};

export default function ProductEditForm({ product }: { product: Product }) {
  const [state, formAction, pending] = useActionState(updateStoreProductAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4 bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
      <input type="hidden" name="productId" value={product.id} />

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome *</label>
        <input name="name" required defaultValue={product.name} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Marca</label>
          <input name="brand" defaultValue={product.brand} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Categoria</label>
          <select name="category" defaultValue={product.category} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Esporte</label>
          <select name="sport" defaultValue={product.sport} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
            {SPORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Estoque</label>
          <input name="stock" type="number" min={0} defaultValue={product.stock} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço *</label>
          <input name="price" required defaultValue={Number(product.price).toFixed(2)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Preço antigo</label>
          <input name="oldPrice" defaultValue={product.oldPrice ? Number(product.oldPrice).toFixed(2) : ""} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Imagem (URL)</label>
        <input name="image" defaultValue={product.image} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição</label>
        <textarea name="description" rows={4} defaultValue={product.description} className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{state.error}</div>}
      {state?.ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-bold">{state.message}</div>}

      <button disabled={pending} className="w-full bg-slate-900 hover:bg-red-600 text-white font-black py-3 rounded-full text-sm">
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

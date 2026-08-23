"use client";

import { useActionState } from "react";
import { createStoreAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

const CATEGORIES = ["Corrida", "Futebol", "Basquete", "Vôlei", "Jiu-Jitsu", "Surf", "Multi-esportes", "Lifestyle", "Fitness", "Ciclismo"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function StoreCreateForm({ email, city }: { email?: string; city?: string }) {
  const [state, formAction, pending] = useActionState(createStoreAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-8">
      {/* Informações da loja */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Informações da loja</h2>
        <p className="text-xs text-slate-500 mt-1">Campos com * são obrigatórios</p>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome da loja *</label>
            <input name="name" required placeholder="Ex: João Sports — Equipamentos de Corrida" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Identificador da loja *</label>
            <div className="mt-1 flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-red-400/30 focus-within:border-red-400">
              <span className="bg-slate-50 px-3 py-3 text-xs text-slate-500 font-mono">/loja/</span>
              <input name="slug" placeholder="joao-sports" className="flex-1 px-3 py-3 text-sm outline-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Deixe vazio para gerar automaticamente. Apenas letras, números e hífen.</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Categoria *</label>
            <select name="category" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição curta *</label>
            <input name="shortDescription" required maxLength={200} placeholder="Ex: Tênis de corrida e acessórios com envio rápido para todo o Brasil" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descrição completa *</label>
            <textarea name="description" rows={4} required placeholder="Conte a história da loja, quais marcas trabalha, diferenciais, tempo de mercado..." className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Logo (URL)</label>
            <input name="logo" placeholder="https://.../logo.jpg" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="text-[11px] text-slate-400 mt-1">Cole URL de imagem quadrada. Se vazio usamos padrão.</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Banner / capa (URL)</label>
            <input name="banner" placeholder="https://.../banner.jpg" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="text-[11px] text-slate-400 mt-1">Imagem 1200x675 para topo da vitrine.</p>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Informações de contato</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">E-mail de contato *</label>
            <input name="email" type="email" required defaultValue={email} placeholder="contato@sualoja.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Telefone / WhatsApp *</label>
            <input name="phone" required placeholder="(11) 99999-9999" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Cidade *</label>
            <input name="city" required defaultValue={city} placeholder="São Paulo" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Estado *</label>
            <select name="state" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              <option value="">Selecione</option>
              {STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Adicionais */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Informações adicionais</h2>
        <div className="mt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Instagram ou rede social</label>
          <input name="social" placeholder="@sualoja ou https://instagram.com/sualoja" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>}

      <div className="flex gap-3">
        <button disabled={pending} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-full">
          {pending ? "Criando loja..." : "Criar minha loja"}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 text-center">Ao criar você concorda com as regras do marketplace. Uma loja por conta (exceto admin).</p>
    </form>
  );
}

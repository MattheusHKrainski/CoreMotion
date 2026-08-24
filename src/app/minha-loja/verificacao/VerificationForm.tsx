"use client";

import { useActionState } from "react";
import { requestStoreVerificationAction, type ActionState } from "@/app/actions";

const initial: ActionState = {};

export default function VerificationForm({ storeId, currentStatus }: { storeId: number; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(requestStoreVerificationAction, initial);
  const canRequest = ["not_requested", "rejected", "revoked"].includes(currentStatus) || !currentStatus;

  if (!canRequest) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
        <div className="font-bold">Solicitação em análise</div>
        <p className="text-sm text-slate-500 mt-1">Sua loja está com status {currentStatus}. Aguarde a equipe do CoreMotion analisar. Você receberá notificação quando houver atualização.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="storeId" value={storeId} />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Dados da empresa</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Razão social *</label>
            <input name="legalName" required placeholder="Ex: João Sports Ltda" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome comercial *</label>
            <input name="tradeName" required placeholder="Ex: João Sports" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">CNPJ *</label>
            <input name="cnpj" required placeholder="00.000.000/0001-00" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Telefone comercial *</label>
            <input name="phone" required placeholder="(11) 3000-0000" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Endereço comercial *</label>
            <input name="address" required placeholder="Rua, número, bairro, cidade - UF" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Site oficial</label>
            <input name="website" placeholder="https://sualoja.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Responsável</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nome completo *</label>
            <input name="responsibleName" required placeholder="Seu nome" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Cargo *</label>
            <input name="responsibleRole" required placeholder="Proprietário, Gerente..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">E-mail profissional *</label>
            <input name="responsibleEmail" type="email" required placeholder="contato@sualoja.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Telefone *</label>
            <input name="responsiblePhone" required placeholder="(11) 99999-9999" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <h2 className="font-black text-lg">Marca representada</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Marca principal</label>
            <input name="brandName" placeholder="Nike, Adidas..." className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Relação com a marca</label>
            <select name="brandRelation" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm bg-white">
              <option value="">Selecione</option>
              <option value="revenda_autorizada">Revenda autorizada</option>
              <option value="representante">Representante oficial</option>
              <option value="distribuidor">Distribuidor</option>
              <option value="propria">Marca própria</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Site oficial da marca</label>
            <input name="brandWebsite" placeholder="https://nike.com" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Redes sociais da marca</label>
            <input name="brandSocial" placeholder="@nike" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Documentos (URLs) — CNPJ, autorização de marca</label>
            <input name="documents" placeholder="https://... (separe por vírgula) — em breve upload direto via Storage" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="text-[11px] text-slate-400 mt-1">Cole URLs de documentos. Upload via Supabase Storage será ativado com bucket coremotion.</p>
          </div>
        </div>
      </div>

      {state?.error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</div>}
      {state?.ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-bold">{state.message}</div>}

      <button disabled={pending} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-full">
        {pending ? "Enviando solicitação..." : "Solicitar verificação oficial"}
      </button>
    </form>
  );
}

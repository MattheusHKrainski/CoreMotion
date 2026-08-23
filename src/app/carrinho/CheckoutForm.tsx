"use client";

import { useActionState, useState } from "react";
import { checkoutAction, type ActionState } from "@/app/actions";
import { money } from "@/components/ProductCard";
import { IconLock, IconCreditCard, IconCheck } from "@/components/Icons";

const initial: ActionState = {};

export default function CheckoutForm({
  subtotal,
  shipping,
}: {
  subtotal: number;
  shipping: number;
}) {
  const [state, formAction, pending] = useActionState(checkoutAction, initial);
  const [payment, setPayment] = useState("pix");

  const discount = payment === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shipping - discount;

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl border border-slate-100 p-5"
    >
      <h2 className="font-black text-lg">Resumo do pedido</h2>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="font-semibold">{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Frete</dt>
          <dd
            className={`font-semibold ${shipping === 0 ? "text-emerald-600" : ""}`}
          >
            {shipping === 0 ? "Grátis" : money(shipping)}
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <dt>Desconto PIX (5%)</dt>
            <dd className="font-semibold">−{money(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-slate-200 text-lg">
          <dt className="font-black">Total</dt>
          <dd className="font-black text-red-600">{money(total)}</dd>
        </div>
        <div className="text-[11px] text-slate-500 text-right">
          ou 10x de {money(total / 10)} sem juros
        </div>
      </dl>

      <div className="mt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Endereço de entrega
        </label>
        <textarea
          name="address"
          rows={3}
          required
          placeholder="Rua, número, complemento, bairro, cidade - UF, CEP"
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Forma de pagamento
        </label>
        <input type="hidden" name="paymentMethod" value={payment} />
        <div className="mt-2 space-y-2">
          {[
            { v: "pix", l: "PIX", d: "5% de desconto · aprovação imediata" },
            { v: "credit", l: "Cartão de crédito", d: "até 10x sem juros" },
            { v: "boleto", l: "Boleto bancário", d: "vence em 3 dias úteis" },
          ].map((o) => (
            <button
              type="button"
              key={o.v}
              onClick={() => setPayment(o.v)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                payment === o.v
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 grid place-items-center shrink-0 ${
                  payment === o.v ? "border-red-500" : "border-slate-300"
                }`}
              >
                {payment === o.v && (
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm">{o.l}</div>
                <div className="text-[11px] text-slate-500">{o.d}</div>
              </div>
              <IconCreditCard
                width={18}
                height={18}
                className="ml-auto text-slate-400 shrink-0"
              />
            </button>
          ))}
        </div>
      </div>

      {state.error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {state.error}
        </div>
      )}

      <button
        disabled={pending}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full transition"
      >
        {pending ? (
          "Processando..."
        ) : (
          <>
            <IconCheck width={18} height={18} /> Finalizar compra
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <IconLock width={13} height={13} /> Ambiente seguro e criptografado
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutAction, type ActionState } from "@/app/actions";
import { IconCreditCard, IconShield, IconCheck } from "@/components/Icons";

type CheckoutItem = {
  id: number;
  qty: number;
  size: string;
  product?: any;
  listing?: any;
};

export default function CheckoutForm({
  items,
  subtotal,
  shipping,
  discount,
  total,
}: {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card" | "boleto">("pix");
  const [state, formAction, pending] = useActionState(checkoutAction, initial);

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden fields */}
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      {items.map((item, i) => (
        <input key={item.id} type="hidden" name={`items[${i}][id]`} value={item.id} />
      ))}

      {/* Shipping address */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
          <IconShield width={20} height={20} className="text-racing-green" />
          Endereço de entrega
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">CEP *</label>
            <input name="cep" required placeholder="00000-000" className="input-premium mt-2 w-full" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Endereço *</label>
            <input name="address" required placeholder="Rua, número, complemento" className="input-premium mt-2 w-full" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Bairro *</label>
            <input name="neighborhood" required placeholder="Bairro" className="input-premium mt-2 w-full" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cidade *</label>
            <input name="city" required placeholder="Cidade" className="input-premium mt-2 w-full" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado *</label>
            <select name="state" required className="input-premium mt-2 w-full bg-white">
              <option value="">Selecione</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="PR">Paraná</option>
              <option value="SC">Santa Catarina</option>
              <option value="BA">Bahia</option>
              <option value="PE">Pernambuco</option>
              <option value="CE">Ceará</option>
              <option value="GO">Goiás</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
          <IconCreditCard width={20} height={20} className="text-racing-green" />
          Forma de pagamento
        </h2>

        <div className="space-y-3">
          {/* PIX */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "pix" ? "border-racing-green bg-racing-green/5" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="paymentMethod" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="w-4 h-4 text-racing-green" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">PIX</div>
              <div className="text-xs text-gray-500">Aprovação imediata • 5% de desconto</div>
            </div>
            {paymentMethod === "pix" && <IconCheck width={20} height={20} className="text-racing-green" />}
          </label>

          {/* Credit Card */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "credit_card" ? "border-racing-green bg-racing-green/5" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="paymentMethod" value="credit_card" checked={paymentMethod === "credit_card"} onChange={() => setPaymentMethod("credit_card")} className="w-4 h-4 text-racing-green" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">Cartão de crédito</div>
              <div className="text-xs text-gray-500">Até 12x sem juros</div>
            </div>
            {paymentMethod === "credit_card" && <IconCheck width={20} height={20} className="text-racing-green" />}
          </label>

          {/* Boleto */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "boleto" ? "border-racing-green bg-racing-green/5" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="paymentMethod" value="boleto" checked={paymentMethod === "boleto"} onChange={() => setPaymentMethod("boleto")} className="w-4 h-4 text-racing-green" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">Boleto bancário</div>
              <div className="text-xs text-gray-500">Vence em 3 dias úteis</div>
            </div>
            {paymentMethod === "boleto" && <IconCheck width={20} height={20} className="text-racing-green" />}
          </label>
        </div>

        {state?.error && (
          <div className="mt-4 text-sm text-error-red bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {state.error}
          </div>
        )}

        {state?.ok && (
          <div className="mt-4 text-sm text-success-green bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-bold">
            {state.message}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Processando..." : `Finalizar pedido • R$ ${total.toFixed(2)}`}
      </button>

      {/* Security notice */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <IconShield width={14} height={14} />
        <span>Ambiente seguro e criptografado</span>
      </div>
    </form>
  );
}

const initial: ActionState = {};

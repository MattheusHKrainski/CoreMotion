"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartQtyAction, removeCartItemAction } from "@/app/actions";
import { IconPlus, IconMinus, IconTrash } from "@/components/Icons";

export default function CartControls({
  itemId,
  qty,
  max,
}: {
  itemId: number;
  qty: number;
  max: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const set = (n: number) =>
    start(async () => {
      await updateCartQtyAction(itemId, n);
      router.refresh();
    });

  const remove = () =>
    start(async () => {
      await removeCartItemAction(itemId);
      router.refresh();
    });

  return (
    <div className="mt-2.5 flex items-center gap-3">
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button
          disabled={pending}
          onClick={() => set(qty - 1)}
          className="w-8 h-8 grid place-items-center hover:bg-slate-50 disabled:opacity-40"
          aria-label="Diminuir"
        >
          <IconMinus width={14} height={14} />
        </button>
        <span className="w-8 text-center text-sm font-bold">{qty}</span>
        <button
          disabled={pending || qty >= Math.max(max, 1)}
          onClick={() => set(qty + 1)}
          className="w-8 h-8 grid place-items-center hover:bg-slate-50 disabled:opacity-30"
          aria-label="Aumentar"
        >
          <IconPlus width={14} height={14} />
        </button>
      </div>
      <button
        disabled={pending}
        onClick={remove}
        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 disabled:opacity-40"
      >
        <IconTrash width={14} height={14} /> Remover
      </button>
    </div>
  );
}

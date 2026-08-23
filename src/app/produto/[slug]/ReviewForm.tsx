"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addReviewAction, type ActionState } from "@/app/actions";
import { IconStar, IconStarOutline } from "@/components/Icons";

const initial: ActionState = {};

export default function ReviewForm({
  productId,
  isLogged,
}: {
  productId: number;
  isLogged: boolean;
}) {
  const [state, formAction, pending] = useActionState(addReviewAction, initial);
  const [rating, setRating] = useState(5);
  const [open, setOpen] = useState(false);

  if (!isLogged)
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 text-sm text-slate-600 flex items-center justify-between gap-3 flex-wrap">
        <span>Comprou este produto? Compartilhe sua opinião.</span>
        <Link
          href="/login"
          className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full"
        >
          Entrar para avaliar
        </Link>
      </div>
    );

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 p-5 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 transition"
      >
        + Escrever uma avaliação
      </button>
    );

  return (
    <form
      action={formAction}
      className="bg-white rounded-2xl border border-slate-100 p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="font-black mb-2">Sua avaliação</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            aria-label={`${s} estrelas`}
            className="text-amber-500"
          >
            {s <= rating ? (
              <IconStar width={26} height={26} />
            ) : (
              <IconStarOutline width={26} height={26} className="text-slate-300" />
            )}
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={3}
        required
        placeholder="Conte como foi sua experiência com o produto..."
        className="mt-3 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30"
      />

      {state.error && (
        <div className="mt-2 text-sm text-red-600">{state.error}</div>
      )}
      {state.ok && (
        <div className="mt-2 text-sm text-emerald-600 font-bold">
          Avaliação publicada. Obrigado!
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          disabled={pending}
          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-sm px-5 py-2.5 rounded-full"
        >
          {pending ? "Enviando..." : "Publicar avaliação"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-bold text-slate-500 px-4"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

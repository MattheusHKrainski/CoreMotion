"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";
import {
  IconBag,
  IconHeart,
  IconHeartFilled,
  IconPlus,
  IconMinus,
  IconCheck,
} from "@/components/Icons";

export default function ProductBuyBox({
  productId,
  sizes,
  stock,
  isFavorite,
  isLogged,
}: {
  productId: number;
  sizes: string[];
  stock: number;
  isFavorite: boolean;
  isLogged: boolean;
}) {
  const router = useRouter();
  const list = sizes.length ? sizes : ["Único"];
  const single = list.length === 1;
  const [size, setSize] = useState<string | null>(single ? list[0] : null);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(isFavorite);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleAdd(buyNow: boolean) {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    if (!size) {
      setErr("Selecione um tamanho para continuar.");
      return;
    }
    setErr(null);
    start(async () => {
      await addToCartAction(productId, size, qty);
      setAdded(true);
      if (buyNow) router.push("/carrinho");
      else router.refresh();
      setTimeout(() => setAdded(false), 2500);
    });
  }

  function handleFav() {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    setFav((f) => !f);
    start(async () => {
      await toggleWishlistAction(productId);
      router.refresh();
    });
  }

  return (
    <div className="mt-5">
      {!single && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tamanho
            </span>
            {size && (
              <span className="text-xs font-bold text-slate-900">{size}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {list.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  setErr(null);
                }}
                className={`min-w-[46px] px-3 h-11 rounded-xl border-2 text-sm font-bold transition ${
                  size === s
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 hover:border-slate-400 text-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Qtd
        </span>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 grid place-items-center hover:bg-slate-50"
            aria-label="Diminuir"
          >
            <IconMinus width={15} height={15} />
          </button>
          <span className="w-10 text-center font-bold text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 10, q + 1))}
            className="w-10 h-10 grid place-items-center hover:bg-slate-50"
            aria-label="Aumentar"
          >
            <IconPlus width={15} height={15} />
          </button>
        </div>
        {stock > 0 && stock <= 6 && (
          <span className="text-xs text-amber-700 font-bold">
            Só restam {stock}
          </span>
        )}
      </div>

      {err && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          disabled={pending || stock === 0}
          onClick={() => handleAdd(true)}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full transition"
        >
          {stock === 0 ? "Produto esgotado" : "Comprar agora"}
        </button>
        <button
          disabled={pending || stock === 0}
          onClick={() => handleAdd(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-900 text-slate-900 disabled:opacity-40 font-bold py-3.5 rounded-full hover:bg-slate-50 transition"
        >
          {added ? (
            <>
              <IconCheck width={18} height={18} /> Adicionado
            </>
          ) : (
            <>
              <IconBag width={18} height={18} /> Adicionar
            </>
          )}
        </button>
        <button
          onClick={handleFav}
          aria-label="Favoritar"
          className={`w-12 h-[52px] grid place-items-center rounded-full border-2 transition ${
            fav
              ? "border-red-500 text-red-600 bg-red-50"
              : "border-slate-200 text-slate-500 hover:border-slate-400"
          }`}
        >
          {fav ? (
            <IconHeartFilled width={20} height={20} />
          ) : (
            <IconHeart width={20} height={20} />
          )}
        </button>
      </div>

      {!isLogged && (
        <p className="mt-2.5 text-xs text-slate-500 text-center">
          Você precisa entrar na sua conta para comprar.
        </p>
      )}
    </div>
  );
}

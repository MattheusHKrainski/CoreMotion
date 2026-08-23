"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addListingToCartAction, deleteListingAction } from "@/app/actions";

export default function ListingActions({
  listingId,
  isOwner,
  isAdmin,
  isLogged,
  status,
}: {
  listingId: number;
  isOwner: boolean;
  isAdmin: boolean;
  isLogged: boolean;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function buy() {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    start(async () => {
      await addListingToCartAction(listingId);
      router.push("/carrinho");
    });
  }

  return (
    <div className="mt-5 space-y-2">
      {status === "Ativo" && !isOwner && (
        <button
          onClick={buy}
          disabled={pending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full"
        >
          {pending ? "Adicionando..." : "Tenho interesse — ir para carrinho"}
        </button>
      )}

      {status !== "Ativo" && (
        <div className="text-center text-sm font-bold text-slate-500 py-3 bg-slate-50 rounded-full">
          Este anúncio está {status.toLowerCase()}
        </div>
      )}

      {(isOwner || isAdmin) && (
        <form
          action={async (fd) => {
            await deleteListingAction(fd);
            router.push("/desapego");
          }}
        >
          <input type="hidden" name="listingId" value={listingId} />
          <button className="w-full border border-red-200 text-red-600 font-bold text-sm py-2.5 rounded-full hover:bg-red-50">
            {isOwner ? "Remover meu anúncio" : "Remover (admin)"}
          </button>
        </form>
      )}

      {!isLogged && (
        <p className="text-xs text-slate-500 text-center">Faça login para negociar.</p>
      )}
    </div>
  );
}

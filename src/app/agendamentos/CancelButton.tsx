"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/app/actions";

export default function CancelButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await cancelBookingAction(bookingId);
          router.refresh();
        })
      }
      className="text-xs font-bold text-slate-500 hover:text-red-600 disabled:opacity-40"
    >
      {pending ? "Cancelando..." : "Cancelar sessão"}
    </button>
  );
}

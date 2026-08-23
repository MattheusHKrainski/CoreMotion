"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPostAction, type ActionState } from "@/app/actions";
import Avatar from "@/components/Avatar";

const initial: ActionState = {};

const SPORTS = [
  "Multi-esportes",
  "Corrida",
  "Futebol",
  "Basquete",
  "Vôlei",
  "Jiu-Jitsu",
  "Surf",
];

export default function Composer({
  isLogged,
  avatar,
  name,
}: {
  isLogged: boolean;
  avatar?: string;
  name?: string;
}) {
  const [state, formAction, pending] = useActionState(createPostAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  if (!isLogged)
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-bold">Participe da conversa</div>
          <div className="text-sm text-slate-500">
            Entre para publicar, curtir e comentar.
          </div>
        </div>
        <Link
          href="/login"
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-full"
        >
          Entrar
        </Link>
      </div>
    );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5"
    >
      <div className="flex gap-3">
        <Avatar src={avatar} name={name ?? "Você"} size={42} />
        <div className="flex-1 min-w-0">
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Como foi seu treino hoje?"
            className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
          />
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <select
              name="sport"
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              {SPORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              disabled={pending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold px-5 py-2 rounded-full text-sm"
            >
              {pending ? "Publicando..." : "Publicar"}
            </button>
          </div>
          {state.error && (
            <div className="mt-2 text-sm text-red-600">{state.error}</div>
          )}
        </div>
      </div>
    </form>
  );
}

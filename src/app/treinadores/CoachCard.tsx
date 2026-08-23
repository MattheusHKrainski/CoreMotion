"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  bookServiceAction,
  toggleFollowAction,
  type ActionState,
} from "@/app/actions";
import Avatar from "@/components/Avatar";
import {
  IconStar,
  IconVerified,
  IconUsers,
  IconPin,
  IconClose,
  IconCheckCircle,
  IconCalendar,
} from "@/components/Icons";

type Coach = {
  id: number;
  name: string;
  sport: string;
  city: string;
  bio: string;
  avatar: string;
  level: string;
  followers: number;
  rating: string;
  pricePerHour: number | null;
  verified: boolean;
};

type Service = {
  id: number;
  title: string;
  modality: string;
  description: string;
  pricePerSession: number;
};

const initial: ActionState = {};

export default function CoachCard({
  coach,
  services,
  isFollowing,
  isLogged,
}: {
  coach: Coach;
  services: Service[];
  isFollowing: boolean;
  isLogged: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(coach.followers);
  const [, startFollow] = useTransition();
  const [state, formAction, pending] = useActionState(bookServiceAction, initial);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  function handleFollow() {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    setFollowing((f) => !f);
    setFollowers((n) => (following ? n - 1 : n + 1));
    startFollow(async () => {
      await toggleFollowAction(coach.id);
      router.refresh();
    });
  }

  const minPrice = services.length
    ? Math.min(...services.map((s) => s.pricePerSession))
    : (coach.pricePerHour ?? 0);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition flex flex-col">
        <div className="flex items-start gap-3.5">
          <Avatar src={coach.avatar} name={coach.name} size={60} rounded="2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-black truncate">{coach.name}</h3>
              {coach.verified && (
                <IconVerified
                  width={14}
                  height={14}
                  className="text-blue-500 shrink-0"
                />
              )}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
              {coach.sport} · {coach.level}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <IconPin width={11} height={11} /> {coach.city}
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {coach.bio}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <IconStar width={12} height={12} className="text-amber-500" />
            <strong className="text-slate-700">
              {Number(coach.rating).toFixed(1)}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <IconUsers width={12} height={12} />
            {followers.toLocaleString("pt-BR")}
          </span>
          <span>{services.length} serviços</span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              A partir de
            </div>
            <div className="text-lg font-black text-emerald-600">
              R${minPrice}
              <span className="text-xs font-medium text-slate-400">/sessão</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleFollow}
              className={`text-xs font-bold px-3 py-2 rounded-full border transition ${
                following
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400"
              }`}
            >
              {following ? "Seguindo" : "Seguir"}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-full"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-5 max-h-[88vh] overflow-auto"
          >
            <div className="flex items-start gap-3.5">
              <Avatar
                src={coach.avatar}
                name={coach.name}
                size={64}
                rounded="2xl"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black truncate">{coach.name}</h3>
                <div className="text-sm text-emerald-600 font-bold">
                  {coach.sport} · {coach.city}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <IconStar width={12} height={12} className="text-amber-500" />
                    {Number(coach.rating).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUsers width={12} height={12} />
                    {followers.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-900 shrink-0"
                aria-label="Fechar"
              >
                <IconClose width={22} height={22} />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-700">{coach.bio}</p>

            {state.ok ? (
              <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                <IconCheckCircle
                  width={34}
                  height={34}
                  className="mx-auto text-emerald-600"
                />
                <div className="mt-2 font-black text-emerald-900">
                  Sessão agendada!
                </div>
                <p className="text-sm text-emerald-800 mt-1">
                  Você pode acompanhar em &quot;Agendamentos&quot;.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/agendamentos");
                  }}
                  className="mt-3 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
                >
                  Ver meus agendamentos
                </button>
              </div>
            ) : (
              <form action={formAction} className="mt-5">
                <h4 className="font-black text-sm mb-2">
                  Escolha o serviço
                </h4>
                <div className="space-y-2">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className={`block p-4 border-2 rounded-2xl cursor-pointer transition ${
                        selectedService === s.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceId"
                        value={s.id}
                        checked={selectedService === s.id}
                        onChange={() => setSelectedService(s.id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm">{s.title}</div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                          {s.modality}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {s.description}
                      </p>
                      <div className="mt-2 font-black text-emerald-600">
                        R${s.pricePerSession}
                        <span className="text-xs font-medium text-slate-400">
                          /sessão
                        </span>
                      </div>
                    </label>
                  ))}
                  {services.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">
                      Este treinador ainda não publicou serviços.
                    </div>
                  )}
                </div>

                {services.length > 0 && (
                  <>
                    <div className="mt-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <IconCalendar width={13} height={13} /> Data e horário
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduledFor"
                        required
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </div>

                    {state.error && (
                      <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {state.error}
                      </div>
                    )}

                    <button
                      disabled={pending || !selectedService}
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-full"
                    >
                      {pending ? "Confirmando..." : "Confirmar agendamento"}
                    </button>
                    {!isLogged && (
                      <p className="mt-2 text-xs text-slate-500 text-center">
                        Você precisa estar logado para agendar.
                      </p>
                    )}
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

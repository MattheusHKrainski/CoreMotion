"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowAction } from "@/app/actions";
import Avatar from "@/components/Avatar";
import {
  IconStar,
  IconVerified,
  IconUsers,
  IconPin,
  IconChat,
  IconCheck,
} from "@/components/Icons";

type Athlete = {
  id: number;
  name: string;
  handle: string;
  sport: string;
  city: string;
  bio: string;
  avatar: string;
  level: string;
  followers: number;
  rating: string;
  verified: boolean;
};

export default function AthleteCard({
  athlete,
  isFollowing,
  isLogged,
  isMe,
}: {
  athlete: Athlete;
  isFollowing: boolean;
  isLogged: boolean;
  isMe: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(athlete.followers);
  const [, start] = useTransition();

  function handle() {
    if (!isLogged) {
      router.push("/login");
      return;
    }
    setFollowing((f) => !f);
    setFollowers((n) => (following ? n - 1 : n + 1));
    start(async () => {
      await toggleFollowAction(athlete.id);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition">
      <div className="h-20 bg-gradient-to-br from-sky-500 to-blue-700 relative">
        <svg
          className="absolute inset-0 w-full h-full opacity-15"
          viewBox="0 0 200 80"
          fill="none"
        >
          <path
            d="M0 60 L40 40 L80 50 L120 20 L160 30 L200 10"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute -bottom-7 left-5">
          <div className="ring-4 ring-white rounded-2xl">
            <Avatar
              src={athlete.avatar}
              name={athlete.name}
              size={58}
              rounded="2xl"
            />
          </div>
        </div>
        <span className="absolute top-3 right-3 bg-white/95 text-sky-700 text-[10px] font-black uppercase px-2 py-1 rounded-full">
          {athlete.level}
        </span>
      </div>

      <div className="pt-9 px-5 pb-5">
        <div className="flex items-center gap-1">
          <h3 className="font-black truncate">{athlete.name}</h3>
          {athlete.verified && (
            <IconVerified
              width={14}
              height={14}
              className="text-blue-500 shrink-0"
            />
          )}
        </div>
        <div className="text-[11px] text-sky-600 font-bold uppercase tracking-wider">
          {athlete.sport} · @{athlete.handle}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <IconPin width={11} height={11} /> {athlete.city || "Brasil"}
        </div>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {athlete.bio}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <IconUsers width={12} height={12} />
            {followers.toLocaleString("pt-BR")} seguidores
          </span>
          <span className="flex items-center gap-1">
            <IconStar width={12} height={12} className="text-amber-500" />
            {Number(athlete.rating).toFixed(1)}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          {isMe ? (
            <div className="flex-1 text-center text-sm font-bold text-slate-400 py-2">
              Este é você
            </div>
          ) : (
            <>
              <button
                onClick={handle}
                className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-sm py-2 rounded-full transition ${
                  following
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-sky-600 text-white hover:bg-sky-700"
                }`}
              >
                {following ? (
                  <>
                    <IconCheck width={14} height={14} /> Seguindo
                  </>
                ) : (
                  "Conectar"
                )}
              </button>
              <button
                aria-label="Mensagem"
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600"
              >
                <IconChat width={16} height={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

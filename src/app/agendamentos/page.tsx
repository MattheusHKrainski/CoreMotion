import Link from "next/link";
import { db } from "@/db";
import { bookings, coachServices, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import CancelButton from "./CancelButton";
import { IconCalendar, IconClock, IconPin } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const me = await getCurrentUser();

  if (!me)
    return (
      <div className="max-w-md mx-auto p-8 py-20 text-center">
        <IconCalendar
          width={40}
          height={40}
          className="mx-auto text-slate-400"
        />
        <h1 className="mt-4 text-2xl font-black">
          Entre para ver seus agendamentos
        </h1>
        <Link
          href="/login"
          className="inline-block mt-5 bg-red-600 text-white font-bold px-6 py-3 rounded-full"
        >
          Entrar na conta
        </Link>
      </div>
    );

  const list = await db
    .select({
      id: bookings.id,
      scheduledFor: bookings.scheduledFor,
      status: bookings.status,
      price: bookings.price,
      createdAt: bookings.createdAt,
      serviceTitle: coachServices.title,
      modality: coachServices.modality,
      coachName: users.name,
      coachAvatar: users.avatar,
      coachSport: users.sport,
      coachCity: users.city,
    })
    .from(bookings)
    .innerJoin(coachServices, eq(bookings.serviceId, coachServices.id))
    .innerJoin(users, eq(bookings.coachId, users.id))
    .where(eq(bookings.userId, me.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">
        Agendamentos
      </h1>
      <p className="text-slate-500 text-sm mt-0.5">
        Suas sessões com treinadores.
      </p>

      {list.length === 0 ? (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <IconCalendar
            width={40}
            height={40}
            className="mx-auto text-slate-300"
          />
          <div className="mt-3 font-bold text-lg">
            Você ainda não agendou nada
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Encontre um treinador e marque sua primeira sessão.
          </p>
          <Link
            href="/treinadores"
            className="inline-block mt-4 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full"
          >
            Ver treinadores
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((b) => {
            const canceled = b.status === "Cancelado";
            const when = new Date(b.scheduledFor);
            const valid = !isNaN(when.getTime());
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 ${
                  canceled ? "border-slate-100 opacity-60" : "border-slate-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={b.coachAvatar}
                    name={b.coachName}
                    size={52}
                    rounded="2xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black">{b.serviceTitle}</h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {b.modality}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      com <strong>{b.coachName}</strong> · {b.coachSport}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <IconClock width={12} height={12} />
                        {valid
                          ? when.toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : b.scheduledFor}
                      </span>
                      {b.coachCity && (
                        <span className="flex items-center gap-1">
                          <IconPin width={12} height={12} /> {b.coachCity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-emerald-600">
                      R${b.price}
                    </div>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                        canceled
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                {!canceled && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <CancelButton bookingId={b.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

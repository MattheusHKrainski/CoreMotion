import { db } from "@/db";
import { reports, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { adminResolveReportAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const list = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      resolution: reports.resolution,
      createdAt: reports.createdAt,
      reporterName: users.name,
      reporterEmail: users.email,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Denúncias</h1>
        <p className="text-sm text-slate-500">
          Analise denúncias de usuários, posts, produtos e avaliações.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          Nenhuma denúncia registrada.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded-full">
                      {r.targetType} #{r.targetId}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        r.status === "Aberto"
                          ? "bg-red-100 text-red-700"
                          : r.status === "Resolvido"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-2 font-black">{r.reason}</div>
                  <p className="text-sm text-slate-600 mt-1">{r.details}</p>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Por {r.reporterName ?? "anônimo"}
                    {r.reporterEmail ? ` (${r.reporterEmail})` : ""} ·{" "}
                    {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </div>
                  {r.resolution && (
                    <div className="mt-2 text-xs bg-slate-50 rounded-lg px-3 py-2">
                      <strong>Resolução:</strong> {r.resolution}
                    </div>
                  )}
                </div>

                {r.status !== "Resolvido" && r.status !== "Descartado" && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <form action={adminResolveReportAction} className="space-y-1.5">
                      <input type="hidden" name="reportId" value={r.id} />
                      <input type="hidden" name="status" value="Resolvido" />
                      <input
                        name="resolution"
                        placeholder="Ação tomada..."
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                      />
                      <button className="w-full text-xs font-bold bg-emerald-600 text-white py-1.5 rounded-lg">
                        Marcar resolvido
                      </button>
                    </form>
                    <form action={adminResolveReportAction}>
                      <input type="hidden" name="reportId" value={r.id} />
                      <input type="hidden" name="status" value="Descartado" />
                      <input
                        type="hidden"
                        name="resolution"
                        value="Descartado — sem violação"
                      />
                      <button className="w-full text-xs font-bold border border-slate-200 py-1.5 rounded-lg hover:bg-slate-50">
                        Descartar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

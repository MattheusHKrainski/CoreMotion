import { db } from "@/db";
import { storeVerifications, stores, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { adminReviewVerificationAction } from "@/app/actions";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function AdminVerificacoesPage() {
  const list = await db
    .select({
      id: storeVerifications.id,
      status: storeVerifications.status,
      legalName: storeVerifications.legalName,
      tradeName: storeVerifications.tradeName,
      cnpj: storeVerifications.cnpj,
      responsibleName: storeVerifications.responsibleName,
      responsibleEmail: storeVerifications.responsibleEmail,
      brandName: storeVerifications.brandName,
      brandRelation: storeVerifications.brandRelation,
      reason: storeVerifications.reason,
      createdAt: storeVerifications.createdAt,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeVerified: stores.verified,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(storeVerifications)
    .innerJoin(stores, eq(storeVerifications.storeId, stores.id))
    .innerJoin(users, eq(stores.ownerId, users.id))
    .orderBy(desc(storeVerifications.createdAt));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Verificações oficiais</h1>
        <p className="text-sm text-slate-500">
          Analise solicitações de selo Verificado. Processo rigoroso: empresa, responsável e marca.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          Nenhuma solicitação de verificação.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black">{v.storeName}</span>
                    <span className="text-xs text-slate-500">/{v.storeSlug}</span>
                    {v.storeVerified && <VerifiedBadge size="sm" />}
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${v.status === "approved" ? "bg-emerald-100 text-emerald-700" : v.status === "pending" ? "bg-amber-100 text-amber-700" : v.status === "under_review" ? "bg-blue-100 text-blue-700" : v.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600"}`}>
                      {v.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <div><strong>Empresa:</strong> {v.legalName} ({v.tradeName}) — CNPJ {v.cnpj}</div>
                    <div><strong>Responsável:</strong> {v.responsibleName} — {v.responsibleEmail}</div>
                    <div><strong>Dono da conta:</strong> {v.ownerName} — {v.ownerEmail}</div>
                    {v.brandName && <div><strong>Marca:</strong> {v.brandName} ({v.brandRelation})</div>}
                    {v.reason && <div className="text-slate-600"><strong>Motivo/Obs:</strong> {v.reason}</div>}
                    <div className="text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleString("pt-BR")}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[260px]">
                  {v.status !== "approved" && (
                    <form action={adminReviewVerificationAction} className="flex gap-2">
                      <input type="hidden" name="verificationId" value={v.id} />
                      <input type="hidden" name="status" value="approved" />
                      <input type="hidden" name="reason" value="Aprovado após análise de CNPJ, domínio e vínculo com marca" />
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg">Aprovar e conceder selo</button>
                    </form>
                  )}
                  {v.status !== "rejected" && v.status !== "approved" && (
                    <form action={adminReviewVerificationAction} className="space-y-1.5">
                      <input type="hidden" name="verificationId" value={v.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <input name="reason" required placeholder="Motivo da rejeição..." className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2" />
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg">Rejeitar</button>
                    </form>
                  )}
                  {v.status === "approved" && (
                    <form action={adminReviewVerificationAction} className="space-y-1.5">
                      <input type="hidden" name="verificationId" value={v.id} />
                      <input type="hidden" name="status" value="revoked" />
                      <input name="reason" required placeholder="Motivo da revogação..." className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2" />
                      <button className="w-full bg-slate-800 hover:bg-black text-white text-xs font-bold py-2 rounded-lg">Revogar verificação</button>
                    </form>
                  )}
                  {v.status === "pending" && (
                    <form action={adminReviewVerificationAction}>
                      <input type="hidden" name="verificationId" value={v.id} />
                      <input type="hidden" name="status" value="under_review" />
                      <button className="w-full border border-slate-200 text-xs font-bold py-2 rounded-lg hover:bg-slate-50">Marcar em análise</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores, storeVerifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import VerificationForm from "./VerificationForm";
import Link from "next/link";
import { IconArrowLeft, IconShield } from "@/components/Icons";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function VerificacaoPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, me.id)).limit(1);
  if (!store) redirect("/minha-loja");

  const verifications = await db
    .select()
    .from(storeVerifications)
    .where(eq(storeVerifications.storeId, store.id))
    .orderBy(desc(storeVerifications.createdAt));

  const current = verifications[0];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/minha-loja" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600">
        <IconArrowLeft width={16} height={16} /> Voltar para Minha Loja
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 grid place-items-center text-white">
            <IconShield width={20} height={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Verificação oficial</h1>
            <p className="text-sm text-slate-500">Solicite o selo Verificado para {store.name}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <div className="font-bold">{store.name}</div>
              <div className="text-xs text-slate-500">/{store.slug} · {store.city} {store.state && `- ${store.state}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.verified ? <VerifiedBadge size="md" /> : <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold uppercase">Não verificado</span>}
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${store.verificationStatus === "approved" ? "bg-emerald-100 text-emerald-700" : store.verificationStatus === "pending" || store.verificationStatus === "under_review" ? "bg-amber-100 text-amber-700" : store.verificationStatus === "rejected" ? "bg-red-100 text-red-700" : store.verificationStatus === "revoked" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-500"}`}>
              {store.verificationStatus}
            </span>
          </div>
        </div>

        {current && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm">
            <div className="font-bold">Última solicitação: {current.status} · {new Date(current.createdAt).toLocaleString("pt-BR")}</div>
            {current.reason && <div className="text-slate-600 mt-1">{current.reason}</div>}
          </div>
        )}

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900">
          <strong>O que significa o selo Verificado?</strong><br />
          O CoreMotion analisa e confirma a legitimidade da loja conforme critérios internos (existência da empresa, vínculo com marca, domínio, e-mail comercial, redes sociais). O selo NÃO garante automaticamente produtos, preços ou entrega — veja política completa em /verificacao.
        </div>
      </div>

      <VerificationForm storeId={store.id} currentStatus={store.verificationStatus} />

      <div className="text-[11px] text-slate-400">
        Processo interno: not_requested → pending → under_review → approved/rejected → revoked. O público vê apenas "Verificado" ou nenhum selo. Documentos são privados e só acessíveis por admin.
      </div>
    </div>
  );
}

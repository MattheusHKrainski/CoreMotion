import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IconBag, IconUsers, IconArrowRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function AnnouncePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const myStores = await db.select().from(stores).where(eq(stores.ownerId, me.id));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Anunciar</h1>
      <p className="text-slate-500 text-sm">Escolha o modelo de venda do CoreMotion</p>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Link href="/desapego/novo" className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-0.5 transition">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white">
            <IconUsers width={24} height={24} />
          </div>
          <h2 className="mt-4 text-xl font-black">Desapego (C2C)</h2>
          <p className="text-sm text-slate-600 mt-1">
            Venda produtos esportivos que você não usa mais. Negociação direta entre usuários.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>• Anúncio grátis e ilimitado</li>
            <li>• Negociação direta no chat</li>
            <li>• Ideal para tênis usados, bolas, pranchas</li>
          </ul>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            Criar anúncio C2C <IconArrowRight width={16} height={16} />
          </div>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 grid place-items-center text-white">
            <IconBag width={24} height={24} />
          </div>
          <h2 className="mt-4 text-xl font-black">Loja / B2C</h2>
          <p className="text-sm text-slate-600 mt-1">
            Venda como loja profissional com vitrine, checkout e repasse.
          </p>

          {myStores.length === 0 ? (
            <>
              <p className="text-xs text-slate-500 mt-3">Você ainda não tem loja. Crie uma em 30 segundos.</p>
              <Link href="/lojas/nova" className="mt-4 inline-flex items-center gap-1.5 bg-slate-900 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-red-600">
                Criar minha loja <IconArrowRight width={16} height={16} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 mt-3">Suas lojas:</p>
              <div className="mt-2 space-y-1.5">
                {myStores.map((s) => (
                  <Link key={s.id} href={`/lojas/${s.slug}`} className="block text-sm font-bold text-slate-800 hover:text-red-600">
                    {s.name} · {s.productCount} produtos
                  </Link>
                ))}
              </div>
              <Link href="/lojas/nova" className="mt-4 inline-block text-sm font-bold text-red-600">
                + Criar outra loja
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

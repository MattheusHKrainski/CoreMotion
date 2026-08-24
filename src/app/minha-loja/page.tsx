import Link from "next/link";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureSeed } from "@/lib/seed";
import Avatar from "@/components/Avatar";
import { money } from "@/components/ProductCard";
import { IconBag, IconPin, IconShield, IconVerified, IconArrowRight } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function MinhaLojaPage() {
  await ensureSeed();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.banned) redirect("/");

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, me.id)).limit(1);

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white">
          <div className="relative h-56 bg-gradient-to-br from-red-600 to-red-800">
            <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 200" fill="none">
              <path d="M0 180 L60 140 L120 155 L180 90 L240 110 L300 40 L400 60" stroke="white" strokeWidth="8" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-center text-white">
              <span className="self-start bg-white/20 backdrop-blur text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">CoreMotion Marketplace</span>
              <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight leading-tight">Crie sua loja no CoreMotion</h1>
              <p className="mt-3 text-white/90 max-w-xl">Venda seus produtos esportivos dentro do nosso marketplace. Ganhe vitrine própria, checkout integrado e alcance atletas de todo o Brasil.</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { t: "Vitrine própria", d: "Sua loja com logo, banner e produtos em /loja/sua-loja" },
                { t: "Checkout CoreMotion", d: "Pagamentos, frete e pedidos gerenciados pela plataforma" },
                { t: "Alcance nacional", d: "Apareça no marketplace, buscas e recomendações" },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="font-bold">{f.t}</div>
                  <div className="text-sm text-slate-500 mt-1">{f.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/minha-loja/criar" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-full text-center">
                Criar minha loja
              </Link>
              <span className="text-xs text-slate-500">Leva menos de 2 minutos. Grátis para começar.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          Dica: você pode criar apenas uma loja por conta. Contas com denúncias podem ser analisadas pelo time do CoreMotion.
        </div>
      </div>
    );
  }

  const prods = await db.select().from(products).where(eq(products.storeId, store.id)).orderBy(desc(products.createdAt)).limit(6);
  const totalStock = prods.reduce((s, p) => s + p.stock, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl overflow-hidden bg-white border border-slate-200">
        <div className="relative h-48 md:h-56 bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.banner} alt="" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 p-5 md:p-7 flex items-end gap-4 w-full text-white">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={store.logo} alt={store.name} className="w-full h-full object-contain p-2" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">{store.name}</h1>
                {store.verified && <IconVerified width={18} height={18} className="text-sky-400" />}
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${store.active ? "bg-emerald-500 text-white" : "bg-slate-600 text-white"}`}>
                  {store.active ? "Ativa" : "Oculta"}
                </span>
              </div>
              <div className="text-sm text-white/80 truncate">{store.shortDescription || store.description}</div>
              <div className="text-xs text-white/60 flex items-center gap-2 mt-1">
                <IconPin width={12} height={12} /> {store.city} {store.state && `· ${store.state}`} · /{store.slug}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className="text-2xl font-black">{store.productCount}</div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Produtos</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className="text-2xl font-black">{totalStock}</div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Em estoque</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className="text-2xl font-black">{Number(store.rating).toFixed(1)}</div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Avaliação</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black">Dados da loja</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">E-mail de contato</dt><dd className="font-semibold">{store.email || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Telefone / WhatsApp</dt><dd className="font-semibold">{store.phone || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Cidade / Estado</dt><dd className="font-semibold">{store.city} {store.state && `/ ${store.state}`}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Categoria</dt><dd className="font-semibold">{store.category}</dd></div>
                {store.social && <div className="flex justify-between"><dt className="text-slate-500">Instagram</dt><dd className="font-semibold">{store.social}</dd></div>}
                <div className="flex justify-between"><dt className="text-slate-500">Identificador</dt><dd className="font-mono text-xs">/{store.slug}</dd></div>
              </dl>
            </div>

            {store.description && (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <h3 className="font-bold text-sm">Sobre a loja</h3>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{store.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-black">Ações rápidas</h3>
            <Link href={`/loja/${store.slug}`} className="flex items-center justify-between bg-slate-900 text-white font-bold px-4 py-3 rounded-xl hover:bg-black">
              <span className="flex items-center gap-2"><IconShield width={18} height={18} /> Visualizar loja</span>
              <IconArrowRight width={16} height={16} />
            </Link>
            <Link href="/minha-loja/editar" className="flex items-center justify-between bg-white border-2 border-slate-900 font-bold px-4 py-3 rounded-xl hover:bg-slate-50">
              Editar loja
              <IconArrowRight width={16} height={16} />
            </Link>
            <Link href="/minha-loja/verificacao" className="flex items-center justify-between bg-sky-50 border border-sky-200 text-sky-800 font-bold px-4 py-3 rounded-xl hover:bg-sky-100">
              <span className="flex items-center gap-2"><IconVerified width={18} height={18} /> {store.verified ? "Loja verificada" : "Solicitar verificação"}</span>
              <IconArrowRight width={16} height={16} />
            </Link>
            <Link href="/minha-loja/produtos" className="flex items-center justify-between bg-white border border-slate-200 font-bold px-4 py-3 rounded-xl hover:border-slate-400">
              <span className="flex items-center gap-2"><IconBag width={18} height={18} /> Gerenciar produtos</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{store.productCount}</span>
            </Link>
            <Link href="/minha-loja/produtos/novo" className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl">
              + Adicionar produto
            </Link>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Sua loja aparece em <strong>/lojas</strong> e <strong>/marketplace</strong>. O selo verificado, quando aprovado, aparece automaticamente na vitrine e em todos os produtos.
            </div>
          </div>
        </div>
      </div>

      {/* Produtos recentes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">Produtos recentes</h2>
          <Link href="/minha-loja/produtos" className="text-sm font-bold text-red-600">Gerenciar tudo</Link>
        </div>
        {prods.length === 0 ? (
          <div className="text-center py-10">
            <div className="font-bold">Você ainda não cadastrou produtos</div>
            <p className="text-sm text-slate-500 mt-1">Adicione seu primeiro produto para começar a vender.</p>
            <Link href="/minha-loja/produtos/novo" className="inline-block mt-4 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">Cadastrar produto</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {prods.map((p) => (
              <Link key={p.id} href={`/produto/${p.slug}`} className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition bg-white">
                <div className="aspect-square bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain p-3" />
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm line-clamp-1">{p.name}</div>
                  <div className="text-sm font-black text-red-600">{money(p.price)}</div>
                  <div className="text-[11px] text-slate-500">{p.stock} em estoque · {p.active ? "Ativo" : "Oculto"}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

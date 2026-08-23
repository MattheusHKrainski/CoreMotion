import Link from "next/link";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql, SQL, gte, lte } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import ProductCard from "@/components/ProductCard";
import { IconScan, IconTruck, IconShield, IconCreditCard } from "@/components/Icons";

export const dynamic = "force-dynamic";

type SP = Promise<{
  q?: string;
  sport?: string;
  brand?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
}>;

const SPORTS = ["Corrida","Futebol","Basquete","Vôlei","Jiu-Jitsu","Surf","Lifestyle","Multi-esportes"];
const BRANDS = ["Nike","Adidas","Asics","Puma","New Balance","Mizuno","Jordan","Under Armour","Olympikus","Spalding","Koral","Mormaii","Garmin","Oxer"];
const CATEGORIES = ["Tênis de Corrida","Tênis de Basquete","Tênis Casual","Tênis de Quadra","Chuteiras","Bolas","Vestuário","Acessórios","Equipamento","Eletrônicos"];

function buildQS(base: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const merged = { ...base, ...patch };
  const usp = new URLSearchParams();
  Object.entries(merged).forEach(([k, v]) => { if (v) usp.set(k, v); });
  const s = usp.toString();
  return s ? `/marketplace?${s}` : "/marketplace";
}

export default async function MarketplacePage({ searchParams }: { searchParams: SP }) {
  await ensureSeed();
  const sp = await searchParams;
  const { q, sport, brand, category, sort, min, max } = sp;

  const wheres: SQL[] = [eq(products.active, true)];
  if (sport) wheres.push(eq(products.sport, sport));
  if (brand) wheres.push(eq(products.brand, brand));
  if (category) wheres.push(eq(products.category, category));
  if (min) wheres.push(gte(products.price, min));
  if (max) wheres.push(lte(products.price, max));
  if (q) {
    const like = `%${q}%`;
    wheres.push(or(ilike(products.name, like), ilike(products.brand, like), ilike(products.category, like), ilike(products.colorway, like))!);
  }

  const orderBy =
    sort === "price_asc" ? asc(sql`${products.price}::numeric`) :
    sort === "price_desc" ? desc(sql`${products.price}::numeric`) :
    sort === "rating" ? desc(sql`${products.rating}::numeric`) :
    sort === "reviews" ? desc(products.reviewCount) :
    desc(products.featured);

  const list = await db
    .select({
      product: products,
      storeName: stores.name,
      storeSlug: stores.slug,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(wheres.length ? and(...wheres) : undefined)
    .orderBy(orderBy);

  const activeFilters = [sport, brand, category, min || max ? "preço" : null].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {[
          { Icon: IconTruck, t: "Frete grátis", d: "acima de R$249" },
          { Icon: IconCreditCard, t: "10x sem juros", d: "ou 5% off no PIX" },
          { Icon: IconShield, t: "Loja verificada", d: "produtos oficiais" },
          { Icon: IconScan, t: "SmartScan", d: "compare preços" },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-100 px-3 py-2.5">
            <Icon width={20} height={20} className="text-red-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{t}</div>
              <div className="text-[10px] text-slate-500 truncate">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {q ? `Resultados para "${q}"` : category || sport || brand || "Marketplace CoreMotion"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {list.length} produto{list.length !== 1 ? "s" : ""} · {activeFilters.length ? `filtros: ${activeFilters.join(", ")}` : "lojas oficiais e parceiras"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { v: "", l: "Destaques" },
            { v: "price_asc", l: "Menor preço" },
            { v: "price_desc", l: "Maior preço" },
            { v: "rating", l: "Melhor avaliado" },
            { v: "reviews", l: "Mais populares" },
          ].map((o) => (
            <Link key={o.l} href={buildQS(sp, { sort: o.v || undefined })} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${ (sort ?? "") === o.v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              {o.l}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-5">
          {(activeFilters.length > 0 || q) && (
            <Link href="/marketplace" className="block text-center text-xs font-bold text-red-600 border border-red-200 bg-red-50 rounded-lg py-2">
              Limpar filtros
            </Link>
          )}

          <FilterGroup title="Esporte" items={SPORTS} current={sport} param="sport" sp={sp} />
          <FilterGroup title="Categoria" items={CATEGORIES} current={category} param="category" sp={sp} />
          <FilterGroup title="Marca" items={BRANDS} current={brand} param="brand" sp={sp} />

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Faixa de preço</div>
            <div className="space-y-1">
              {[
                { l: "Até R$300", min: undefined, max: "300" },
                { l: "R$300 a R$800", min: "300", max: "800" },
                { l: "R$800 a R$1.500", min: "800", max: "1500" },
                { l: "Acima de R$1.500", min: "1500", max: undefined },
              ].map((r) => {
                const active = (min ?? "") === (r.min ?? "") && (max ?? "") === (r.max ?? "");
                return (
                  <Link key={r.l} href={buildQS(sp, { min: active ? undefined : r.min, max: active ? undefined : r.max })} className={`block text-sm px-2.5 py-1.5 rounded-lg transition ${active ? "bg-red-50 text-red-600 font-bold" : "text-slate-600 hover:bg-slate-100"}`}>
                    {r.l}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link href="/lojas" className="block rounded-xl bg-slate-900 text-white p-4 hover:bg-black transition">
            <div className="font-black text-sm">Conheça as lojas</div>
            <div className="text-xs text-slate-300 mt-1">Nike, Adidas, Asics e mais parceiros oficiais</div>
            <div className="mt-2 text-xs font-bold text-red-400">Ver lojas →</div>
          </Link>
        </aside>

        <div>
          {list.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="font-bold text-lg">Nenhum produto encontrado</div>
              <p className="text-slate-500 text-sm mt-1">Tente remover filtros ou buscar outro termo.</p>
              <Link href="/marketplace" className="inline-block mt-4 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">Ver catálogo</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {list.map(({ product: p, storeName, storeSlug }) => (
                <div key={p.id} className="relative">
                  <ProductCard p={p} />
                  {storeName && storeSlug && (
                    <Link href={`/loja/${storeSlug}`} className="mt-1.5 block text-[11px] text-slate-500 hover:text-red-600 truncate">
                      Vendido por <strong>{storeName}</strong>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, items, current, param, sp }: { title: string; items: string[]; current?: string; param: string; sp: Record<string, string | undefined> }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{title}</div>
      <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
        {items.map((it) => {
          const active = current === it;
          return (
            <Link key={it} href={buildQS(sp, { [param]: active ? undefined : it })} className={`block text-sm px-2.5 py-1.5 rounded-lg transition ${active ? "bg-red-50 text-red-600 font-bold" : "text-slate-600 hover:bg-slate-100"}`}>
              {it}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

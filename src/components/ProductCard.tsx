import Link from "next/link";
import { IconStar } from "@/components/Icons";
import VerifiedBadge from "./VerifiedBadge";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string | null;
  image: string;
  rating: string;
  reviewCount: number;
  badge: string | null;
  stock: number;
  storeName?: string | null;
  storeVerified?: boolean | null;
};

export function money(v: number | string) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ p }: { p: ProductCardData }) {
  const discount = p.oldPrice && Math.round((1 - Number(p.price) / Number(p.oldPrice)) * 100);
  const installment = Number(p.price) / 10;

  return (
    <Link href={`/produto/${p.slug}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col">
      <div className="relative aspect-square bg-white overflow-hidden border-b border-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {discount ? <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full">-{discount}%</span> : null}
          {p.badge && <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full">{p.badge}</span>}
        </div>
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 grid place-items-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">Esgotado</span>
          </div>
        )}
        {p.stock > 0 && p.stock <= 6 && (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full">Últimas {p.stock}</span>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider truncate">{p.brand}</div>
          {p.storeVerified && <VerifiedBadge size="sm" withLabel={false} className="px-1" />}
        </div>
        <div className="mt-0.5 font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</div>
        {p.storeName && (
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            {p.storeName} {p.storeVerified && <span className="inline-flex align-middle ml-1"><VerifiedBadge size="sm" withLabel={false} /></span>}
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
          <IconStar width={11} height={11} className="text-amber-500" />
          <span className="font-bold text-slate-700">{Number(p.rating).toFixed(1)}</span>
          <span>({p.reviewCount})</span>
        </div>
        <div className="mt-auto pt-2.5">
          {p.oldPrice && <div className="text-[11px] line-through text-slate-400">{money(p.oldPrice)}</div>}
          <div className="text-lg font-black text-slate-900">{money(p.price)}</div>
          <div className="text-[10px] text-slate-500">10x de {money(installment)} sem juros</div>
        </div>
      </div>
    </Link>
  );
}

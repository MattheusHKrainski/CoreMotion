"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import CameraScanner from "./CameraScanner";
import { money } from "@/components/ProductCard";
import {
  IconScan,
  IconSparkles,
  IconShield,
  IconTrendUp,
  IconTrendDown,
  IconDumbbell,
  IconRefresh,
  IconClose,
  IconStar,
} from "@/components/Icons";

type CodeOption = { scanCode: string; ean: string; name: string; image: string };

type ScanResult = {
  matched: boolean;
  code: string;
  insight: string;
  product?: {
    id: number;
    slug: string;
    name: string;
    brand: string;
    category: string;
    sport: string;
    price: string;
    oldPrice: string | null;
    image: string;
    description: string;
    rating: string;
    reviewCount: number;
    stock: number;
    scanCode: string;
  };
  analysis?: {
    marketAverage: number;
    savings: number;
    isGoodDeal: boolean;
    authenticityScore: number;
    recommendedAction: string;
    training: string[];
    resell: { estimatedUsedPrice: number; demand: string };
  };
  suggestions?: string[];
};

export default function ScannerClient({
  availableCodes,
}: {
  availableCodes: CodeOption[];
}) {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  const runScan = useCallback(async (input: string) => {
    const target = input.trim().toUpperCase();
    if (!target) return;
    setScanning(true);
    setResult(null);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: target }),
    });
    const data: ScanResult = await res.json();
    setResult(data);
    setHistory((h) => [data, ...h].slice(0, 6));
    setScanning(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
            <IconSparkles width={11} height={11} /> Exclusivo
          </span>
          <span className="text-xs font-bold text-slate-500">
            Funciona com a câmera do seu celular
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          SmartScan <span className="text-purple-600">AI</span>
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl text-sm md:text-base">
          Aponte a câmera para o código de barras de qualquer produto esportivo.
          Identificamos o item, verificamos autenticidade, comparamos com o preço
          médio do mercado e montamos um plano de treino para você.
        </p>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        {/* Scanner */}
        <div className="bg-slate-900 rounded-3xl text-white p-5 shadow-xl h-fit lg:sticky lg:top-24">
          <CameraScanner onDetected={runScan} scanning={scanning} />

          <div className="mt-4 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan(code)}
              inputMode="text"
              placeholder="Digite o código (ex: SPH-001)"
              className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              onClick={() => runScan(code)}
              disabled={scanning}
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-bold px-4 py-2.5 rounded-xl text-sm shrink-0"
            >
              {scanning ? (
                <IconRefresh width={16} height={16} className="animate-spin" />
              ) : (
                <IconScan width={16} height={16} />
              )}
              Buscar
            </button>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">
              Códigos para testar
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {availableCodes.slice(0, 12).map((c) => (
                <button
                  key={c.scanCode}
                  onClick={() => {
                    setCode(c.scanCode);
                    runScan(c.scanCode);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-purple-600 border border-slate-700 px-2 py-1 rounded-md font-mono transition"
                  title={c.name}
                >
                  {c.scanCode}
                </button>
              ))}
              <button
                onClick={() => runScan("XXX-999")}
                className="text-[11px] bg-slate-800 hover:bg-red-600 border border-slate-700 px-2 py-1 rounded-md font-mono transition"
              >
                falha
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !scanning && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 grid place-items-center text-purple-600 mb-3">
                <IconSparkles width={26} height={26} />
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                Seis análises em um único scan
              </h3>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {[
                  {
                    Icon: IconSparkles,
                    title: "Identificação instantânea",
                    desc: "Lê EAN-13, Code-128, QR e nosso código interno.",
                  },
                  {
                    Icon: IconTrendDown,
                    title: "Comparador de preço",
                    desc: "Cruzamos com a média praticada no mercado.",
                  },
                  {
                    Icon: IconShield,
                    title: "Score anti-falsificação",
                    desc: "Verificação do checksum da etiqueta.",
                  },
                  {
                    Icon: IconDumbbell,
                    title: "Plano de treino",
                    desc: "Como extrair o máximo do produto escaneado.",
                  },
                  {
                    Icon: IconRefresh,
                    title: "Valor de revenda",
                    desc: "Quanto vale seu usado hoje.",
                  },
                  {
                    Icon: IconTrendUp,
                    title: "Demanda de mercado",
                    desc: "O quanto esse item está sendo procurado.",
                  },
                ].map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <Icon width={21} height={21} className="text-purple-600" />
                    <div className="font-bold mt-2 text-sm">{title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scanning && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center">
              <IconRefresh
                width={32}
                height={32}
                className="mx-auto animate-spin text-purple-600"
              />
              <div className="mt-3 font-bold">Processando análise...</div>
            </div>
          )}

          {result && !result.matched && (
            <div className="bg-white border border-red-200 rounded-3xl p-6 md:p-8">
              <div className="w-12 h-12 rounded-2xl bg-red-100 grid place-items-center text-red-600 mb-3">
                <IconClose width={26} height={26} />
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                Produto não identificado
              </h3>
              <p className="text-slate-600 mt-1 text-sm">{result.insight}</p>
              <div className="mt-2 font-mono text-xs text-slate-400">
                Código lido: {result.code}
              </div>
              {result.suggestions && (
                <ul className="mt-4 space-y-2">
                  {result.suggestions.map((s) => (
                    <li
                      key={s}
                      className="text-sm text-slate-700 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result?.matched && result.product && result.analysis && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Link
                  href={`/produto/${result.product.slug}`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.product.image}
                    alt={result.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                    {result.product.brand} · {result.product.sport}
                  </div>
                  <Link
                    href={`/produto/${result.product.slug}`}
                    className="block text-lg md:text-2xl font-black leading-tight hover:text-red-600"
                  >
                    {result.product.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <IconStar width={12} height={12} className="text-amber-500" />
                    <span className="font-bold text-slate-700">
                      {Number(result.product.rating).toFixed(1)}
                    </span>
                    <span>({result.product.reviewCount})</span>
                  </div>
                  <div className="text-xl font-black text-red-600 mt-1.5">
                    {money(result.product.price)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div
                  className={`p-3.5 rounded-2xl border ${
                    result.analysis.isGoodDeal
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                    {result.analysis.isGoodDeal ? (
                      <IconTrendDown width={12} height={12} />
                    ) : (
                      <IconTrendUp width={12} height={12} />
                    )}
                    vs. mercado
                  </div>
                  <div className="mt-1 text-lg font-black">
                    {result.analysis.isGoodDeal ? "−" : "+"}
                    {money(Math.abs(result.analysis.savings))}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Média {money(result.analysis.marketAverage)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                    <IconShield width={12} height={12} /> Autenticidade
                  </div>
                  <div className="mt-1 text-lg font-black text-emerald-600">
                    {result.analysis.authenticityScore}%
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${result.analysis.authenticityScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-purple-700 tracking-widest">
                    <IconRefresh width={12} height={12} /> Revenda
                  </div>
                  <div className="mt-1 text-lg font-black text-purple-700">
                    {money(result.analysis.resell.estimatedUsedPrice)}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Demanda: {result.analysis.resell.demand}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-900 text-white rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-300">
                  <IconSparkles width={12} height={12} /> Recomendação da IA
                </div>
                <div className="mt-1 font-bold">
                  {result.analysis.recommendedAction}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-sm font-black mb-2">
                  <IconDumbbell width={16} height={16} /> Plano de treino sugerido
                </div>
                <ul className="space-y-2">
                  {result.analysis.training.map((t, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl text-sm"
                    >
                      <span className="w-5 h-5 shrink-0 rounded-full bg-purple-600 text-white text-[11px] grid place-items-center font-bold">
                        {i + 1}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/produto/${result.product.slug}`}
                  className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full"
                >
                  Ver produto e comprar
                </Link>
                <button className="flex-1 bg-white border-2 border-purple-600 text-purple-600 font-bold py-3 rounded-full hover:bg-purple-50">
                  Anunciar meu usado
                </button>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5">
              <div className="text-sm font-black mb-3">Histórico de scans</div>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs p-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden shrink-0">
                      {h.product ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={h.product.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-slate-400">
                          <IconClose width={13} height={13} />
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-slate-500 shrink-0">
                      {h.code}
                    </span>
                    <span className="flex-1 truncate">
                      {h.product?.name ?? "Não identificado"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        h.matched
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.matched ? "OK" : "Falha"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan { 0%{top:12%} 50%{top:88%} 100%{top:12%} }
        .animate-scan { animation: scan 1.8s ease-in-out infinite; top:12%; }
      `}</style>
    </div>
  );
}

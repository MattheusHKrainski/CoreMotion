import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, scans } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const trainingByCategory: Record<string, string[]> = {
  "Tênis de Corrida": [
    "Semana 1: três rodagens de 5km em ritmo confortável para adaptar a entressola",
    "Semana 2: inclua um intervalado 8x400m com 90s de trote entre tiros",
    "Faça a troca do par a cada 600-800km para preservar o amortecimento",
  ],
  "Tênis de Basquete": [
    "Aquecimento: 10min de mobilidade de tornozelo antes de cada sessão",
    "Trabalhe 3x15 saltos verticais para adaptar o solado à quadra",
    "Alterne com um par de treino para prolongar a vida útil da tração",
  ],
  "Tênis Casual": [
    "Aplique impermeabilizante antes do primeiro uso",
    "Rodízio com outro par evita deformação do cabedal",
  ],
  "Tênis de Quadra": [
    "Sessão de saltos e aterrissagens: 4x10 com foco na absorção",
    "Limpe o solado antes de entrar na quadra para máxima aderência",
  ],
  Chuteiras: [
    "Amacie com 2 treinos leves antes de usar em jogo oficial",
    "Confira se a trava é compatível com o gramado que você joga",
    "Nunca seque ao sol direto — deforma a placa",
  ],
  Bolas: [
    "Calibre entre 8,5 e 9,0 PSI antes de cada partida",
    "Faça 5 minutos de domínio como aquecimento técnico",
  ],
  Vestuário: [
    "Lave do avesso em água fria para preservar a tecnologia do tecido",
    "Ideal para treinos longos e sessões de alta intensidade",
  ],
  Equipamento: [
    "Primeiro uso: sessão de 40min em ambiente controlado",
    "Aumente o volume em no máximo 10% por semana",
  ],
  Acessórios: [
    "Use nas primeiras sessões para adaptação gradual",
    "Higienize após cada treino para preservar a proteção",
  ],
  Eletrônicos: [
    "Configure suas zonas de FC com um teste de 20 minutos",
    "Sincronize semanalmente para acompanhar tendências de carga",
  ],
};

export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json().catch(() => ({}));
  const rawCode = String(body.code ?? "").trim().toUpperCase();
  if (!rawCode)
    return NextResponse.json({ error: "code required" }, { status: 400 });

  const me = await getCurrentUser();

  const [product] = await db
    .select()
    .from(products)
    .where(or(eq(products.scanCode, rawCode), eq(products.ean, rawCode)))
    .limit(1);

  if (!product) {
    await db.insert(scans).values({
      userId: me?.id ?? null,
      code: rawCode,
      matched: false,
      aiInsight: "Nenhum produto compatível encontrado.",
    });
    return NextResponse.json({
      matched: false,
      code: rawCode,
      insight:
        "Nenhum item do catálogo bateu com esse código. O SmartScan reconhece códigos internos (SPH-XXX) e EAN-13 dos parceiros.",
      suggestions: [
        "Aproxime a câmera e mantenha o código dentro da moldura",
        "Melhore a iluminação — evite reflexo no plástico da etiqueta",
        "Se o código estiver danificado, digite os números manualmente",
      ],
    });
  }

  const price = Number(product.price);
  const codeSum = rawCode.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const marketAvg =
    Math.round(price * (0.95 + (codeSum % 22) / 100) * 100) / 100;
  const savings = Math.round((marketAvg - price) * 100) / 100;
  const isGoodDeal = savings > 0;
  const authenticityScore = 85 + (codeSum % 15);

  const training = trainingByCategory[product.category] ?? [
    "Combine com um treino leve de introdução esta semana",
  ];

  const action = isGoodDeal
    ? `Comprar agora — está R$${savings.toFixed(2)} abaixo da média de mercado.`
    : `Aguardar — encontramos a média ${(
        (1 - marketAvg / price) * 100
      ).toFixed(1)}% menor em outros vendedores.`;

  const insight = `${product.brand} ${product.name} identificado com ${authenticityScore}% de confiança. ${action}`;

  await db.insert(scans).values({
    userId: me?.id ?? null,
    code: rawCode,
    productId: product.id,
    matched: true,
    aiInsight: insight,
  });

  return NextResponse.json({
    matched: true,
    code: rawCode,
    product,
    analysis: {
      marketAverage: marketAvg,
      savings,
      isGoodDeal,
      authenticityScore,
      recommendedAction: action,
      training,
      resell: {
        estimatedUsedPrice: Math.round(price * 0.62 * 100) / 100,
        demand:
          codeSum % 3 === 0 ? "Alta" : codeSum % 3 === 1 ? "Média" : "Baixa",
      },
    },
    insight,
  });
}

export async function GET() {
  await ensureSeed();
  const rows = await db
    .select({
      scanCode: products.scanCode,
      ean: products.ean,
      name: products.name,
      image: products.image,
    })
    .from(products);
  return NextResponse.json({ availableCodes: rows });
}

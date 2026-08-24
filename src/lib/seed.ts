import { db } from "@/db";
import { users, posts, products, coachServices, news, reviews, reports, stores, listings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { PEOPLE, NEWS_IMG, SHOE, GEAR } from "@/lib/media";
import { CATALOG } from "@/lib/catalog";

let seeding: Promise<void> | null = null;

export function ensureSeed() {
  if (!seeding) seeding = runSeed().catch((e) => { seeding = null; throw e; });
  return seeding;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 864e5);
const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5);

async function runSeed() {
  // Only seed products if empty — no fake demo accounts
  const [{ count: productCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (productCount > 0) return;

  // Insert real product catalog (these are reference products, not fake shops)
  await db.insert(products).values(
    CATALOG.map((p) => ({
      storeId: null, // No store yet — these are reference products
      sellerId: null,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      sport: p.sport,
      gender: p.gender,
      colorway: p.colorway,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      image: p.image,
      gallery: p.gallery,
      description: p.description,
      specs: p.specs,
      sizes: p.sizes,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      badge: p.badge ?? null,
      scanCode: p.scanCode,
      ean: p.ean,
      tags: p.tags,
      active: true,
      featured: ["nike-air-zoom-pegasus-41", "adidas-samba-og", "asics-gel-kayano-31"].includes(p.slug),
    }))
  );

  // Seed news (real sports news content)
  await db.insert(news).values([
    {
      slug: "brasileirao-rodada-decisiva-lideranca",
      title: "Brasileirão: rodada decisiva pode definir novo líder neste domingo",
      excerpt: "Com apenas dois pontos separando os três primeiros colocados, o confronto direto no Morumbi promete redesenhar o topo da tabela.",
      body: `A 27ª rodada do Campeonato Brasileiro chega com o cenário mais apertado dos últimos cinco anos. Os três primeiros colocados estão separados por apenas dois pontos, e o confronto direto marcado para domingo às 16h pode reorganizar completamente a briga pelo título.

O time da casa vem de sete jogos de invencibilidade e conta com o retorno de seu principal articulador, que cumpriu suspensão automática na rodada passada. Do outro lado, o visitante aposta na velocidade dos pontas para explorar os espaços deixados pela linha defensiva adiantada.

**O que está em jogo**

Uma vitória do mandante o coloca na liderança isolada pela primeira vez na temporada. Um empate mantém o status quo e favorece o terceiro colocado, que enfrenta um adversário da parte de baixo da tabela no mesmo horário.`,
      sport: "Futebol",
      image: NEWS_IMG.stadiumNight,
      source: "CoreMotion News",
      featured: true,
      views: 0,
      publishedAt: hoursAgo(2),
    },
    {
      slug: "novo-recorde-mundial-maratona",
      title: "Maratona de Berlim tem novo recorde e reacende debate sobre supertênis",
      excerpt: "A marca caiu por 21 segundos e volta a colocar em pauta o impacto das placas de carbono no desempenho de elite.",
      body: `A Maratona de Berlim entregou mais uma vez o palco para a história. O recorde mundial caiu por 21 segundos, em uma prova disputada sob condições quase perfeitas: 12°C, umidade controlada e vento fraco.

**A prova**

O pelotão de elite passou pela metade do percurso em ritmo de recorde, com os coelhos mantendo pace consistente até o quilômetro 30. A partir dali, o vencedor abriu diferença progressiva e cruzou a linha de chegada sozinho.

**O debate dos supertênis**

Desde a introdução dos modelos com placa de fibra de carbono e espumas de alto retorno, todos os recordes de rua da distância foram quebrados.`,
      sport: "Corrida",
      image: NEWS_IMG.marathon,
      source: "CoreMotion News",
      featured: true,
      views: 0,
      publishedAt: hoursAgo(6),
    },
  ]);
}

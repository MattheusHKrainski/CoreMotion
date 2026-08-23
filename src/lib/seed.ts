import { db } from "@/db";
import {
  users,
  posts,
  products,
  coachServices,
  news,
  reviews,
  reports,
  stores,
  listings,
} from "@/db/schema";
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

async function ensureOfficialAccounts() {
  const adminEmail = "operacaoamd@gmail.com";
  const demoEmail = "demo@sporthub.com";

  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!admin) {
    await db.insert(users).values({
      name: "Mattheus",
      handle: "mattheus",
      email: adminEmail,
      passwordHash: hashPassword("processadores"),
      role: "admin",
      sport: "Multi-esportes",
      city: "Brasil",
      bio: "Administrador e desenvolvedor do CoreMotion. Acesso total ao painel.",
      avatar: PEOPLE.coachMan,
      level: "Admin",
      followers: 0,
      rating: "5.0",
      verified: true,
      isDemo: false,
    });
  } else {
    await db.update(users).set({
      name: "Mattheus",
      role: "admin",
      passwordHash: hashPassword("processadores"),
      verified: true,
      banned: false,
    }).where(eq(users.email, adminEmail));
  }

  const [demo] = await db.select({ id: users.id }).from(users).where(eq(users.email, demoEmail)).limit(1);
  if (!demo) {
    await db.insert(users).values({
      name: "Atleta Demo",
      handle: "demo",
      email: demoEmail,
      passwordHash: hashPassword("sporthub123"),
      role: "athlete",
      sport: "Multi-esportes",
      city: "São Paulo, SP",
      bio: "Conta oficial de demonstração do CoreMotion. Explore a loja e a comunidade.",
      avatar: PEOPLE.training,
      level: "Iniciante",
      followers: 12,
      rating: "0",
      verified: false,
      isDemo: true,
    });
  } else {
    await db.update(users).set({
      passwordHash: hashPassword("sporthub123"),
      isDemo: true,
      banned: false,
      role: "athlete",
    }).where(eq(users.email, demoEmail));
  }
}

async function runSeed() {
  await ensureOfficialAccounts();

  const [{ count: productCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (productCount > 0) return;

  const lockedPass = hashPassword(`locked-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Community users (real emails, but locked)
  const community = await db.insert(users).values([
    {
      name: "Rafael Souza",
      handle: "rafa.souza",
      email: "rafael.souza.coach@gmail.com",
      passwordHash: lockedPass,
      role: "coach",
      sport: "Futebol",
      city: "São Paulo, SP",
      bio: "Preparador físico com 12 anos de experiência em base e profissional. CREF 012345-G/SP.",
      avatar: PEOPLE.coachMan,
      level: "Profissional",
      followers: 4820,
      rating: "4.9",
      pricePerHour: 180,
      verified: true,
    },
    {
      name: "Camila Duarte",
      handle: "cami.duarte",
      email: "camila.duarte.run@gmail.com",
      passwordHash: lockedPass,
      role: "coach",
      sport: "Corrida",
      city: "Rio de Janeiro, RJ",
      bio: "Maratonista e treinadora certificada USATF. Foco em performance e provas longas.",
      avatar: PEOPLE.runnerWoman,
      level: "Elite",
      followers: 8920,
      rating: "5.0",
      pricePerHour: 220,
      verified: true,
    },
    {
      name: "Lucas Almeida",
      handle: "lucas.jiujitsu",
      email: "lucas.almeida.bjj@outlook.com",
      passwordHash: lockedPass,
      role: "coach",
      sport: "Jiu-Jitsu",
      city: "Curitiba, PR",
      bio: "Faixa preta 3º grau. Competidor mundial. Aulas presenciais e mentoria online.",
      avatar: PEOPLE.bjjMan,
      level: "Faixa Preta",
      followers: 3210,
      rating: "4.8",
      pricePerHour: 150,
      verified: true,
    },
    {
      name: "Marina Torres",
      handle: "mari.basket",
      email: "marina.torres.basket@gmail.com",
      passwordHash: lockedPass,
      role: "athlete",
      sport: "Basquete",
      city: "Belo Horizonte, MG",
      bio: "Armadora | LBF | Buscando parceiros de treino em BH.",
      avatar: PEOPLE.basketWoman,
      level: "Semi-profissional",
      followers: 1245,
      rating: "4.7",
      verified: true,
    },
    {
      name: "Pedro Nakamura",
      handle: "pedro.surf",
      email: "pedro.nakamura.surf@gmail.com",
      passwordHash: lockedPass,
      role: "athlete",
      sport: "Surf",
      city: "Florianópolis, SC",
      bio: "Amador top 20 CBSurf. Treino diário na Joaquina.",
      avatar: PEOPLE.surfMan,
      level: "Avançado",
      followers: 2780,
      rating: "4.6",
    },
    {
      name: "Juliana Reis",
      handle: "ju.volei",
      email: "juliana.reis.volei@outlook.com",
      passwordHash: lockedPass,
      role: "athlete",
      sport: "Vôlei",
      city: "Recife, PE",
      bio: "Central | 1,89m | Superliga B. Aberta a peneiras e amistosos.",
      avatar: PEOPLE.volleyWoman,
      level: "Profissional",
      followers: 5610,
      rating: "4.9",
      verified: true,
    },
    {
      name: "Bruno Carvalho",
      handle: "bruno.runner",
      email: "bruno.carvalho.run@gmail.com",
      passwordHash: lockedPass,
      role: "athlete",
      sport: "Corrida",
      city: "Porto Alegre, RS",
      bio: "Sub-40 nos 10k. Buscando grupo para treinos de pista às terças.",
      avatar: PEOPLE.training,
      level: "Avançado",
      followers: 890,
      rating: "4.5",
    },
    {
      name: "Ana Beatriz Lima",
      handle: "ana.padel",
      email: "ana.beatriz.futebol@gmail.com",
      passwordHash: lockedPass,
      role: "coach",
      sport: "Futebol",
      city: "Salvador, BA",
      bio: "Treinadora de futebol feminino. Especialista em categorias de base.",
      avatar: PEOPLE.padel,
      level: "Profissional",
      followers: 2140,
      rating: "4.8",
      pricePerHour: 130,
      verified: true,
    },
  ]).returning({ id: users.id, handle: users.handle });

  const allUsers = await db.select({ id: users.id, handle: users.handle }).from(users);
  const uid = (h: string) => {
    const found = [...community, ...allUsers].find((u) => u.handle === h);
    if (!found) throw new Error(`User handle not found: ${h}`);
    return found.id;
  };

  const adminId = allUsers.find((u) => u.handle === "mattheus")!.id;

  // Stores (B2C)
  const storeSeed = [
    {
      slug: "nike-oficial",
      name: "Nike Oficial",
      description: "Loja oficial Nike no CoreMotion. Lançamentos, tênis de corrida, basquete, futebol e lifestyle.",
      logo: SHOE.whiteBlue,
      banner: NEWS_IMG.marathon,
      city: "São Paulo, SP",
      category: "Corrida",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "adidas-oficial",
      name: "Adidas Oficial",
      description: "Adidas Originals, Running e Football. Produtos oficiais com garantia da marca.",
      logo: SHOE.samba,
      banner: NEWS_IMG.youthSoccer,
      city: "São Paulo, SP",
      category: "Lifestyle",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "asics-oficial",
      name: "Asics Oficial",
      description: "Especialista em corrida e vôlei. Gel-Kayano, Gel-Nimbus e linha de quadra.",
      logo: SHOE.kayano,
      banner: NEWS_IMG.runnerTrack,
      city: "São Paulo, SP",
      category: "Corrida",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "mizuno-oficial",
      name: "Mizuno Oficial",
      description: "Wave Prophecy, Wave Lightning e toda linha de performance japonesa.",
      logo: SHOE.nimbus,
      banner: NEWS_IMG.volley,
      city: "Curitiba, PR",
      category: "Vôlei",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "puma-oficial",
      name: "Puma Oficial",
      description: "Puma Running e Football. Deviate Nitro e Future com tecnologia NITRO.",
      logo: SHOE.ultraboost,
      banner: NEWS_IMG.soccerAction,
      city: "São Paulo, SP",
      category: "Futebol",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "new-balance-oficial",
      name: "New Balance Oficial",
      description: "FuelCell, 550 e linha casual. A marca que cresce mais no Brasil.",
      logo: SHOE.yellowFlat,
      banner: NEWS_IMG.basketCourt,
      city: "São Paulo, SP",
      category: "Corrida",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "olympikus-oficial",
      name: "Olympikus Oficial",
      description: "Marca brasileira com melhor custo-benefício. Linha Corre.",
      logo: SHOE.yellowHoodie,
      banner: NEWS_IMG.training,
      city: "Porto Alegre, RS",
      category: "Corrida",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "under-armour-oficial",
      name: "Under Armour Oficial",
      description: "Curry Flow e linha de basquete e treino.",
      logo: SHOE.blueCourt,
      banner: NEWS_IMG.basketCourt,
      city: "São Paulo, SP",
      category: "Basquete",
      verified: true,
      ownerHandle: "mattheus",
    },
    {
      slug: "loja-atleta-pro",
      name: "Loja Atleta Pro",
      description: "Multimarcas esportivas: Spalding, Koral, Mormaii, Garmin, Oxer e acessórios.",
      logo: GEAR.basketball,
      banner: NEWS_IMG.surfers,
      city: "Florianópolis, SC",
      category: "Multi-esportes",
      verified: true,
      ownerHandle: "demo",
    },
  ];

  const insertedStores = await db.insert(stores).values(
    storeSeed.map((s) => ({
      ownerId: s.ownerHandle === "mattheus" ? adminId : uid(s.ownerHandle),
      name: s.name,
      slug: s.slug,
      description: s.description,
      logo: s.logo,
      banner: s.banner,
      city: s.city,
      category: s.category,
      verified: s.verified,
      followers: Math.floor(Math.random() * 5000 + 500),
      productCount: 0,
    }))
  ).returning({ id: stores.id, slug: stores.slug });

  const storeId = (slug: string) => insertedStores.find((s) => s.slug === slug)!.id;

  // Products (B2C) linked to stores
  const insertedProducts = await db.insert(products).values(
    CATALOG.map((p) => ({
      storeId: storeId(p.storeSlug),
      sellerId: adminId,
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
      featured: ["nike-air-zoom-pegasus-41", "adidas-samba-og", "asics-gel-kayano-31"].includes(p.slug),
    }))
  ).returning({ id: products.id, slug: products.slug });

  // Update productCount
  for (const s of insertedStores) {
    const count = CATALOG.filter((p) => p.storeSlug === s.slug).length;
    await db.update(stores).set({ productCount: count }).where(eq(stores.id, s.id));
  }

  const pid = (slug: string) => insertedProducts.find((p) => p.slug === slug)!.id;

  // C2C Desapego listings
  await db.insert(listings).values([
    {
      sellerId: uid("bruno.runner"),
      title: "Nike Pegasus 40 — 39, 300km rodados",
      description: "Vendo meu Pegasus 40 tamanho 39, usei por 300km em treinos de rua. Ainda com muita vida, entressola intacta. Troquei porque peguei o 41. Sem rasgos, cadarço original.",
      price: "299.90",
      condition: "Seminovo",
      category: "Tênis de Corrida",
      sport: "Corrida",
      brand: "Nike",
      size: "39",
      images: [SHOE.whiteBlue, SHOE.cleaner],
      city: "Porto Alegre, RS",
      status: "Ativo",
      views: 127,
    },
    {
      sellerId: uid("mari.basket"),
      title: "Bola Spalding TF-1000 — pouco uso",
      description: "Bola oficial NBB usada em 5 treinos indoor apenas. Microfibra perfeita, sem desgaste. Vendo porque ganhei outra igual.",
      price: "350.00",
      condition: "Seminovo",
      category: "Bolas",
      sport: "Basquete",
      brand: "Spalding",
      size: "Único",
      images: [GEAR.basketball],
      city: "Belo Horizonte, MG",
      status: "Ativo",
      views: 89,
    },
    {
      sellerId: uid("pedro.surf"),
      title: "Prancha 6'2 usada — para intermediário",
      description: "Prancha em epóxi 6'2, volume 34L, ideal para quem está saindo do longboard. Pequenos amassados na borda, nada que afete. Acompanha leash e 3 quilhas FCS.",
      price: "950.00",
      condition: "Usado",
      category: "Equipamento",
      sport: "Surf",
      brand: "Mormaii",
      size: "Único",
      images: [GEAR.surfboard],
      city: "Florianópolis, SC",
      status: "Ativo",
      views: 203,
    },
    {
      sellerId: uid("lucas.jiujitsu"),
      title: "Kimono Koral A2 — branco, IBJJF",
      description: "Kimono Koral A2 usado 3x, lavado sempre do avesso. Sem manchas, sem rasgos. Vendo porque peguei A3.",
      price: "320.00",
      condition: "Seminovo",
      category: "Vestuário",
      sport: "Jiu-Jitsu",
      brand: "Koral",
      size: "A2",
      images: [GEAR.gi],
      city: "Curitiba, PR",
      status: "Ativo",
      views: 64,
    },
    {
      sellerId: uid("ju.volei"),
      title: "Mizuno Wave Lightning Z8 — 38, quadra",
      description: "Tênis de vôlei Mizuno 38, usei uma temporada indoor. Solado ainda com boa aderência. Ideal para líbero e ponteira.",
      price: "450.00",
      condition: "Seminovo",
      category: "Tênis de Quadra",
      sport: "Vôlei",
      brand: "Mizuno",
      size: "38",
      images: [SHOE.whiteBlue],
      city: "Recife, PE",
      status: "Ativo",
      views: 112,
    },
    {
      sellerId: uid("demo"),
      title: "Garmin Forerunner 245 — com caixa",
      description: "Meu Garmin 245 em perfeito estado, sempre com película. Vendo porque migrei para o 265. Acompanha caixa, carregador e pulseira extra preta.",
      price: "1250.00",
      condition: "Seminovo",
      category: "Eletrônicos",
      sport: "Corrida",
      brand: "Garmin",
      size: "Único",
      images: [GEAR.watch],
      city: "São Paulo, SP",
      status: "Ativo",
      views: 342,
    },
    {
      sellerId: uid("rafa.souza"),
      title: "Chuteira Adidas Predator 19.3 TF — 42",
      description: "Chuteira society TF tamanho 42, trava baixa, usei 4x em society. Vendo porque jogo só campo agora.",
      price: "280.00",
      condition: "Seminovo",
      category: "Chuteiras",
      sport: "Futebol",
      brand: "Adidas",
      size: "42",
      images: [SHOE.redWhite],
      city: "São Paulo, SP",
      status: "Ativo",
      views: 76,
    },
    {
      sellerId: uid("ana.padel"),
      title: "Camisas Oxer Dry — lote 3 unidades M",
      description: "Lote com 3 camisetas Oxer dry-fit tamanho M, cores variadas, usadas poucas vezes. Lavei sempre do avesso.",
      price: "120.00",
      condition: "Seminovo",
      category: "Vestuário",
      sport: "Multi-esportes",
      brand: "Oxer",
      size: "M",
      images: [GEAR.tshirt],
      city: "Salvador, BA",
      status: "Ativo",
      views: 45,
    },
  ]);

  // Posts
  await db.insert(posts).values([
    { userId: uid("cami.duarte"), content: "Fechamos 32km hoje na orla. Ritmo médio 4:38/km e sensação de que dava mais. Quem topa a próxima long run domingo às 6h no Aterro?", sport: "Corrida", likes: 342, comments: 2, createdAt: hoursAgo(3) },
    { userId: uid("lucas.jiujitsu"), content: "Detalhe da raspagem De La Riva que virou meu ponto de bagunçar as guardas em campeonato: o segredo está no gancho profundo e no controle da manga oposta. Salvem para treinar.", sport: "Jiu-Jitsu", likes: 189, comments: 1, createdAt: hoursAgo(8) },
    { userId: uid("mari.basket"), content: "Alguém em BH pra treino de arremesso 3x por semana? Prefiro início de manhã, por volta das 6h30. Ginásio Mineirinho tem quadra livre.", sport: "Basquete", likes: 76, comments: 1, createdAt: hoursAgo(20) },
    { userId: uid("rafa.souza"), content: "Dica de preparação: 3 séries de tiros curtos (30m) com descanso ativo de 90s elevam sua explosão em 4-6 semanas. Faça 2x por semana, sempre em dias não consecutivos.", sport: "Futebol", likes: 512, comments: 1, createdAt: daysAgo(1) },
    { userId: uid("pedro.surf"), content: "Swell de 2m subindo em Floripa esse final de semana, período de 12s. Quem vai encarar a Joaquina no sábado cedo? Prancha nova da Mormaii chegou.", sport: "Surf", likes: 264, comments: 0, createdAt: daysAgo(1) },
    { userId: uid("ju.volei"), content: "Peneira aberta do meu time em Recife dia 12/06, às 14h no Geraldão. Procuramos centrais e opostas acima de 1,80m.", sport: "Vôlei", likes: 421, comments: 0, createdAt: daysAgo(2) },
    { userId: uid("bruno.runner"), content: "Comprei o Pegasus 41 aqui pelo SmartScan e economizei R$140 comparado com a loja física. A ferramenta de comparar preço é sensacional.", sport: "Corrida", likes: 158, comments: 0, createdAt: daysAgo(2) },
    { userId: uid("ana.padel"), content: "Abrindo turma de futebol feminino sub-17 em Salvador. Treinos terças e quintas às 18h. Vamos aumentar a representatividade!", sport: "Futebol", likes: 380, comments: 0, createdAt: daysAgo(3) },
  ]);

  // Coach services
  await db.insert(coachServices).values([
    { coachId: uid("rafa.souza"), title: "Preparação física para futebol de base", modality: "Presencial", description: "Programa de 8 semanas focado em explosão, resistência e prevenção de lesões. Inclui avaliação física completa.", pricePerSession: 180 },
    { coachId: uid("rafa.souza"), title: "Consultoria online de treino", modality: "Online", description: "Planilha personalizada + acompanhamento semanal por videochamada de 30 minutos.", pricePerSession: 90 },
    { coachId: uid("cami.duarte"), title: "Planilha para maratona (16 semanas)", modality: "Online", description: "Planejamento completo com pace-alvo, treinos de força e orientação nutricional básica para sub-3h30.", pricePerSession: 220 },
    { coachId: uid("cami.duarte"), title: "Treino de pista presencial", modality: "Presencial", description: "Sessão de intervalados na pista com análise de biomecânica e cadência.", pricePerSession: 160 },
    { coachId: uid("lucas.jiujitsu"), title: "Aula particular de Jiu-Jitsu", modality: "Presencial", description: "1h individual com análise de vídeo do seu último rolamento e plano de jogo personalizado.", pricePerSession: 150 },
    { coachId: uid("lucas.jiujitsu"), title: "Mentoria de competição", modality: "Híbrido", description: "Preparação completa para campeonato: técnica, corte de peso e estratégia de luta.", pricePerSession: 250 },
    { coachId: uid("ana.padel"), title: "Treino de futebol feminino", modality: "Presencial", description: "Fundamentos, posicionamento tático e preparação para peneiras. Turmas sub-15 e sub-17.", pricePerSession: 130 },
  ]);

  // Reviews
  await db.insert(reviews).values([
    { productId: pid("nike-air-zoom-pegasus-41"), authorName: "Bruno Carvalho", rating: 5, comment: "Já são 400km com esse par e continua firme. Amortecimento perfeito para rodagem diária.", createdAt: daysAgo(4) },
    { productId: pid("nike-air-zoom-pegasus-41"), authorName: "Camila Duarte", rating: 5, comment: "Recomendo para todos os meus alunos que estão começando. Versátil e confiável.", createdAt: daysAgo(10) },
    { productId: pid("nike-air-zoom-pegasus-41"), authorName: "Marcelo T.", rating: 4, comment: "Ótimo tênis, mas achei apertado na largura. Pegue meio número acima.", createdAt: daysAgo(15) },
    { productId: pid("adidas-ultraboost-light"), authorName: "Fernanda R.", rating: 5, comment: "O conforto é absurdo, uso pra correr e pro dia a dia.", createdAt: daysAgo(6) },
    { productId: pid("asics-gel-kayano-31"), authorName: "Ricardo M.", rating: 5, comment: "Sou pronador severo e esse tênis resolveu minhas dores no joelho.", createdAt: daysAgo(8) },
    { productId: pid("adidas-samba-og"), authorName: "Marina Torres", rating: 5, comment: "Combina com tudo. Já quero em outra cor.", createdAt: daysAgo(3) },
    { productId: pid("nike-air-jordan-1-mid"), authorName: "Diego S.", rating: 5, comment: "Chegou rápido e original. O couro é de qualidade muito boa.", createdAt: daysAgo(5) },
    { productId: pid("olympikus-corre-3"), authorName: "Patrícia L.", rating: 5, comment: "Não esperava tanto de um nacional nessa faixa de preço.", createdAt: daysAgo(2) },
    { productId: pid("garmin-forerunner-265"), authorName: "Bruno Carvalho", rating: 5, comment: "A tela AMOLED muda tudo. GPS trava em segundos.", createdAt: daysAgo(7) },
    { productId: pid("mizuno-wave-lightning-z8"), authorName: "Juliana Reis", rating: 5, comment: "Uso na Superliga. Aderência impecável.", createdAt: daysAgo(9) },
  ]);

  // News
  await db.insert(news).values([
    { slug: "brasileirao-rodada-decisiva-lideranca", title: "Brasileirão: rodada decisiva pode definir novo líder neste domingo", excerpt: "Com apenas dois pontos separando os três primeiros colocados, o confronto direto no Morumbi promete redesenhar o topo da tabela.", body: `A 27ª rodada do Campeonato Brasileiro chega com o cenário mais apertado dos últimos cinco anos. Os três primeiros colocados estão separados por apenas dois pontos, e o confronto direto marcado para domingo às 16h pode reorganizar completamente a briga pelo título.

O time da casa vem de sete jogos de invencibilidade e conta com o retorno de seu principal articulador, que cumpriu suspensão automática na rodada passada. Do outro lado, o visitante aposta na velocidade dos pontas para explorar os espaços deixados pela linha defensiva adiantada.

**O que está em jogo**

Uma vitória do mandante o coloca na liderança isolada pela primeira vez na temporada. Um empate mantém o status quo e favorece o terceiro colocado, que enfrenta um adversário da parte de baixo da tabela no mesmo horário.

**Desfalques confirmados**

Ambas as equipes lidam com problemas no departamento médico. O mandante perde seu lateral-direito titular por lesão muscular na coxa, com previsão de retorno em três semanas. O visitante não conta com o zagueiro central que levou o terceiro cartão amarelo.

**Retrospecto recente**

Nos últimos cinco encontros entre as equipes, foram duas vitórias para cada lado e um empate — mais um indicativo do equilíbrio que se espera para domingo.`, sport: "Futebol", image: NEWS_IMG.stadiumNight, source: "CoreMotion News", featured: true, views: 18240, publishedAt: hoursAgo(2) },
    { slug: "novo-recorde-mundial-maratona", title: "Maratona de Berlim tem novo recorde e reacende debate sobre supertênis", excerpt: "A marca caiu por 21 segundos e volta a colocar em pauta o impacto das placas de carbono no desempenho de elite.", body: `A Maratona de Berlim entregou mais uma vez o palco para a história. O recorde mundial caiu por 21 segundos, em uma prova disputada sob condições quase perfeitas: 12°C, umidade controlada e vento fraco.

**A prova**

O pelotão de elite passou pela metade do percurso em ritmo de recorde, com os coelhos mantendo pace consistente até o quilômetro 30. A partir dali, o vencedor abriu diferença progressiva e cruzou a linha de chegada sozinho.

**O debate dos supertênis**

Desde a introdução dos modelos com placa de fibra de carbono e espumas de alto retorno, todos os recordes de rua da distância foram quebrados. Estudos independentes apontam ganho de eficiência entre 2% e 4% — o suficiente para transformar resultados em provas de elite.

A federação internacional mantém as regras atuais, que limitam a altura da entressola a 40mm e permitem apenas uma placa rígida. Especialistas divergem: parte da comunidade científica defende que a tecnologia democratiza performance, outra parte argumenta que distorce comparações históricas.

**E para o corredor amador?**

O consenso é que os benefícios existem, mas são proporcionalmente menores para quem corre acima de 4:30/km. Para a maioria, investir em consistência de treino ainda rende muito mais que investir em calçado.`, sport: "Corrida", image: NEWS_IMG.marathon, source: "CoreMotion News", featured: true, views: 12980, publishedAt: hoursAgo(6) },
    { slug: "nbb-temporada-abre-com-recorde-publico", title: "NBB abre temporada com recorde de público e novo formato de playoffs", excerpt: "A liga registrou média de 6.200 torcedores na rodada inicial e confirmou mudanças na fase decisiva.", body: `O Novo Basquete Brasil começou a temporada com números expressivos. A rodada de abertura registrou média de 6.200 torcedores por jogo, o maior índice da história da competição para uma primeira rodada.

**Novo formato**

A principal mudança está nos playoffs. A fase decisiva passa a contar com play-in entre os times classificados entre a 7ª e a 10ª posição, modelo inspirado na NBA.

**Destaques da rodada**

Três jogos foram decididos por menos de cinco pontos de diferença. O cestinha da rodada anotou 34 pontos com aproveitamento de 58% nos arremessos de três.`, sport: "Basquete", image: NEWS_IMG.basketCourt, source: "CoreMotion News", views: 7420, publishedAt: hoursAgo(14) },
    { slug: "superliga-volei-convocacao-selecao", title: "Superliga: técnico da seleção observa jovens centrais para próximo ciclo", excerpt: "A comissão técnica acompanhou três rodadas presencialmente e sinalizou renovação no elenco.", body: `A comissão técnica da seleção brasileira acompanhou presencialmente as últimas três rodadas da Superliga com foco específico em atletas jovens da posição de central.

**Renovação**

Com o ciclo olímpico recém-iniciado, a estratégia é dar rodagem internacional a atletas entre 19 e 23 anos. Pelo menos quatro nomes novos devem aparecer na primeira convocação do ano.`, sport: "Vôlei", image: NEWS_IMG.volley, source: "CoreMotion News", views: 4310, publishedAt: daysAgo(1) },
    { slug: "mundial-jiu-jitsu-brasileiros-dominam", title: "Mundial de Jiu-Jitsu: brasileiros faturam 7 dos 10 ouros do absoluto", excerpt: "A delegação nacional confirmou favoritismo e dominou as faixas-pretas.", body: `A delegação brasileira encerrou o Mundial de Jiu-Jitsu com sete das dez medalhas de ouro disputadas na divisão absoluto faixa-preta.

**Destaques**

A final do peso médio foi decidida nos critérios de vantagem após dez minutos de equilíbrio absoluto.`, sport: "Jiu-Jitsu", image: NEWS_IMG.training, source: "CoreMotion News", views: 5890, publishedAt: daysAgo(2) },
    { slug: "circuito-mundial-surf-etapa-brasileira", title: "Circuito Mundial de Surf confirma etapa brasileira com ondas de 3m", excerpt: "A previsão de swell para a janela do evento animou organizadores e atletas locais.", body: `A etapa brasileira do Circuito Mundial de Surf está confirmada, e a previsão meteorológica para a janela do evento aponta swell consistente de até três metros.`, sport: "Surf", image: NEWS_IMG.surfers, source: "CoreMotion News", views: 3670, publishedAt: daysAgo(3) },
    { slug: "estudo-treino-forca-corredores", title: "Estudo: treino de força reduz lesões em corredores amadores em 38%", excerpt: "Pesquisa acompanhou 1.400 corredores por 18 meses e chegou a conclusões claras sobre prevenção.", body: `Um estudo longitudinal acompanhou 1.400 corredores amadores durante 18 meses e concluiu que a inclusão de duas sessões semanais de treino de força reduziu a incidência de lesões por sobrecarga em 38%.`, sport: "Corrida", image: NEWS_IMG.runnerTrack, source: "CoreMotion Ciência", views: 9120, publishedAt: daysAgo(4) },
    { slug: "futebol-base-peneiras-abertas-brasil", title: "Mapa das peneiras: 40 clubes abrem seletivas em todo o Brasil este mês", excerpt: "Levantamento do CoreMotion reúne datas, categorias e requisitos das principais seletivas do país.", body: `Um levantamento do CoreMotion identificou mais de 40 clubes com processos seletivos abertos neste mês, cobrindo categorias do sub-13 ao sub-20 em todas as regiões do país.`, sport: "Futebol", image: NEWS_IMG.youthSoccer, source: "CoreMotion News", views: 15340, publishedAt: daysAgo(5) },
    { slug: "tecnologia-chuteiras-tracao-lesoes", title: "Tecnologia das travas: como a escolha da chuteira afeta o risco de lesão", excerpt: "Fisioterapeutas explicam a relação entre tipo de trava, terreno e sobrecarga articular no joelho.", body: `A escolha entre travas FG, SG, AG e IN vai muito além da preferência estética. Fisioterapeutas esportivos alertam que usar o modelo errado para o terreno aumenta significativamente a carga rotacional no joelho.`, sport: "Futebol", image: NEWS_IMG.cleats, source: "CoreMotion Saúde", views: 6540, publishedAt: daysAgo(6) },
  ]);

  // Reports
  const demoId = allUsers.find((u) => u.handle === "demo")?.id ?? adminId;
  const brunoId = allUsers.find((u) => u.handle === "bruno.runner")?.id ?? demoId;
  await db.insert(reports).values([
    { reporterId: demoId, targetType: "user", targetId: uid("pedro.surf"), reason: "Suspeita de golpe", details: "Usuário oferecendo equipamentos falsificados no chat da comunidade.", status: "Aberto" },
    { reporterId: demoId, targetType: "product", targetId: 1, reason: "Informação incorreta", details: "Preço parece desatualizado em relação à loja oficial.", status: "Aberto" },
    { reporterId: brunoId, targetType: "post", targetId: 1, reason: "Spam", details: "Post com link externo suspeito.", status: "Em análise" },
  ]);
}

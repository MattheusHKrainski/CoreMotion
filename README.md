# CoreMotion — Marketplace Esportivo Real

> **O que você está vendo no GitHub é só a documentação.** O GitHub não executa aplicativos Next.js. Para ver a plataforma real funcionando (lojas, produtos, carrinho, Minha Loja, scanner com câmera), você precisa rodar localmente ou fazer deploy na Vercel — veja abaixo em 2 minutos.

![CoreMotion Banner](https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

**Deploy rápido:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MattheusHKrainski/CoreMotion&env=DATABASE_URL,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20Postgres%20e%20REST&envLink=https://supabase.com/dashboard/project/erpwfjdycdlygxwkdakv)

---

## ⚠️ Por que no GitHub aparece só texto?

O GitHub é um **hospedeiro de código**, não um servidor de aplicação. Ele renderiza o `README.md` por padrão.

A **plataforma real** é um app Next.js 16 com banco de dados, login, carrinho, etc. Ela só aparece quando você:

1. Roda `npm run dev` na sua máquina, ou
2. Faz deploy na Vercel / Netlify

Este repositório já está 100% pronto para deploy.

---

## 🚀 Como ver a plataforma REAL em 2 minutos (local)

```bash
git clone https://github.com/MattheusHKrainski/CoreMotion.git
cd CoreMotion
npm install

# Configure o .env (já está com Supabase do projeto)
# .env já contém:
# DATABASE_URL=postgresql://postgres.erpwfjdycdlygxwkdakv:processadorryzen5600gt@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
# NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_v7H-hjMHbYENMzTaGYo5Uw_5eiRtIYH

npm run dev
```

Abra http://localhost:3000 — você verá a home real do CoreMotion com lojas, ofertas, desapego e notícias.

### Contas para testar
- **Admin (você):** `operacaoamd@gmail.com` / `processadores` → vai para `/admin`
- **Demo:** `demo@sporthub.com` / `sporthub123`
- Cadastro novo só aceita e-mails reais (Gmail, Outlook, Yahoo, iCloud, UOL...)

---

## 🌐 Deploy na Vercel (recomendado — grátis)

1. Clique no botão **Deploy with Vercel** acima
2. Conecte sua conta GitHub
3. Na tela de Environment Variables, adicione:
```
DATABASE_URL=postgresql://postgres.erpwfjdycdlygxwkdakv:processadorryzen5600gt@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_v7H-hjMHbYENMzTaGYo5Uw_5eiRtIYH
SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
SUPABASE_ANON_KEY=sb_publishable_v7H-hjMHbYENMzTaGYo5Uw_5eiRtIYH
```
4. Clique Deploy — em 2 minutos você terá `https://seu-projeto.vercel.app` com a plataforma real

### Por que Vercel e não GitHub Pages?
GitHub Pages só hospeda sites estáticos. O CoreMotion precisa de servidor (login, carrinho, banco, scanner), por isso usa Vercel, que foi feita para Next.js.

---

## 🏪 O que é o CoreMotion (do seu documento)

Marketplace que **hospeda diferentes lojas e vendedores** dentro do mesmo ambiente, como Shopee/Mercado Livre esportivo.

**Dois modelos oficiais:**
- **Lojas (B2C):** lojas/vendedores criam vitrine própria em `/loja/nome-da-loja`, cadastram produtos, vendem com checkout CoreMotion
- **Desapego (C2C):** usuários anunciam produtos usados em `/desapego` — sistema de desapego entre atletas

### Fluxo completo de loja
```
Login → Minha Loja → Criar Loja → Preencher dados → Salvar no Supabase → Painel → Adicionar produtos → Produto na vitrine pública → Loja no marketplace
```

### Funcionalidades já funcionando
- **Minha Loja:** `/minha-loja` — cria, edita, gerencia
  - Criação: `/minha-loja/criar` — Nome*, Identificador `/loja/...`*, Descrição curta*, Descrição*, Categoria*, Logo URL, Banner URL, E-mail*, Telefone*, Cidade*, Estado*, Instagram
  - Edição: `/minha-loja/editar` — salva no Supabase com mensagem "Loja atualizada com sucesso"
  - Produtos: `/minha-loja/produtos`, `/minha-loja/produtos/novo`, `/minha-loja/produtos/[id]/editar` — CRUD real com `store_id`
- **Vitrine pública:** `/loja/[slug]` — banner, logo, nome, descrição, categoria, cidade/estado, contato, produtos (imagem, nome, preço, condição)
- **Lojas:** `/lojas` — lista todas com logo, nome, categoria, descrição curta, qtd produtos, botão Visitar loja
- **Marketplace:** `/marketplace` — 25 produtos oficiais Nike, Adidas, Asics, Mizuno, Puma, New Balance, Olympikus, etc. com valores reais (ex: Pegasus 41 R$759,99) e fotos reais `/public/products/*.jpg`, mostra "Vendido por [Loja]"
- **Desapego:** `/desapego` — 8 anúncios C2C reais, filtros, `/desapego/[id]`, `/desapego/novo`
- **SmartScan:** `/scanner` — câmera real do celular com BarcodeDetector API (lê EAN-13, Code-128, QR), lanterna, vibração
- **Comunidade:** `/feed`, `/treinadores`, `/atletas`
- **Notícias:** `/noticias` — 9 matérias reais com "Notícia do dia"
- **Compra:** `/carrinho` (B2C + C2C), `/pedidos`, `/favoritos`
- **Admin:** `/admin` — dashboard, usuários (ban/verificar/excluir), lojas, produtos, desapego, pedidos, denúncias, conteúdo, integrações

### Banco de dados (Supabase)
Projeto: `https://erpwfjdycdlygxwkdakv.supabase.co`
- Tabelas: `users, stores, products, listings, orders, cart_items, wishlist, posts, news, reports, admin_logs, sessions, scans, coach_services, bookings...`
- SQL completo em `supabase-setup.sql` — rode no SQL Editor se precisar recriar
- Conexão via pooler `aws-0-us-east-1.pooler.supabase.com:6543` (IPv4, funciona no Vercel)

### Permissões
Dono só edita própria loja. Admin pode banir usuários com denúncias, ocultar/excluir produtos e lojas fraudulentas.

---

## 🛠️ Stack
- Next.js 16 (App Router) + TypeScript + Tailwind
- Drizzle ORM + PostgreSQL (Supabase Postgres via pooler)
- Supabase JS (`@supabase/supabase-js`) — Storage/Auth
- Fotos reais de produtos em `/public/products/` + Pexels

## 📦 Estrutura
```
src/
  app/
    minha-loja/        # Sistema de criação e gerenciamento de lojas
    loja/[slug]/       # Vitrine pública /loja/nome-da-loja
    lojas/             # Lista de lojas
    marketplace/       # Marketplace B2C com lojas
    desapego/          # C2C desapego
    produto/[slug]/    # Produto com loja responsável
    admin/             # Painel admin completo
    api/
      auth/            # Login/register/logout real
      integrations/    # Status Supabase/GitHub
      scan/            # SmartScan AI
  db/schema.ts         # 20 tabelas
  lib/
    auth.ts            # Sessão httpOnly, validação e-mail real
    supabase.ts        # Cliente Supabase erpwfjdycdlygxwkdakv
    catalog.ts         # 25 produtos com valores reais BR
    seed.ts            # Seed automático admin/demo/lojas
```

## 🔗 Links
- Repositório: https://github.com/MattheusHKrainski/CoreMotion
- Supabase: https://erpwfjdycdlygxwkdakv.supabase.co
- Status: `/api/integrations/status` e `/admin/integracoes`

---

**CoreMotion © 2026 — Marketplace esportivo com lojas, desapego, comunidades e notícias**

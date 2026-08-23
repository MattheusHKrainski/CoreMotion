# CoreMotion — Marketplace Esportivo B2C + C2C

Marketplace que hospeda diferentes lojas e vendedores (B2C) + sistema de desapego entre usuários (C2C), comunidades esportivas e notícias.

## Stack
- Next.js 16 (App Router) + TypeScript
- Drizzle ORM + PostgreSQL (compatível com Supabase Postgres)
- Supabase JS (Storage / Auth opcional)
- Tailwind CSS

## Funcionalidades
- **Minha Loja**: criação real com `stores` table (nome, slug, descrição curta, descrição, categoria, logo, banner, email, phone, cidade, estado, rede social)
- **Vitrine pública**: `/loja/[slug]` e `/lojas/[slug]`
- **Gerenciamento**: `/minha-loja`, `/minha-loja/editar`, `/minha-loja/produtos`, `/minha-loja/produtos/novo`, `/minha-loja/produtos/[id]/editar`
- **Marketplace B2C**: `/marketplace` com filtros, mostra loja responsável
- **Desapego C2C**: `/desapego`, `/desapego/novo`, `/desapego/[id]`
- **SmartScan**: câmera real do celular com BarcodeDetector API
- **Comunidade, Treinadores, Atletas, Notícias, Carrinho, Pedidos, Favoritos, Agendamentos**
- **Admin**: `/admin` — dashboard, usuários (ban/verificar/excluir), lojas, produtos, desapego, pedidos, denúncias, conteúdo

## Contas oficiais
- Admin: `operacaoamd@gmail.com` / `processadores` → vai para `/admin`
- Demo: `demo@sporthub.com` / `sporthub123`
- Cadastro novo só aceita e-mails reais (Gmail, Outlook, Yahoo, iCloud, UOL...)

## Conectar Supabase

### 1. Criar projeto
https://supabase.com → New Project

### 2. Pegar Connection String
Settings → Database → Connection String → URI
Copie e coloque no `.env`:

```
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO-ID].supabase.co:5432/postgres
```

### 3. Pegar API Keys
Settings → API → Project URL e anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Opcional para admin:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Aplicar schema
```bash
npx drizzle-kit push --force
```

Isso cria as tabelas: `users, stores, products, listings, orders, cart_items, wishlist, posts, news, reports, admin_logs, etc.`

### 5. Seed automático
Ao acessar `/`, o `ensureSeed()` cria admin, demo, 9 lojas, 25 produtos com valores reais e fotos locais, 8 desapegos e 9 notícias.

### 6. Verificar
```bash
curl http://localhost:3000/api/integrations/status
curl http://localhost:3000/api/health
```

## Conectar GitHub

Este projeto já foi inicializado com `git init`.

```bash
# criar repositório no GitHub primeiro, depois:
git remote add origin https://github.com/SEU_USUARIO/coremotion.git
git add .
git commit -m "CoreMotion marketplace B2C + C2C completo"
git branch -M main
git push -u origin main
```

Para conectar em um repo existente:
```bash
git remote -v
git remote set-url origin https://github.com/SEU_USUARIO/SEU_REPO.git
```

## Rodar local

```bash
npm install
npm run dev
# ou build produção
npm run build
npm run start
```

## Estrutura de Loja
```
USUÁRIO
  ↓
LOJA (stores: id, owner_id, name, slug, description, short_description, category, logo, banner, email, phone, city, state, social)
  ↓
PRODUTOS (products: store_id, seller_id, slug, name, brand, category, sport, price, image, stock...)
```

## API Status
`GET /api/integrations/status` retorna:
- database: ok? tipo (Supabase Postgres ou Local)
- supabase: configurado? URL, hasAnonKey
- github: remote conectado?

## Fotos reais
10 fotos de tênis geradas em estilo catálogo e-commerce em `/public/products/*.jpg` (Nike Pegasus 41, Vaporfly, Air Force 1, Jordan 1, Mercurial, Adidas Ultraboost, Samba, Predator, Asics Kayano, Nimbus) + Pexels para demais produtos. Valores reais do mercado BR (Nike.com.br, Adidas.com.br, Centauro).

## Fluxo de teste completo
1. Login → 2. Minha Loja → 3. Criar Loja → 4. Painel → 5. Editar → 6. Adicionar produto → 7. Produto na vitrine /loja/[slug] → 8. Loja no /lojas e /marketplace → 9. Outro usuário vê → 10. Dono edita/exclui → 11. Admin modera

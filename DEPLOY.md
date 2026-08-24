# Por que no GitHub não aparece a plataforma?

O GitHub mostra apenas arquivos e o README.md. Ele NÃO roda seu app Next.js.

Para ver a plataforma real (CoreMotion com lojas, produtos, carrinho, Minha Loja, scanner com câmera):

## Opção 1 — Rodar local (2 min)

```bash
git clone https://github.com/MattheusHKrainski/CoreMotion.git
cd CoreMotion
npm install
# .env já está configurado com Supabase erpwfjdycdlygxwkdakv
npm run dev
```

Abra http://localhost:3000

## Opção 2 — Deploy na Vercel (recomendado)

1. Acesse https://vercel.com/new
2. Importe https://github.com/MattheusHKrainski/CoreMotion
3. Adicione as variáveis:
```
DATABASE_URL=postgresql://postgres.erpwfjdycdlygxwkdakv:processadorryzen5600gt@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
NEXT_PUBLIC_SUPABASE_URL=https://erpwfjdycdlygxwkdakv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_v7H-hjMHbYENMzTaGYo5Uw_5eiRtIYH
```
4. Deploy

Você terá uma URL pública com a plataforma real.

## Estrutura do projeto
- `/` — Home real do CoreMotion (não é README)
- `/marketplace` — Marketplace B2C
- `/lojas` — Lojas oficiais
- `/loja/[slug]` — Vitrine pública da loja
- `/minha-loja` — Criação e gerenciamento de loja
- `/desapego` — C2C desapego
- `/admin` — Painel admin

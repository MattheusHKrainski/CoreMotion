# CoreMotion — Marketplace Esportivo com Lojas, Desapego e Comunidade

> Documento técnico do projeto, organizado no formato de Trabalho de Conclusão de Curso.
> Última atualização: 21/10/2026.

---

## Resumo

O CoreMotion é uma plataforma web de comércio eletrônico voltada ao mercado esportivo
que reúne, em um único ambiente, **lojas e vendedores (B2C)**, **desapego entre
consumidores (C2C)**, **comunidade social** (feed, atletas e treinadores) e **curadoria
de notícias**. O sistema foi desenvolvido com Next.js 16 (App Router), React 19,
TypeScript e Tailwind CSS 4, com persistência em PostgreSQL (Supabase) acessada via
Drizzle ORM e pagamentos processados pelo Mercado Pago. A condução do projeto utilizou
o framework ágil Scrum, com sprints curtas e divisão de responsabilidades entre cinco
integrantes. Ao final, a plataforma entregou 46 telas, 7 endpoints de API, 26 tabelas
de banco de dados e 44 Server Actions, cobrindo desde o cadastro e a verificação de
lojas até a moderação administrativa de conteúdo.

**Palavras-chave:** marketplace esportivo; comércio eletrônico; B2C; C2C; Next.js;
PostgreSQL; Scrum; desapego; comunidade virtual.

---

## Sumário

1. [Introdução](#1-introdução)
2. [Fundamentação Teórica](#2-fundamentação-teórica)
3. [Metodologia](#3-metodologia)
4. [Requisitos](#4-requisitos)
5. [Arquitetura e Modelo de Dados](#5-arquitetura-e-modelo-de-dados)
6. [Tecnologias Utilizadas](#6-tecnologias-utilizadas)
7. [Resultados](#7-resultados)
8. [Equipe](#8-equipe)
9. [Limitações e Trabalhos Futuros](#9-limitações-e-trabalhos-futuros)
10. [Apêndice A — Como executar o projeto](#apêndice-a--como-executar-o-projeto)
11. [Apêndice B — Estrutura de pastas](#apêndice-b--estrutura-de-pastas)
12. [Referências](#referências)

---

## 1. Introdução

### 1.1 Contexto

O comércio eletrônico esportivo brasileiro está distribuído entre grandes marketplaces
generalistas e lojas físicas com pouca presença digital. Pequenos lojistas de artigos
esportivos — e principalmente praticantes que desejam vender equipamentos usados —
carecem de um ambiente especializado que ofereça vitrine própria, alcance de público e
infraestrutura de pagamento sem exigir investimento em tecnologia própria.

### 1.2 Problema de pesquisa

**Como estruturar uma plataforma web que integre, em um mesmo ecossistema, a venda de
produtos novos por lojistas (B2C), a venda de usados entre consumidores (C2C) e a
formação de uma comunidade esportiva, mantendo segurança, usabilidade e moderabilidade?**

### 1.3 Justificativa

Os marketplaces generalistas tratam o artigo esportivo como mais uma categoria, sem
considerar especificidades como tamanho, modalidade, condição de uso e reputação do
vendedor. Além disso, não há espaço para a dimensão social da prática esportiva —
atletas, treinadores e a troca de experiências. O CoreMotion justifica-se ao endereçar
essas três frentes de forma integrada, reduzindo a barreira de entrada para pequenos
lojistas e criando um canal seguro para o desapego de equipamentos esportivos.

### 1.4 Objetivos

**Objetivo geral**
Desenvolver uma plataforma web de marketplace esportivo que integre vendas B2C,
vendas C2C, comunidade social e curadoria de conteúdo, com gestão administrativa
centralizada.

**Objetivos específicos**

1. Permitir que lojistas criem e gerenciem vitrines próprias com catálogo de produtos.
2. Viabilizar anúncios de produtos usados entre consumidores (desapego).
3. Implementar carrinho unificado (B2C + C2C), checkout e acompanhamento de pedidos.
4. Integrar meio de pagamento real para processamento de compras.
5. Construir módulo de comunidade com feed, perfis de atletas e treinadores.
6. Disponibilizar leitura de código de barras para identificação rápida de produtos.
7. Fornecer painel administrativo para moderação de usuários, lojas, anúncios e denúncias.
8. Garantir autenticação segura e controle de acesso por papel de usuário.

---

## 2. Fundamentação Teórica

### 2.1 Marketplace: modelos B2C e C2C

Marketplace é um ambiente digital que intermedeia transações entre ofertantes e
consumidores, operando como plataforma multilateral. Duas modalidades se destacam:

- **B2C (*Business to Consumer*):** empresas ou lojistas vendem para o consumidor final.
  No CoreMotion, corresponde às lojas com vitrine própria em `/loja/[slug]`.
- **C2C (*Consumer to Consumer*):** consumidores vendem diretamente a outros
  consumidores. No CoreMotion, corresponde ao módulo **Desapego**.

A plataforma opera em modelo híbrido: o mesmo carrinho e o mesmo checkout atendem às
duas modalidades, com distinção feita pela origem do item (`products` para B2C e
`listings` para C2C).

### 2.2 E-commerce esportivo

Diferentemente de categorias genéricas, o artigo esportivo exige atributos específicos
(tamanho, modalidade, gênero, condição) e forte apelo visual. A decisão de compra é
influenciada por reputação do vendedor, avaliações de outros compradores e conteúdo
de apoio — daí a inclusão de avaliações, verificação de lojas e notícias na plataforma.

### 2.3 Metodologia ágil Scrum

Scrum é um framework ágil para desenvolvimento incremental de produtos complexos.
Seus elementos centrais são:

| Elemento | Descrição |
|---|---|
| **Papéis** | Product Owner, Scrum Master e Time de Desenvolvimento |
| **Artefatos** | Product Backlog, Sprint Backlog e Incremento |
| **Eventos** | Planejamento da Sprint, Daily, Revisão da Sprint e Retrospectiva |

No contexto acadêmico, o Scrum favorece entregas parciais verificáveis, o que permitiu
ao grupo apresentar funcionalidades funcionando ao final de cada ciclo.

### 2.4 Arquitetura web moderna

A plataforma adota **Server Components** e **Server Actions** do Next.js App Router,
reduzindo a quantidade de código enviado ao navegador e eliminando a necessidade de
uma camada de API separada para a maior parte das operações de escrita. A tipagem
estática (TypeScript) e o acesso tipado ao banco (Drizzle ORM) reduzem erros em tempo
de desenvolvimento.

---

## 3. Metodologia

### 3.1 Condução com Scrum

O projeto foi conduzido em **sprints curtas**, com as seguintes práticas:

- **Planejamento de sprint** — seleção de itens do backlog priorizados por valor entregue.
- **Daily de alinhamento** — reuniões breves para acompanhar progresso e impedimentos.
- **Quadro de tarefas** — controle visual dos itens em *A fazer / Em andamento / Concluído*.
- **Revisão a cada entrega** — validação do incremento antes de avançar para o próximo ciclo.

### 3.2 Divisão de responsabilidades

| Integrante | Responsabilidade | Escopo de atuação |
|---|---|---|
| **Marcus** | Liderança / Scrum Master | Condução das sprints, dailies, quadro de tarefas e integração entre as frentes |
| **André** | Design | Identidade visual, UI/UX, paleta de cores, telas e componentes |
| **Alfeu** | Banco de Dados | Modelagem das tabelas, estrutura no Supabase, SQL e integridade dos dados |
| **Mattheus Krainski** | Funcionalidades / Back-end | Rotas, Server Actions, lógica da plataforma, loja, carrinho, marketplace e pagamentos |
| **Bruno e Mattheus Krainski** | Comunidade | Feed, perfis, posts, interações e notícias |

### 3.3 Ferramentas de apoio

Git e GitHub para versionamento; Vercel para deploy e integração contínua; Supabase
para banco e armazenamento; Google Slides para apresentação dos resultados.

---

## 4. Requisitos

### 4.1 Requisitos funcionais

| ID | Requisito | Módulo |
|---|---|---|
| RF-01 | O sistema deve permitir cadastro e autenticação de usuários | Conta |
| RF-02 | O sistema deve permitir que lojistas criem e editem sua loja | Venda B2C |
| RF-03 | O sistema deve permitir CRUD de produtos vinculado à loja | Venda B2C |
| RF-04 | O sistema deve permitir solicitação e aprovação de verificação de loja | Venda B2C / Admin |
| RF-05 | O sistema deve permitir anúncio de produtos usados | Venda C2C |
| RF-06 | O sistema deve oferecer carrinho único para itens B2C e C2C | Compra |
| RF-07 | O sistema deve processar pagamento via Mercado Pago | Compra |
| RF-08 | O sistema deve permitir acompanhamento de pedidos | Compra |
| RF-09 | O sistema deve permitir avaliação de produtos | Catálogo |
| RF-10 | O sistema deve permitir favoritar produtos | Compra |
| RF-11 | O sistema deve oferecer feed com publicação, curtidas e comentários | Comunidade |
| RF-12 | O sistema deve permitir seguir perfis | Comunidade |
| RF-13 | O sistema deve permitir contratação e gestão de treinos | Treinadores |
| RF-14 | O sistema deve oferecer leitura de código de barras | SmartScan |
| RF-15 | O sistema deve permitir denúncia de conteúdo | Moderação |
| RF-16 | O sistema deve oferecer painel administrativo completo | Admin |
| RF-17 | O sistema deve exibir notícias esportivas | Conteúdo |

### 4.2 Requisitos não funcionais

| ID | Requisito | Como é atendido |
|---|---|---|
| RNF-01 | Segurança de credenciais | Senhas com hash `scrypt` + salt individual |
| RNF-02 | Proteção de sessão | Cookie `httpOnly`, `sameSite=lax`, `secure` em produção |
| RNF-03 | Controle de acesso por papel | Campo `role` + funções `requireUser()` / `requireAdmin()` |
| RNF-04 | Integridade de dados | Constraints e FKs no PostgreSQL; acesso tipado via Drizzle |
| RNF-05 | Tipagem estática | TypeScript 5.9 em 100% do código-fonte |
| RNF-06 | Responsividade | Layout fluido com Tailwind CSS |
| RNF-07 | Usabilidade | Navegação por casca única (`Shell`) e componentes reutilizados |
| RNF-08 | Portabilidade de ambiente | Variáveis de ambiente e arquivo `.env.example` |
| RNF-09 | Desempenho | Renderização no servidor (Server Components) |

### 4.3 Atores e casos de uso

O diagrama completo de casos de uso — com 7 atores, 3 sistemas externos e 45 casos de
uso organizados em 8 fronteiras — está disponível em:

- **[`docs/diagrama-casos-de-uso.md`](docs/diagrama-casos-de-uso.md)** — catálogo detalhado e diagrama Mermaid
- **[`docs/diagrama-casos-de-uso.drawio`](docs/diagrama-casos-de-uso.drawio)** — versão editável no draw.io

**Papéis de usuário previstos no sistema** (`users.role`):
`user`, `seller`, `store_owner`, `community_owner`, `moderator`, `admin`,
`super_admin`, `athlete`, `coach`.

---

## 5. Arquitetura e Modelo de Dados

### 5.1 Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (Cliente)                   │
│         Server Components · Client Components · Tailwind      │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTP / Server Actions
┌───────────────────────────▼──────────────────────────────────┐
│                  NEXT.JS 16 — APP ROUTER                     │
│  ┌─────────────┬──────────────┬──────────────┬────────────┐  │
│  │   Rotas de  │    Server    │  Rotas de    │    Lib     │  │
│  │   página    │   Actions    │     API      │  (auth,    │  │
│  │   (RSC)     │              │              │  payments) │  │
│  └─────────────┴──────────────┴──────────────┴────────────┘  │
└───────┬───────────────────────┬──────────────────────┬───────┘
        │                       │                      │
┌───────▼────────┐   ┌──────────▼─────────┐   ┌────────▼───────┐
│   PostgreSQL   │   │    Mercado Pago    │   │   Supabase     │
│  (via pooler)  │   │    (pagamentos)    │   │   (Storage)    │
│  Drizzle ORM   │   │                    │   │                │
└────────────────┘   └────────────────────┘   └────────────────┘
```

### 5.2 Camadas

1. **Apresentação** — Server Components e Client Components em `src/app/**`, com
   componentes compartilhados (`Shell`, `ProductCard`, `Avatar`, `VerifiedBadge`, `Icons`).
2. **Lógica de aplicação** — 44 Server Actions em `src/app/actions.ts` (criação de
   lojas, produtos, anúncios, carrinho, moderação etc.).
3. **Acesso a dados** — Drizzle ORM sobre o driver `pg`, com *schema* tipado em
   `src/db/schema.ts`.
4. **Integrações** — Supabase (Postgres + Storage) e Mercado Pago (pagamentos).

### 5.3 Segurança e autenticação

- **Autenticação própria** com `scrypt` (salt + hash de 64 bytes) e verificação por
  comparação de tempo constante (`timingSafeEqual`).
- **Sessão** em cookie `httpOnly` (`sporthub_session`), validade de 30 dias,
  renovada a cada login e destruída no logout.
- **Controle de acesso:** funções `requireUser()` e `requireAdmin()` em
  `src/lib/auth.ts`; o painel `/admin` é restrito a `admin` e `super_admin`.
- **Autorização por posse:** o lojista só edita registros vinculados ao seu `store_id`.

### 5.4 Integrações

| Serviço | Finalidade | Ponto no código |
|---|---|---|
| Supabase PostgreSQL | Persistência relacional | `src/db/`, `drizzle.config.json` |
| Supabase JS / SSR | Storage e Auth | `src/lib/supabase*.ts` |
| Mercado Pago | Processamento de pagamentos | `src/lib/payments.ts` |
| BarcodeDetector API | Leitura de código de barras | `src/app/scanner/`, `src/app/api/scan/` |
| Vercel | Hospedagem e CI/CD | `vercel.json` |

### 5.5 Modelo de dados

O banco possui **26 tabelas**, organizadas nos seguintes grupos:

| Grupo | Tabelas |
|---|---|
| **Identidade** | `users`, `sessions` |
| **Lojas (B2C)** | `stores`, `store_verifications`, `verification_documents` |
| **Catálogo** | `products`, `product_images`, `listings`, `reviews` |
| **Compra** | `cart_items`, `wishlist`, `orders`, `order_items` |
| **Comunidade** | `posts`, `post_likes`, `post_comments`, `follows`, `communities` |
| **Treinadores** | `coach_services`, `bookings` |
| **Conteúdo** | `news` |
| **Utilitários** | `scans`, `reports`, `admin_logs`, `notifications`, `platform_settings` |

O SQL completo de criação está em [`supabase-setup.sql`](supabase-setup.sql), e o
*schema* tipado em `src/db/schema.ts`.

---

## 6. Tecnologias Utilizadas

### 6.1 Stack principal

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Next.js** | 16.2.6 | Framework full-stack (App Router, Server Components, Server Actions) |
| **React** | 19.2.6 | Biblioteca de interface |
| **React DOM** | 19.2.6 | Renderização |
| **TypeScript** | 5.9.3 | Tipagem estática em todo o projeto |
| **Tailwind CSS** | 4.1.17 | Estilização utilitária |
| **@tailwindcss/postcss** | 4.1.17 | Integração do Tailwind ao pipeline de build |
| **PostgreSQL** | — | Banco de dados relacional (hospedado no Supabase) |
| **pg** | 8.20.0 | Driver PostgreSQL para Node.js |
| **Drizzle ORM** | 0.45.2 | ORM com tipagem inferida do schema |
| **drizzle-kit** | 0.31.10 | Migrações e introspecção |
| **@supabase/supabase-js** | 2.112.3 | Cliente Supabase (Storage, Auth) |
| **@supabase/ssr** | 0.12.5 | Integração Supabase com Server Components |
| **mercadopago** | 3.6.0 | SDK oficial de pagamentos |
| **dotenv** | 17.3.1 | Carregamento de variáveis de ambiente |

### 6.2 Ferramentas de desenvolvimento e operação

| Ferramenta | Versão | Finalidade |
|---|---|---|
| **Node.js** | 22+ | Ambiente de execução |
| **ESLint** | 9.39.4 | Análise estática de código |
| **eslint-config-next** | 16.2.6 | Regras de lint específicas do Next.js |
| **Git / GitHub** | — | Versionamento e colaboração |
| **Vercel** | — | Hospedagem, build e deploy contínuo |
| **BarcodeDetector API** | nativa | Leitura de EAN-13, Code-128 e QR Code |
| **Google Slides / draw.io** | — | Apresentação e diagramação |

### 6.3 Bibliotecas nativas do Node.js empregadas

| Módulo | Uso |
|---|---|
| `node:crypto` (`scryptSync`, `randomBytes`, `timingSafeEqual`) | Hash de senha, geração de token de sessão e comparação segura |

### 6.4 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Execução do build de produção |
| `npm run lint` | Análise estática (ESLint) |
| `npm run typecheck` | Verificação de tipos sem gerar saída |

---

## 7. Resultados

A plataforma foi entregue com **46 telas**, **7 endpoints de API**, **26 tabelas**,
**44 Server Actions** e **96 arquivos** TypeScript/TSX, totalizando **13.609 linhas**
de código.

### 7.1 Módulos entregues

| Módulo | Rotas | Descrição |
|---|---|---|
| **Home e Marketplace** | `/`, `/marketplace` | Catálogo com 25 produtos de marcas reais (Nike, Adidas, Asics, Mizuno, Puma, New Balance, Olympikus) com preços praticados no Brasil |
| **Lojas B2C** | `/loja`, `/lojas`, `/lojas/nova`, `/loja/[slug]`, `/lojas/[slug]` | Listagem e vitrine pública com banner, logo, contato e produtos |
| **Minha Loja** | `/minha-loja`, `/criar`, `/editar`, `/produtos`, `/produtos/novo`, `/produtos/[id]/editar`, `/verificacao` | Gestão completa da loja e do catálogo pelo lojista |
| **Desapego (C2C)** | `/desapego`, `/desapego/[id]`, `/desapego/novo`, `/anunciar` | Anúncio e detalhamento de produtos usados entre consumidores |
| **Produto** | `/produto/[slug]` | Detalhe com galeria, especificações, tamanhos e avaliações |
| **Compra** | `/carrinho`, `/checkout`, `/pedidos`, `/favoritos` | Carrinho unificado B2C + C2C, checkout e histórico |
| **Comunidade** | `/feed`, `/atletas`, `/treinadores`, `/agendamentos` | Feed social, perfis, seguidores e agendamento de treinos |
| **Conteúdo** | `/noticias`, `/noticias/[slug]` | Curadoria de notícias esportivas |
| **SmartScan** | `/scanner` | Câmera do dispositivo para leitura de código de barras, com lanterna e vibração |
| **Conta** | `/login`, `/cadastro`, `/perfil`, `/recuperar-senha`, `/redefinir-senha` | Autenticação e gestão de perfil |
| **Administração** | `/admin` e 9 subpáginas | Dashboard, usuários, lojas, verificações, produtos, desapego, pedidos, denúncias, conteúdo e integrações |

### 7.2 Endpoints de API

| Endpoint | Método | Finalidade |
|---|---|---|
| `/api/auth/register` | POST | Cadastro de novo usuário |
| `/api/auth/login` | POST | Autenticação |
| `/api/auth/logout` | POST | Encerramento de sessão |
| `/api/auth/callback` | GET | Retorno de autenticação |
| `/api/scan` | POST | Identificação de produto por código de barras |
| `/api/integrations/status` | GET | Verificação de disponibilidade das integrações |
| `/api/health` | GET | Verificação de saúde da aplicação |

### 7.3 Painel administrativo

O módulo `/admin` oferece: **dashboard**, **usuários** (banir, verificar, excluir),
**lojas**, **verificações de loja**, **produtos**, **desapego**, **pedidos**,
**denúncias**, **conteúdo/notícias** e **integrações**.

---

## 8. Equipe

| Integrante | Função no projeto | Principais entregas |
|---|---|---|
| **Marcus** | Líder / Scrum Master | Condução das sprints, das dailies e do quadro de tarefas do time |
| **André** | Design | Identidade visual, UI/UX, paleta de cores, telas e componentes |
| **Alfeu** | Banco de Dados | Modelagem das 26 tabelas, estrutura no Supabase, SQL e integridade dos dados |
| **Mattheus Krainski** | Funcionalidades / Back-end | Rotas, APIs e lógica da plataforma: loja, carrinho, marketplace e pagamentos |
| **Bruno e Mattheus Krainski** | Comunidade | Feed, perfis, posts, interações e notícias |

---

## 9. Limitações e Trabalhos Futuros

### 9.1 Limitações atuais

- **Notificações sem interface:** a tabela `notifications` existe, mas ainda não há
  central de notificações para o usuário.
- **Comunidades sem tela:** a tabela `communities` foi modelada, porém não há rota
  pública de comunidades; a interação social ocorre apenas pelo feed.
- **Configurações da plataforma:** a tabela `platform_settings` não possui tela de
  administração.
- **Imagens locais não versionadas:** o catálogo referencia arquivos em
  `/public/products/`, que não estão no repositório; as imagens exibidas vêm do CDN
  Pexels.
- **Sem suíte de testes automatizados:** a verificação é feita por lint, checagem de
  tipos e validação manual.
- **Pagamento:** a integração com o Mercado Pago opera em credenciais de teste e
  requer configuração de webhook para conciliação automática em produção.

### 9.2 Trabalhos futuros

1. Central de notificações em tempo real.
2. Tela pública de comunidades e grupos por modalidade esportiva.
3. Painel de configurações da plataforma no admin.
4. Suíte de testes automatizados (unitários e de integração).
5. Webhook do Mercado Pago para conciliação e atualização automática de status.
6. Rastreamento de pedidos com código de logística.
7. Relatórios gerenciais para lojistas.
8. Aplicativo móvel com o SmartScan nativo.

---

## Apêndice A — Como executar o projeto

### A.1 Pré-requisitos

- Node.js 22 ou superior
- Uma instância de PostgreSQL (recomendado: projeto Supabase gratuito)

### A.2 Instalação

```bash
git clone https://github.com/MattheusHKrainski/CoreMotion.git
cd CoreMotion
npm install
cp .env.example .env
```

### A.3 Variáveis de ambiente

Preencha o `.env` conforme o modelo abaixo. **Nunca versione valores reais.**

```bash
# PostgreSQL — connection string do seu projeto
DATABASE_URL=postgresql://usuario:SUA-SENHA@SEU-HOST:6543/postgres?pgbouncer=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-CHAVE-ANON
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA-CHAVE-ANON
SUPABASE_PUBLISHABLE_KEY=SUA-CHAVE-PUBLISHABLE      # opcional, novo padrão Supabase
SUPABASE_SERVICE_ROLE_KEY=SUA-CHAVE-SERVICE-ROLE    # opcional, somente servidor

# Bucket de imagens (opcional)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=coremotion

# URL pública da aplicação (usada em retornos de pagamento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=SEU-TOKEN
```

### A.4 Preparação do banco

Execute o conteúdo de [`supabase-setup.sql`](supabase-setup.sql) no SQL Editor do
Supabase para criar as 26 tabelas. O primeiro acesso à aplicação executa
automaticamente a carga inicial (seed) de lojas, produtos e conteúdo.

Para recarregar os dados, utilize:

```bash
node scripts/reseed.mjs
```

### A.5 Execução

```bash
npm run dev      # desenvolvimento  → http://localhost:3000
npm run build    # build de produção
npm start        # execução do build
npm run lint     # análise estática
npm run typecheck# verificação de tipos
```

### A.6 Deploy

O repositório está pronto para deploy na **Vercel**. Configure as variáveis de ambiente
na plataforma e importe o repositório. O arquivo `vercel.json` já define o framework e
o comando de build.

> **Por que Vercel e não GitHub Pages?** O GitHub Pages hospeda apenas conteúdo
> estático. O CoreMotion exige execução no servidor (autenticação, banco, Server
> Actions), o que requer plataforma compatível com Next.js.

---

## Apêndice B — Estrutura de pastas

```
CoreMotion/
├── docs/
│   ├── diagrama-casos-de-uso.md        # catálogo + diagrama Mermaid
│   └── diagrama-casos-de-uso.drawio    # diagrama editável
├── public/
│   └── products/                       # imagens locais do catálogo
├── scripts/
│   └── reseed.mjs                      # recarga dos dados iniciais
├── src/
│   ├── app/
│   │   ├── actions.ts                  # 44 Server Actions
│   │   ├── admin/                      # painel administrativo (9 módulos)
│   │   ├── api/                        # 7 endpoints (auth, scan, integrations, health)
│   │   ├── minha-loja/                 # gestão da loja pelo lojista
│   │   ├── loja/[slug]/                # vitrine pública da loja
│   │   ├── lojas/, marketplace/        # listagem e catálogo
│   │   ├── desapego/                   # módulo C2C
│   │   ├── produto/[slug]/             # detalhe do produto
│   │   ├── carrinho/, checkout/, pedidos/, favoritos/
│   │   ├── feed/, atletas/, treinadores/, agendamentos/
│   │   ├── noticias/, scanner/, perfil/
│   │   └── login/, cadastro/, recuperar-senha/, redefinir-senha/
│   ├── components/                     # Avatar, Icons, ProductCard, Shell, VerifiedBadge
│   ├── db/
│   │   ├── schema.ts                   # 26 tabelas (Drizzle)
│   │   └── index.ts                    # conexão
│   └── lib/
│       ├── auth.ts                     # sessão, hash scrypt, requireUser/requireAdmin
│       ├── catalog.ts                  # catálogo-base de produtos
│       ├── media.ts                    # imagens do catálogo
│       ├── payments.ts                 # integração Mercado Pago
│       ├── seed.ts                     # carga inicial
│       └── supabase*.ts                # clientes Supabase (browser/server)
├── supabase-setup.sql                  # DDL completo
├── drizzle.config.json                 # configuração do ORM
└── vercel.json                         # configuração de deploy
```

---

## Referências

- NEXT.JS. *Next.js Documentation — App Router*. Disponível em: <https://nextjs.org/docs>. Acesso em: 21 out. 2026.
- REACT. *React Documentation*. Disponível em: <https://react.dev>. Acesso em: 21 out. 2026.
- TAILWIND CSS. *Tailwind CSS v4 Documentation*. Disponível em: <https://tailwindcss.com/docs>. Acesso em: 21 out. 2026.
- DRIZZLE TEAM. *Drizzle ORM Documentation*. Disponível em: <https://orm.drizzle.team>. Acesso em: 21 out. 2026.
- SUPABASE. *Supabase Documentation — Database, Auth and Storage*. Disponível em: <https://supabase.com/docs>. Acesso em: 21 out. 2026.
- MERCADO PAGO. *Documentação para desenvolvedores*. Disponível em: <https://www.mercadopago.com.br/developers>. Acesso em: 21 out. 2026.
- SCHWABER, K.; SUTHERLAND, J. *The Scrum Guide*. 2020. Disponível em: <https://scrumguides.org>. Acesso em: 21 out. 2026.
- PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software: uma abordagem profissional*. 9. ed. Porto Alegre: AMGH, 2021.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.
- TURBAN, E. et al. *Comércio Eletrônico: estratégia e gestão*. São Paulo: Cengage Learning, 2019.

---

**CoreMotion © 2026 — Marketplace esportivo com lojas, desapego, comunidades e notícias.**

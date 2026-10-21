# CoreMotion — Diagrama de Casos de Uso (versão atualizada)

> Diagrama reconstruído a partir do **código-fonte real** da plataforma
> (`src/app/…`, `src/db/schema.ts`, `src/lib/*`), não de documentação antiga.
> Última atualização: 21/10/2026 — branch `arena/3afdd463-coremotion`.

---

## 1. Atores

| # | Ator | `role` no banco | Descrição |
|---|------|-----------------|-----------|
| A1 | **Visitante** | — (não autenticado) | Navega no conteúdo público sem criar conta |
| A2 | **Cliente** | `user` | Compra em lojas (B2C) e no Desapego (C2C) |
| A3 | **Lojista** | `store_owner` | Possui vitrine própria em `/loja/[slug]` e vende pelo checkout CoreMotion |
| A4 | **Vendedor C2C** | `seller` | Anuncia produtos usados no Desapego |
| A5 | **Atleta** | `athlete` | Perfil esportivo + interação na comunidade |
| A6 | **Treinador** | `coach` | Oferece serviços de treino e recebe agendamentos |
| A7 | **Administrador** | `admin`, `super_admin`, `moderator` | Modera a plataforma inteira em `/admin` |

**Atores secundários (sistemas externos)**

| # | Sistema | Integração no código |
|---|---------|----------------------|
| S1 | **Supabase** | Postgres (pooler) + Storage — `src/lib/supabase.ts`, `src/db/` |
| S2 | **Mercado Pago** | Checkout/pagamentos — `src/lib/payments.ts` |
| S3 | **SmartScan** | Leitura de código de barras — `src/app/scanner/`, `src/app/api/scan/` |

> Um mesmo usuário físico pode acumular papéis (ex.: ser Cliente **e** Lojista **e** Atleta).
> `role` é um único campo em `users.role`, então papéis extras são controlados por dados
> associados (ter registro em `stores`, `coach_services`, etc.).

---

## 2. Diagrama

```mermaid
usecase-beta
direction LR

%% ---------- Atores primários ----------
actor Visitante("Visitante")
actor Cliente("Cliente / Comprador")
actor Lojista("Lojista B2C")
actor Vendedor("Vendedor C2C")
actor Atleta("Atleta")
actor Treinador("Treinador")
actor Admin("Administrador")

%% ---------- Atores secundários ----------
actor Supabase("Supabase")@{ type: hollow }
actor MP("Mercado Pago")@{ type: hollow }
actor ScanAPI("SmartScan")@{ type: hollow }

%% ---------- Conta e Acesso ----------
systemBoundary "Conta e Acesso"
  UC10("Cadastrar-se")
  UC11("Autenticar-se")
  UC12("Recuperar senha")
  UC13("Gerenciar perfil")
end

%% ---------- Catálogo e Descoberta ----------
systemBoundary "Catálogo e Descoberta"
  UC01("Ver home e marketplace")
  UC02("Buscar e filtrar produtos")
  UC03("Ver detalhe do produto")
  UC04("Ver avaliações do produto")
  UC05("Ver lojas e vitrine")
  UC06("Navegar no Desapego")
  UC07("Ler notícias")
  UC08("Usar SmartScan")
end

%% ---------- Compra ----------
systemBoundary "Compra"
  UC20("Gerenciar carrinho")
  UC21("Finalizar compra")
  UC22("Acompanhar pedidos")
  UC23("Gerenciar favoritos")
  UC24("Avaliar produto")
  UC25("Denunciar conteúdo")
end

%% ---------- Venda B2C ----------
systemBoundary "Venda B2C - Lojista"
  UC30("Criar loja")
  UC31("Editar loja")
  UC32("Gerenciar produtos")
  UC33("Solicitar verificação da loja")
  UC34("Acompanhar pedidos recebidos")
end

%% ---------- Venda C2C ----------
systemBoundary "Venda C2C - Desapego"
  UC40("Criar anúncio")
  UC41("Gerenciar anúncios")
end

%% ---------- Comunidade ----------
systemBoundary "Comunidade"
  UC50("Publicar no feed")
  UC51("Curtir e comentar")
  UC52("Seguir perfis")
  UC53("Ver atletas")
  UC54("Ver treinadores")
  UC55("Agendar treino")
  UC56("Oferecer serviço de treino")
  UC57("Gerenciar agenda de treinos")
end

%% ---------- Administração ----------
systemBoundary "Administração"
  UC60("Ver dashboard")
  UC61("Gerenciar usuários")
  UC62("Aprovar verificações de loja")
  UC63("Moderar lojas e produtos")
  UC64("Moderar anúncios do Desapego")
  UC65("Gerenciar pedidos")
  UC66("Gerenciar denúncias")
  UC67("Gerenciar notícias e conteúdo")
  UC68("Monitorar integrações")
end

%% ---------- Serviços externos ----------
systemBoundary "Serviços externos"
  UC80("Processar pagamento")
  UC81("Persistir dados e arquivos")
  UC82("Identificar produto por código")
end

%% ---------- Visitante ----------
Visitante --> UC01
Visitante --> UC02
Visitante --> UC03
Visitante --> UC04
Visitante --> UC05
Visitante --> UC06
Visitante --> UC07
Visitante --> UC08
Visitante --> UC10
Visitante --> UC11
Visitante --> UC12
Visitante --> UC53
Visitante --> UC54

%% ---------- Cliente ----------
Cliente --> UC01
Cliente --> UC02
Cliente --> UC03
Cliente --> UC04
Cliente --> UC05
Cliente --> UC06
Cliente --> UC07
Cliente --> UC08
Cliente --> UC11
Cliente --> UC12
Cliente --> UC13
Cliente --> UC20
Cliente --> UC21
Cliente --> UC22
Cliente --> UC23
Cliente --> UC24
Cliente --> UC25
Cliente --> UC40
Cliente --> UC41
Cliente --> UC50
Cliente --> UC51
Cliente --> UC52
Cliente --> UC55

%% ---------- Lojista ----------
Lojista --> UC13
Lojista --> UC30
Lojista --> UC31
Lojista --> UC32
Lojista --> UC33
Lojista --> UC34

%% ---------- Vendedor C2C ----------
Vendedor --> UC13
Vendedor --> UC40
Vendedor --> UC41

%% ---------- Atleta ----------
Atleta --> UC13
Atleta --> UC50
Atleta --> UC51
Atleta --> UC52
Atleta --> UC55

%% ---------- Treinador ----------
Treinador --> UC13
Treinador --> UC50
Treinador --> UC51
Treinador --> UC56
Treinador --> UC57

%% ---------- Administrador ----------
Admin --> UC60
Admin --> UC61
Admin --> UC62
Admin --> UC63
Admin --> UC64
Admin --> UC65
Admin --> UC66
Admin --> UC67
Admin --> UC68

%% ---------- Sistemas externos ----------
MP --> UC80
Supabase --> UC81
ScanAPI --> UC82

%% ---------- Relacionamentos include / extend ----------
UC21 ..> : include UC80
UC21 ..> : include UC81
UC24 ..> : include UC11
UC25 ..> : include UC11
UC20 ..> : include UC11
UC22 ..> : include UC11
UC23 ..> : include UC11
UC30 ..> : include UC11
UC31 ..> : include UC11
UC32 ..> : include UC11
UC33 ..> : include UC11
UC34 ..> : include UC11
UC40 ..> : include UC11
UC41 ..> : include UC11
UC50 ..> : include UC11
UC51 ..> : include UC11
UC52 ..> : include UC11
UC55 ..> : include UC11
UC56 ..> : include UC11
UC57 ..> : include UC11
UC13 ..> : include UC11
UC08 ..> : include UC82
UC61 ..> : include UC11
UC62 ..> : include UC11
UC63 ..> : include UC11
UC64 ..> : include UC11
UC65 ..> : include UC11
UC66 ..> : include UC11
UC67 ..> : include UC11
UC68 ..> : include UC11
UC10 ..> : include UC81
UC11 ..> : include UC81
UC66 ..> : extend UC25
```

> **Se o diagrama não renderizar no GitHub:** o bloco `usecase-beta` exige Mermaid **12+**.
> Abra o arquivo em <https://mermaid.live> ou use o arquivo
> `diagrama-casos-de-uso.drawio` (abre no draw.io / diagrams.net).

---

## 3. Catálogo de casos de uso

### A1 · Visitante
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC01 | Ver home e marketplace | `/`, `/marketplace` |
| UC02 | Buscar e filtrar produtos | `/marketplace` |
| UC03 | Ver detalhe do produto | `/produto/[slug]` |
| UC04 | Ver avaliações do produto | `/produto/[slug]` |
| UC05 | Ver lojas e vitrine da loja | `/lojas`, `/loja/[slug]` |
| UC06 | Navegar no Desapego | `/desapego`, `/desapego/[id]` |
| UC07 | Ler notícias | `/noticias`, `/noticias/[slug]` |
| UC08 | Usar SmartScan (câmera) | `/scanner` |
| UC10 | Cadastrar-se | `/cadastro` |
| UC11 | Autenticar-se | `/login` |
| UC12 | Recuperar / redefinir senha | `/recuperar-senha`, `/redefinir-senha` |
| UC53 | Ver atletas | `/atletas` |
| UC54 | Ver treinadores | `/treinadores` |

### A2 · Cliente (`user`)
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC13 | Gerenciar perfil | `/perfil` |
| UC20 | Gerenciar carrinho | `/carrinho` |
| UC21 | Finalizar compra (checkout) | `/checkout` |
| UC22 | Acompanhar pedidos | `/pedidos` |
| UC23 | Gerenciar favoritos (wishlist) | `/favoritos` |
| UC24 | Avaliar produto | `/produto/[slug]` |
| UC25 | Denunciar conteúdo | `reports` |
| UC40 | Criar anúncio no Desapego | `/anunciar`, `/desapego/novo` |
| UC41 | Gerenciar anúncios | `/desapego/[id]` |
| UC50 | Publicar no feed | `/feed` |
| UC51 | Curtir e comentar | `/feed` |
| UC52 | Seguir perfis | `follows` |
| UC55 | Agendar treino com treinador | `/agendamentos` |

> `/checkout` redireciona para `/login?next=/checkout` quando não há sessão —
> por isso UC20–UC24 têm `<<include>>` em **Autenticar-se**.

### A3 · Lojista (`store_owner`)
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC30 | Criar loja | `/minha-loja/criar` |
| UC31 | Editar loja | `/minha-loja/editar` |
| UC32 | Gerenciar produtos (CRUD) | `/minha-loja/produtos`, `/produtos/novo`, `/produtos/[id]/editar` |
| UC33 | Solicitar verificação da loja | `/minha-loja/verificacao`, `/verificacao` |
| UC34 | Acompanhar pedidos recebidos | `/minha-loja`, `/pedidos` |

### A4 · Vendedor C2C (`seller`)
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC40 | Criar anúncio | `/anunciar`, `/desapego/novo` |
| UC41 | Gerenciar / remover anúncios | `/desapego/[id]` |

### A5 · Atleta (`athlete`)
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC50 | Publicar no feed | `/feed` |
| UC51 | Curtir e comentar | `/feed` |
| UC52 | Seguir perfis | `follows` |
| UC55 | Agendar treino | `/agendamentos` |

### A6 · Treinador (`coach`)
| UC | Caso de uso | Rota / tabela |
|----|-------------|---------------|
| UC56 | Oferecer serviço de treino | `coach_services` |
| UC57 | Gerenciar agenda de treinos | `/agendamentos`, `bookings` |

### A7 · Administrador (`admin`, `super_admin`, `moderator`)
| UC | Caso de uso | Rota |
|----|-------------|------|
| UC60 | Ver dashboard | `/admin` |
| UC61 | Gerenciar usuários (banir / verificar / excluir) | `/admin/usuarios` |
| UC62 | Aprovar verificações de loja | `/admin/verificacoes` |
| UC63 | Moderar lojas e produtos | `/admin/lojas`, `/admin/produtos` |
| UC64 | Moderar anúncios do Desapego | `/admin/desapego` |
| UC65 | Gerenciar pedidos | `/admin/pedidos` |
| UC66 | Gerenciar denúncias | `/admin/denuncias` |
| UC67 | Gerenciar notícias e conteúdo | `/admin/conteudo` |
| UC68 | Monitorar integrações (Supabase / GitHub) | `/admin/integracoes`, `/api/integrations/status` |

> Acesso a `/admin` é controlado por `requireAdmin()` — só `admin` e `super_admin`.

---

## 4. Regras de negócio relevantes

- **Dono só edita a própria loja** — validação por `store_id` do usuário da sessão.
- **Só `admin` / `super_admin`** entram em `/admin` (`src/lib/auth.ts` → `requireAdmin`).
- **Compra sempre autenticada** — carrinho, checkout, pedidos e favoritos exigem sessão.
- **Verificação de loja** é solicitada pelo lojista (UC33) e aprovada pelo admin (UC62).
- **Denúncia (UC25)** gera registro em `reports` e é tratada pelo admin em UC66 (`<<extend>>`).
- **Pagamento** nunca é processado internamente — sempre delegado ao Mercado Pago (UC80).

---

## 5. O que estava desatualizado (divergências encontradas)

| Item | Documentação antiga | Estado real no código |
|------|--------------------|-----------------------|
| Nº de tabelas | "20 tabelas" (README) | **26 tabelas** em `src/db/schema.ts` |
| Papéis de usuário | não documentado | `user`, `seller`, `store_owner`, `community_owner`, `moderator`, `admin`, `super_admin`, `athlete`, `coach` |
| Verificação de loja | ausente | `store_verifications`, `verification_documents`, rotas `/minha-loja/verificacao` e `/admin/verificacoes` |
| Comunidades | ausente | tabelas `communities`, `follows`, `post_likes`, `post_comments` |
| Treinadores | citado só como "Banco" | `coach_services` + `bookings` + rota `/agendamentos` |
| Notificações | ausente | tabela `notifications` (back-end pronto, **sem interface ainda**) |
| Imagens de produto | ausente | tabela `product_images` |
| Configurações | ausente | tabela `platform_settings` |
| Pagamentos | Mercado Pago só na stack | integração real em `src/lib/payments.ts` |
| Denúncias | citada no admin | `reports` + fluxo visitante/cliente → admin |

### Tabelas atuais (26)
`users`, `sessions`, `stores`, `store_verifications`, `verification_documents`,
`products`, `product_images`, `listings`, `reviews`, `cart_items`, `wishlist`,
`orders`, `order_items`, `posts`, `post_likes`, `post_comments`, `follows`,
`communities`, `coach_services`, `bookings`, `news`, `scans`, `reports`,
`admin_logs`, `notifications`, `platform_settings`

### Lacunas (existem no banco mas **não** têm interface)
- `communities` — não há rota `/comunidades`
- `notifications` — não há central de notificações
- `platform_settings` — não há tela de configurações no admin

---

## 6. Arquivos

| Arquivo | Para que serve |
|---------|----------------|
| `docs/diagrama-casos-de-uso.md` | Este documento (catálogo + diagrama Mermaid) |
| `docs/diagrama-casos-de-uso.drawio` | Diagrama editável no draw.io / diagrams.net |

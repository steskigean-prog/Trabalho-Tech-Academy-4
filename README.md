# iMDB Admin — Gestão de Catálogo de Filmes

Sistema de gestão de catálogo de filmes (estilo IMDb) reconstruído a partir de
um legado PHP procedural (pasta `legados/`, mantida apenas como referência)
com arquitetura moderna:

- **Backend**: API REST em **PHP 8.3** puro (sem frameworks) com autenticação
  **JWT (HS256)**, **PDO/MySQL**, camadas Controllers / Services / Repositories
  / Entities / Validators e exceções customizadas por status HTTP.
- **Frontend**: SPA em **React 18 + TypeScript** estrito (Vite) com contexto
  global de autenticação, componentes genéricos reutilizáveis, entidades com
  setters validados e **validação duplicada** no cliente.
- **Infra**: **Docker Compose** com 4 serviços (MySQL, backend, frontend e
  **Nginx como proxy reverso — única porta exposta**), duas redes isoladas e
  volume persistente para o banco.

## Como rodar

Requisito: Docker (com Docker Compose v2).

```bash
docker compose up --build -d
```

Aguarde o MySQL inicializar (o script `database/imdb.sql` cria as tabelas e os
seeds na primeira subida) e abra:

> **http://localhost:8080**

A porta pode ser alterada em `PORTA_NGINX` no `.env` (ver `.env.example`).

### Usuários pré-cadastrados (seeds)

| E-mail | Senha |
| --- | --- |
| `admin@gmail.com` | `Admin@123` |
| `teste@teste.com` | `Teste@123` |

### Comandos úteis

```bash
docker compose ps                        # estado dos serviços
docker compose logs -f backend           # logs da API
docker compose down                      # derrubar (mantém os dados)
```

> ⚠️ `docker compose down -v` remove o volume do MySQL (apaga o catálogo).

### Testes automatizados

Com a stack no ar, o script de smoke tests percorre o contrato completo da API
(login/registro/perfil, CRUDs paginados, 401/404/409/422, relacionamentos e
sincronização de elenco):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-tests.ps1
```

Saída esperada: todos os testes `[PASS]` e `Falhas: 0`.

## Endpoints da API

Autenticação (públicas):

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login (e-mail + senha) → `{token, usuario}` |
| `POST` | `/api/auth/registro` | Cadastro: nome, e-mail, senha, CPF (todos obrigatórios) |
| `GET` | `/api/perfil` | Dados do usuário logado (token obrigatório) |
| `PUT` | `/api/perfil` | Edita nome/CPF/senha (e-mail não pode ser alterado) |

CRUDs autenticados (`Authorization: Bearer <token>`) — o mesmo contrato para
`/api/categorias`, `/api/atores`, `/api/diretores` e `/api/filmes`:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/<recurso>?pagina=1&limite=10` | Lista paginada `{data, meta}` |
| `GET` | `/api/<recurso>/{id}` | Detalhe (404 se não existir) |
| `POST` | `/api/<recurso>` | Cria (422 com `detalhes` por campo se inválido) |
| `PUT` | `/api/<recurso>/{id}` | Atualiza (404 se não existir; 409 duplicado) |
| `DELETE` | `/api/<recurso>/{id}` | Exclui (404 se não existir; 409 se houver dependentes) |

Formato de erro padrão: `{ "erro": "mensagem", "codigo": 422, "detalhes": { "campo": "motivo" } }`.

### Contratos de status

| Situação | Status |
| --- | --- |
| Sem/ token inválido | `401` |
| Registro inexistente (editar/excluir/buscar) | `404` |
| Nome duplicado / exclusão com dependentes | `409` |
| Validação falhou (cliente ou servidor) | `422` |

## Modelo de dados

- `usuarios` — nome, e-mail (único), senha (bcrypt), CPF (11 dígitos, válido)
- `categorias` — nome único
- `atores` / `diretores` — nome, nacionalidade (papel herdado de `Pessoa`)
- `filmes` — título, título original, ano, sinopse, YouTube, capa + FKs
  - **N:1** com `categorias` e com `diretores`
  - **N:M** com `atores` via `filme_ator` (elenco)

## Estrutura

```text
backend/    API REST (PHP 8.3, Apache, JWT)      frontend/   SPA (React + TS + Vite)
database/   imdb.sql (estrutura + seeds)         nginx/      proxy reverso
docker-compose.yml                              .opencode/  skills + guardrails de agentes
legados/    sistema original — somente referência
```

Detalhes de arquitetura, convenções de código e regras de negócio estão no
**AGENTS.md**.

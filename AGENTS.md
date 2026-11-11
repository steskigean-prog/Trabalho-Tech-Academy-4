# AGENTS.md — Guia de Agentes do iMDB Admin

Instruções para agentes de IA (OpenCode) que trabalham neste repositório.
Leia este arquivo antes de qualquer alteração.

## Persona / Cliente

> **Marina Duarte, 34 anos — Gerente de Catálogo da iMDB Admin**
>
> Marina coordena o catálogo de filmes de um serviço de streaming regional.
> Ela passa o dia cadastrando lançamentos, corrigindo elencos e mantendo as
> categorias organizadas. Não é desenvolvedora: usa o sistema pelo navegador e
> espera telas rápidas, mensagens claras ("este CPF é inválido", "já existe uma
> categoria com este nome") e nenhuma surpresa — nada de apagar um registro sem
> confirmação. Seu computador é um notebook comum, então a aplicação roda via
> Docker e deve abrir em `http://localhost:8080` sem passos manuais.

Toda decisão de produto deve ser validada contra a rotina da Marina: cadastro
com validação dupla (navegador + servidor), listagens paginadas, confirmação
antes de excluir e erros que expliquem o que fazer.

## Visão geral do projeto

Sistema de gestão de catálogo de filmes (estilo IMDb) reconstruído a partir de
um legado PHP procedural (`legados/` — apenas referência, **não modificar**):

- **Backend**: API REST em PHP 8.3 (sem frameworks externos) com autenticação
  JWT (HS256), PDO/MySQL, camadas Controllers / Services / Repositories /
  Entities / Validators e exceções customizadas por tipo de erro HTTP.
- **Frontend**: SPA em React 18 + TypeScript estrito com Vite, contexto global
  de autenticação, componentes genéricos reutilizáveis, entidades com setters
  validados e validações duplicadas no cliente.
- **Infra**: Docker Compose com 4 serviços (MySQL, backend, frontend, Nginx
  como proxy reverso — única porta exposta) e duas redes (frontend/backend).

## Mapa do projeto

```text
.
├── backend/                  # API REST (PHP 8.3 + Apache)
│   ├── docker/apache.conf    # VirtualHost (DocumentRoot public/)
│   ├── public/               # Front controller + .htaccess + capas (arquivos/)
│   └── src/
│       ├── bootstrap.php     # Autoload PSR-4 do namespace App\
│       ├── routes.php        # Rotas (resource = 5 rotas de CRUD)
│       ├── Core/             # Database (PDO), Request, Router
│       ├── Controllers/      # CrudController abstrato + Auth/Usuario/Crud concretos
│       ├── Entities/         # Entidade, Pessoa (abstract) + Ator/Diretor, Filme, Usuario
│       ├── Repositories/     # Repositorio base + concretos (SQL, paginação)
│       ├── Services/         # AuthService (login/registro/perfil)
│       ├── Validators/       # Validador abstract + regras + Validacao (lote)
│       ├── Middleware/       # AuthMiddleware (Bearer JWT)
│       ├── Exceptions/       # HttpException abstract + subclasses por status
│       └── Support/          # Env, Jwt (HS256), Resposta (JSON)
├── frontend/                 # SPA React 18 + TypeScript (Vite)
│   ├── public/               # logo.png, favicon.png
│   └── src/
│       ├── api/http.ts       # Cliente HTTP (token Bearer no localStorage)
│       ├── contexts/         # AuthContext (contexto global do usuário)
│       ├── domain/           # entidades, validadores, repositórios, serviços
│       ├── components/ui/    # componentes genéricos (Botao, Tabela, Paginacao…)
│       ├── components/layout/# Layout, BarraNavegacao, RotaProtegida
│       ├── hooks/            # useListagem (paginação/carregamento/erro)
│       └── pages/            # telas (listagem e formulário separados por recurso)
├── database/imdb.sql         # Estrutura + seeds (executado pelo MySQL na 1ª subida)
├── nginx/nginx.conf          # Proxy reverso (/api e /arquivos → backend; / → SPA)
├── scripts/smoke-tests.ps1   # Smoke tests do contrato da API (PowerShell)
├── docker-compose.yml        # db + backend + frontend + nginx (redes e volumes)
├── .opencode/                # skills, permissões (guardrails) e configuração
├── legados/                  # código legado — SOMENTE leitura/referência
└── .env / .env.example       # variáveis de ambiente (ver guardrails)
```

## Regras de negócio fundamentais

1. **Autenticação**: login com e-mail (regex) + senha (bcrypt); token JWT
   (HS256, segredo em `JWT_SECRET`) válido por `JWT_EXPIRACAO` segundos.
2. **Cadastro de usuário** (`POST /api/auth/registro`): nome, e-mail, senha e
   CPF **obrigatórios**; senha mínimo 8 caracteres com maiúscula, minúscula e
   número; CPF com dígitos verificadores (armazenado só com 11 números).
3. **Perfil** (`GET/PUT /api/perfil`): apenas o próprio usuário (id vem do
   token); **e-mail não pode ser alterado**; todos os campos obrigatórios.
4. **CRUDs autenticados e paginados** (`categorias`, `filmes`, `atores`,
   `diretores`): respostas `{data, meta:{pagina,limite,total,paginas}}`;
   editar/excluir algo inexistente retorna **404**; duplicidades/dependências
   retornam **409**; validação falha retorna **422** com `detalhes` por campo.
5. **Relacionamentos**: filme → categoria (N:1), filme → diretor (N:1),
   filme ↔ ator (N:M via `filme_ator`).

## Convenções de código

- **PHP**: `declare(strict_types=1)`, snake_case em JSON/banco, nomes de classes
  em português (`Repositorio`, `Validador`). Sem `echo` direto — toda saída sai
  por `Resposta`. Toda tabela nova nasce como `Router::resource()` + controller
  herdando `CrudController`.
- **TypeScript**: modo estrito, **proibido `any`**, campos privados `#campo`
  com getters/setters validados, exceções customizadas (`ErroApi`,
  `ErroValidacao`), Generics nos repositórios/serviços. Nenhum arquivo `.js`.
- **Frontend**: componentes genéricos em `components/ui/`; telas em `pages/`
  com listagem e formulário **separados**; componentes exclusivos de página em
  funções separadas no mesmo arquivo; validação do cliente **duplica** as
  regras do backend (ver `domain/validadores/`).
- **Mensagens**: sempre em português, amigáveis e orientadas a ação
  ("Preencha o e-mail", "Já existe uma categoria com este nome").

## Guardrails (obrigatórios)

1. **NUNCA leia, imprima, copie ou exponha o conteúdo de `.env`** (e arquivos
   `*.env.*`). Ele contém credenciais. Consulte apenas o `.env.example`.
   As permissões em `.opencode/opencode.json` negam leitura/edição desses
   arquivos — não tente contorná-las (ex.: via `cat`, `type` ou subshell).
2. **Não altere nada em `legados/`** — é o sistema original, usado apenas como
   referência histórica.
3. **Não exponha portas além da do Nginx** (`PORTA_NGINX`, padrão 8080) e não
   publique o banco nem o backend no `docker-compose.yml`.
4. **Não desabilite validações** para "facilitar" testes — a validação dupla
   (cliente + servidor) é requisito do projeto.
5. Comandos destrutivos de Docker (`docker compose down -v`, `docker volume rm`)
   removem os dados do MySQL: só execute com confirmação explícita do usuário.
6. Seeds de usuário: `admin@gmail.com / Admin@123` e `teste@teste.com /
   Teste@123` — úteis para testes, documentados no README.

## Comandos úteis

```bash
# Subir tudo (build + redes + volumes)
docker compose up --build -d

# Ver logs
docker compose logs -f backend

# Derrubar (mantém os dados)
docker compose down

# Frontend: desenvolvimento local (requer stack no ar)
cd frontend && npm install && npm run dev

# Frontend: checagem de tipos + build
cd frontend && npm run build

# Smoke tests da API (requer stack no ar)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-tests.ps1

# Backend: lint de sintaxe (PHP local)
# php -l backend/src/Core/Router.php
```

## Skills disponíveis

| Skill | Quando usar |
| --- | --- |
| `adicionar-crud-backend` | Criar um novo CRUD na API (tabela, entidade, repositório, controller, rotas) |
| `adicionar-crud-frontend` | Criar telas de listagem + formulário para um recurso existente na API |
| `operacoes-docker` | Subir/derrubar a stack, inspecionar logs, executar SQL no banco |

Ao terminar qualquer alteração, rode `docker compose up --build -d` e valide os
endpoints conforme o README antes de considerar a tarefa concluída.

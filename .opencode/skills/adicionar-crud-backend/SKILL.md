---
name: Adicionar CRUD no Backend
description: Criar um novo CRUD completo na API PHP (tabela, entidade, repositório, controller e rotas) seguindo os padrões do projeto iMDB Admin. Use quando o usuário pedir para adicionar um novo recurso/manutenção à API.
---

# Adicionar CRUD no Backend

Cria as cinco operações (listar paginado, criar, buscar, atualizar, excluir) de
um novo recurso da API, todas autenticadas por JWT e com validação duplicada
no frontend depois (ver skill `adicionar-crud-frontend`).

## Pré-requisitos

Confirme com o usuário: nome do recurso (singular/plural), colunas, tipos,
validações e relacionamentos. Em caso de dúvida sobre um campo, pergunte antes
de escrever código.

## Workflow

1. **Banco** (`database/imdb.sql`): adicione a `CREATE TABLE` com
   `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
   chave primária `id INT NOT NULL AUTO_INCREMENT` e, quando houver relação,
   `CONSTRAINT fk_..._... FOREIGN KEY ...`. Lembre que o SQL só roda na
   primeira subida — para banco já inicializado, aplique o `ALTER/CREATE`
   via `docker compose exec db mysql ...` (skill `operacoes-docker`).
2. **Entidade** (`backend/src/Entities/<Nome>.php`): herde de `Entidade`
   (ou de `Pessoa` quando for uma pessoa com nome/nacionalidade). Implemente
   `paraArray()`, `paraResposta()` e `aPartirDoBanco()`. Propriedades privadas
   (`private`/`readonly`) e setters que validem regra de negócio lançando
   `ValidationException` com `{ campo: mensagem }`.
3. **Repositório** (`backend/src/Repositories/<Nome>Repository.php`): herde de
   `Repositorio` e implemente `tabela()`, `ordem()`, `hidratar()` e `valores()`.
   Sobrescreva `sqlListagem()`/`sqlBusca()` quando houver junções e
   `mensagemDuplicado()`/`mensagemDependentes()` com textos amigáveis.
4. **Controller** (`backend/src/Controllers/<Nome>Controller.php`): herde de
   `CrudController`, implemente `repositorio()` e `montar()`. Toda validação de
   campo vai em `montar()` usando `Validacao::executar` com os validadores de
   `App\Validators` (nunca `if`s soltos com `echo`).
5. **Rotas** (`backend/src/routes.php`): registre
   `$router->resource('/<recursos>', <Nome>Controller::class);`.
6. **Sintaxe**: rode `php -l` em todos os arquivos criados/modificados.
7. **Teste**: suba a stack (`docker compose up --build -d`) e valide com um
   login (`POST /api/auth/login`) + CRUD completo no novo recurso, incluindo
   404 em id inexistente e 422 com campo inválido.

## Regras

- Nunca exponha portas nem remova a autenticação das rotas de CRUD.
- Campos de texto sensíveis (senhas) nunca aparecem em `paraResposta()`.
- Mantenha o padrão snake_case no JSON (colunas do banco).
- Relacionamentos N:M usam tabela de junção sincronizada em transação
  (use `FilmeRepository` como referência).

---
name: Adicionar CRUD no Frontend
description: Criar as telas de listagem e formulário de um recurso da API no frontend React/TypeScript do iMDB Admin. Use quando o backend já tem o recurso e o usuário pedir as telas (páginas, rotas e menu).
---

# Adicionar CRUD no Frontend

Cria as duas telas de um recurso (listagem paginada + formulário), a rota no
menu e o cabeamento de domínio (tipos, entidade, repositório, serviço).

## Workflow

1. **Tipo de dados** (`frontend/src/tipos.ts`): adicione `Dados<Nome>` com os
   campos exatamente como a API responde (snake_case) e os unions
   `ResultadoPaginado`/`RespostaErro` já existentes.
2. **Entidade** (`frontend/src/domain/entidades/<Nome>.ts`): classe com campos
   `#privados`, getters/setters validados (lance `ErroValidacao`) e
   `paraJSON()` retornando o payload de criação/edição.
3. **Serviço** (`frontend/src/domain/servicos/recursos.ts`): registre
   `new RepositorioApi<<Nome>>('<recurso>', (dados) => new <Nome>(dados as unknown as Dados<Nome>))`
   e o `ServicoCrud` correspondente.
4. **Listagem** (`frontend/src/pages/<Nomes>Page.tsx`): use o hook
   `useListagem(servico<X>)`, `CabecalhoPagina`, `Tabela` com colunas
   tipadas `Coluna<X>[]`, `Paginacao`, `AcoesRegistro` e `Confirmacao` para
   exclusão. Componentes exclusivos da página ficam em funções separadas no
   mesmo arquivo.
5. **Formulário** (`frontend/src/pages/<Nome>FormPage.tsx`): tela separada,
   lê `useParams` para o modo edição, busca o registro quando há `:id`
   (404 inexistente deve virar mensagem amigável), valida com
   `Validacao.executar` **duplicando as regras do backend**, monta a entidade
   numa função `montar<Nome>` separada e chama `servico.salvar`.
   Erros da API: `detalhesDoErro` → campo do formulário; senão `mensagemDoErro`
   → alerta geral.
6. **Rotas** (`frontend/src/App.tsx`): dentro de `RotaProtegida` + `Layout`,
   adicione `/<recursos>`, `/<recursos>/novo` e `/<recursos>/:id/editar`.
7. **Menu** (`frontend/src/components/layout/BarraNavegacao.tsx`): adicione o
   item em `ITENS`.
8. **Build**: rode `npm run build` em `frontend/` — TypeScript estrito, zero
   erros, zero `any`.
9. **Teste**: suba a stack e percorra listar → cadastrar → editar → excluir
   no navegador (`http://localhost:8080`).

## Regras

- Listagem e formulário são **arquivos/telas separados** (requisito do
  projeto).
- Campos obrigatórios do backend devem ter validação idêntica no cliente
  (ver `domain/validadores/`).
- Seleções de relacionamento usam `CampoSelecao` (N:1) ou `ListaSelecao`
  (N:M).
- Não use `any`, `as any` ou arquivos `.js`. Casts de hidratação passam por
  `as unknown as Dados<X>` no padrão do `recursos.ts`.
- Componentes genéricos novos vão em `components/ui/`; nunca duplique lógica
  que já existe no hook `useListagem`.

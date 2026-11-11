---
name: Operações Docker
description: Subir, derrubar, inspecionar e depurar a stack Docker do iMDB Admin (MySQL, backend PHP, frontend React e Nginx), inclusive executar SQL no banco e ler logs. Use quando o usuário pedir para subir/derrubar a aplicação, ver logs, verificar status dos containers ou manipular o banco.
---

# Operações Docker

Rotina de operação da stack do iMDB Admin: 4 serviços (db MySQL, backend PHP,
frontend Nginx+SPA e nginx proxy reverso — única porta exposta, padrão
`http://localhost:8080`).

## Workflow

1. **Verifique o estado atual** antes de qualquer comando:
   `docker compose ps`.
2. Escolha a operação adequada à pedir do usuário (subir, logs, SQL, derrubar)
   usando os comandos da seção abaixo.
3. Ao subir a stack pela primeira vez, aguarde o healthcheck do MySQL
   (a API só responde depois que `db` estiver `healthy`).
4. Valide que a aplicação responde: `http://localhost:8080` deve devolver o
   HTML da SPA e `http://localhost:8080/api/...` o JSON da API.

## Comandos

### Status e logs

```powershell
# Estado dos serviços
docker compose ps

# Logs de um serviço específico (últimas 50 linhas)
docker compose logs --tail=50 backend

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f nginx
```

### Subir / aplicar mudanças

```powershell
# Primeira subida ou após alterar Dockerfiles/código
docker compose up --build -d

# Reiniciar apenas o backend (após mudança de código PHP, sem rebuild se houver volume — aqui o código é copiado no build, então rebuild é necessário)
docker compose up --build -d backend
```

- O SQL de estrutura + seeds (`database/imdb.sql`) só é executado na
  **primeira inicialização** do volume `dados-mysql`.
- Se o código mudou, sempre use `--build`.

### Derrubar

```powershell
# Derrubar mantendo os dados (seguro)
docker compose down
```

### Executar SQL no banco

```powershell
# Consulta rápida (o container expõe as variáveis de ambiente do MySQL)
docker compose exec db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "USE imdb_admin; SELECT id, categoria FROM categorias;"

# Múltiplas linhas / DDL após o banco já inicializado
docker compose exec -T db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" imdb_admin < caminho/arquivo.sql
```

- Em PowerShell, aspas duplas em `"$MYSQL_ROOT_PASSWORD"` funcionam dentro
  do container porque o compose/Linux resolve o shell do `sh -c`.
- Alterações no schema **não** devem ser feitas editando `imdb.sql` de um banco
  já inicializado — aplique via `exec` ou recrie o volume (ver abaixo).

### Resetar o banco (DESTRUTIVO — confirmar antes)

`docker compose down -v` e `docker volume rm imdb-dados-mysql` apagam
**todos os dados** (catálogo e usuários). Só execute com confirmação explícita
do usuário — as permissões em `.opencode/opencode.json` pedem aprovação para
esses comandos. Após recriar, o `imdb.sql` roda de novo com os seeds originais.

## Diagnóstico rápido de problemas

| Sintoma | Verificação provável |
| --- | --- |
| `localhost:8080` não abre | `docker compose ps` — nginx subiu? Confira `PORTA_NGINX` no `.env` |
| API responde 500 | `docker compose logs --tail=50 backend` (erro de PHP/PDO) |
| Backend não conecta ao banco | `db` está `healthy`? credenciais do `.env` batem? |
| Login retorna erro de banco | seeds foram executados? `docker compose exec db mysql ... -e "USE imdb_admin; SELECT email FROM usuarios;"` |
| Alterei o código e nada mudou | falta `--build` no `docker compose up` |
| Porta 8080 ocupada | troque `PORTA_NGINX` no `.env` e rode `docker compose up -d` de novo |

## Regras

- **Nunca** exponha portas de `db` ou `backend` no `docker-compose.yml` — só o
  nginx é publicado.
- **Nunca** execute `down -v`/`volume rm` sem confirmação explícita do usuário.
- **Nunca** leia ou exponha o conteúdo do `.env` (ver guardrails do AGENTS.md);
  os comandos acima usam variáveis **dentro** dos containers, sem exibir valores.
- Ao terminar qualquer alteração de código, suba com `--build` e valide os
  endpoints conforme o README antes de considerar concluído.

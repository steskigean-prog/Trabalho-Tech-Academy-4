# ==============================================================================
# iMDB Admin — Smoke tests da API (PowerShell)
#
# Executa um percurso completo do contrato da API com a stack no ar:
#   docker compose up --build -d
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-tests.ps1
#
# Contrato validado:
#   - Login/registro/perfil (401 sem token, 409 duplicado/e-mail imutável,
#     422 com detalhes por campo)
#   - CRUDs autenticados e paginados de categorias, filmes, atores e diretores
#     (201/200/404 inexistente/409 duplicado ou dependente/422 inválido)
#   - Relacionamentos: filme -> categoria e diretor (N:1), filme <-> ator (N:M
#     com sincronização de elenco na edição e desvínculo em cascata)
#
# Observação: o teste de registro cria um usuário smoke*@teste.com por
# execução. Para removê-los do banco:
#   docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"
#     "$MYSQL_DATABASE" -e "DELETE FROM usuario WHERE email LIKE '"'"'smoke%@teste.com'"'"';"'
# ==============================================================================
param(
    [string]$BaseUrl = 'http://localhost:8080/api'
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Resultados = [System.Collections.Generic.List[string]]::new()

# Login inicial (usuário admin do seed)
$login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body '{"email":"admin@gmail.com","senha":"Admin@123"}' -ContentType 'application/json'
$Tok = $login.token
$Cabecalho = @{ Authorization = "Bearer $Tok" }

# Gera um CPF válido (dígitos verificadores mod 11) único por execução
function Novo-Cpf {
    $d = @(1..9 | ForEach-Object { Get-Random -Minimum 0 -Maximum 9 })
    $soma = 0
    for ($i = 0; $i -lt 9; $i++) { $soma += $d[$i] * (10 - $i) }
    $resto = $soma % 11
    $d += if ($resto -lt 2) { 0 } else { 11 - $resto }
    $soma = 0
    for ($i = 0; $i -lt 10; $i++) { $soma += $d[$i] * (11 - $i) }
    $resto = $soma % 11
    $d += if ($resto -lt 2) { 0 } else { 11 - $resto }
    return ($d -join '')
}

function Teste {
    param([string]$Nome, [int]$Esperado, [int]$Obtido, [string]$Extra = '')
    $ok = if ($Esperado -eq $Obtido) { 'PASS' } else { 'FAIL' }
    $Resultados.Add("[$ok] $Nome -> esperado $Esperado, obtido $Obtido $Extra")
}

function Chamar {
    param([string]$Metodo, [string]$Rota, $Corpo = $null, [bool]$Aut = $true)
    try {
        $parametros = @{ Uri = "$BaseUrl$Rota"; Method = $Metodo; TimeoutSec = 15; ContentType = 'application/json' }
        if ($Aut) { $parametros.Headers = $Cabecalho }
        if ($null -ne $Corpo) { $parametros.Body = ($Corpo | ConvertTo-Json -Depth 5) }
        $resp = Invoke-WebRequest @parametros -UseBasicParsing
        return @{ Status = [int]$resp.StatusCode; Corpo = ($resp.Content | ConvertFrom-Json) }
    } catch {
        $status = 0
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        return @{ Status = $status; Corpo = $null }
    }
}

# ===== 1. Autenticação =====
$r = Chamar 'Post' '/auth/login' @{ email = 'admin@gmail.com'; senha = 'SenhaErrada1' }
Teste 'Login senha errada (401)' 401 $r.Status

$r = Chamar 'Post' '/auth/login' @{ email = 'nao-e-email'; senha = 'x' }
Teste 'Login e-mail inválido (422)' 422 $r.Status

$r = Chamar 'Post' '/auth/registro' @{ nome = 'X'; email = 'invalido'; senha = 'fraca'; cpf = '12345678900' }
Teste 'Registro com dados inválidos (422)' 422 $r.Status

# E-mail e CPF únicos por execução (evita 409 de execuções anteriores)
$EmailTeste = "smoke$(Get-Date -Format 'HHmmss')@teste.com"
$CpfTeste = Novo-Cpf
$r = Chamar 'Post' '/auth/registro' @{ nome = 'Usuario Smoke'; email = $EmailTeste; senha = 'Smoke@12345'; cpf = $CpfTeste }
Teste 'Registro com dados válidos (201)' 201 $r.Status
if ($r.Status -eq 201) { $Resultados.Add("       criado: id=$($r.Corpo.usuario.id) cpf=$($r.Corpo.usuario.cpf)") }

$r = Chamar 'Post' '/auth/registro' @{ nome = 'Usuario Smoke'; email = $EmailTeste; senha = 'Smoke@12345'; cpf = $CpfTeste }
Teste 'Registro duplicado (409)' 409 $r.Status

$r = Chamar 'Post' '/auth/login' @{ email = $EmailTeste; senha = 'Smoke@12345' }
Teste 'Login do novo usuário (200)' 200 $r.Status
$TokNovo = $r.Corpo.token

$r = Chamar 'Get' '/perfil' $null $false
Teste 'GET perfil sem token (401)' 401 $r.Status

$r = Chamar 'Get' '/perfil'
Teste 'GET perfil com token admin (200)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       perfil: id=$($r.Corpo.id) nome=$($r.Corpo.nome) email=$($r.Corpo.email)") }

$CabecalhoAnterior = $Cabecalho
$Cabecalho = @{ Authorization = "Bearer $TokNovo" }
$r = Chamar 'Put' '/perfil' @{ nome = 'Usuario Smoke Editado'; email = 'outro@email.com'; senha = 'Smoke@12345'; cpf = $CpfTeste }
Teste 'PUT perfil trocando e-mail (409)' 409 $r.Status

$r = Chamar 'Put' '/perfil' @{ nome = 'Usuario Smoke Editado'; senha = 'Editada@12345'; cpf = $CpfTeste }
Teste 'PUT perfil válido (200)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       atualizado: nome=$($r.Corpo.usuario.nome) cpf=$($r.Corpo.usuario.cpf)") }

$r = Chamar 'Put' '/perfil' @{ nome = ''; senha = 'x'; cpf = '111' }
Teste 'PUT perfil campos inválidos (422)' 422 $r.Status

$r = Chamar 'Post' '/auth/login' @{ email = $EmailTeste; senha = 'Editada@12345' }
Teste 'Login com a senha nova (200)' 200 $r.Status
$Cabecalho = $CabecalhoAnterior

# ===== 2. Categorias =====
$r = Chamar 'Get' '/categorias?pagina=1&limite=3' $null $false
Teste 'GET categorias sem token (401)' 401 $r.Status

$r = Chamar 'Get' '/categorias?pagina=1&limite=3'
Teste 'GET categorias paginado (200)' 200 $r.Status
if ($r.Status -eq 200) {
    $Resultados.Add("       meta: pagina=$($r.Corpo.meta.pagina) limite=$($r.Corpo.meta.limite) total=$($r.Corpo.meta.total) paginas=$($r.Corpo.meta.paginas) itens=$($r.Corpo.data.Count)")
}

$r = Chamar 'Get' '/categorias?pagina=99&limite=3'
Teste 'GET categorias página além do fim (200 + vazio)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       itens na página 99: $($r.Corpo.data.Count)") }

$r = Chamar 'Post' '/categorias' @{ categoria = "Smoke $(Get-Date -Format 'HHmmss')" }
Teste 'POST categoria nova (201)' 201 $r.Status
$idNova = if ($r.Status -eq 201) { [int]$r.Corpo.id } else { 0 }

$r = Chamar 'Post' '/categorias' @{ categoria = 'Ação' }
Teste 'POST categoria duplicada do seed (409)' 409 $r.Status

$r = Chamar 'Post' '/categorias' @{ categoria = 'A' }
Teste 'POST categoria nome curto (422)' 422 $r.Status

$r = Chamar 'Put' '/categorias/99999' @{ categoria = 'Não Existe' }
Teste 'PUT categoria inexistente (404)' 404 $r.Status

$r = Chamar 'Put' "/categorias/$idNova" @{ categoria = 'Smoke Editada' }
Teste 'PUT categoria criada (200)' 200 $r.Status

$r = Chamar 'Get' "/categorias/$idNova"
Teste 'GET categoria criada (200)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       detalhe direto (sem wrapper): id=$($r.Corpo.id) categoria=$($r.Corpo.categoria)") }

$r = Chamar 'Get' '/categorias/99999'
Teste 'GET categoria inexistente (404)' 404 $r.Status

$r = Chamar 'Delete' '/categorias/3'
Teste 'DELETE categoria com filmes (409)' 409 $r.Status

$r = Chamar 'Delete' "/categorias/$idNova"
Teste 'DELETE categoria sem filmes (200)' 200 $r.Status

$r = Chamar 'Delete' "/categorias/$idNova"
Teste 'DELETE categoria já excluída (404)' 404 $r.Status

# ===== 3. Filmes (relacionamentos N:1 e N:M) =====
$r = Chamar 'Get' '/filmes?pagina=1&limite=5'
Teste 'GET filmes paginado (200)' 200 $r.Status
if ($r.Status -eq 200) {
    $f = $r.Corpo.data[0]
    $Resultados.Add("       filme[0]: '$($f.titulo)' cat='$($f.categoria_nome)' dir='$($f.diretor_nome)' elenco=$(@($f.elenco).Count)")
}

$r = Chamar 'Get' '/filmes/1'
Teste 'GET filme 1 (200)' 200 $r.Status
if ($r.Status -eq 200) {
    $nomesElenco = (@($r.Corpo.elenco) | ForEach-Object { $_.nome }) -join ', '
    $Resultados.Add("       filme 1: $($r.Corpo.titulo) / cat=$($r.Corpo.categoria_nome) / elenco: $nomesElenco")
}

$r = Chamar 'Get' '/filmes/99999'
Teste 'GET filme inexistente (404)' 404 $r.Status

$FilmeNovo = @{
    titulo       = 'Filme Smoke Teste'
    original     = 'Smoke Movie'
    ano          = 2026
    categoria_id = 3
    diretor_id   = 1
    youtube      = 'aaaaaaaaaaa'
    capa         = '/arquivos/1_1779562407.jpeg'
    sinopse      = 'Sinopse de teste automatizado suficiente.'
    elenco       = @(2, 3)
}
$r = Chamar 'Post' '/filmes' $FilmeNovo
Teste 'POST filme com elenco (201)' 201 $r.Status
$idFilme = if ($r.Status -eq 201) { [int]$r.Corpo.id } else { 0 }

if ($r.Status -eq 201) {
    $r = Chamar 'Get' "/filmes/$idFilme"
    $elenco = @($r.Corpo.elenco) | ForEach-Object { "$($_.id):$($_.nome)" }
    $Resultados.Add("       elenco criado: $($elenco -join ', ')")
    Teste 'Elenco persistido (2 atores)' 2 @($r.Corpo.elenco).Count
}

$FilmeNovo.elenco = @(4, 5)
$FilmeNovo.titulo = 'Filme Smoke Editado'
$r = Chamar 'Put' "/filmes/$idFilme" $FilmeNovo
Teste 'PUT filme + sincronizar elenco (200)' 200 $r.Status

$r = Chamar 'Get' "/filmes/$idFilme"
if ($r.Status -eq 200) {
    $ids = @($r.Corpo.elenco) | ForEach-Object { $_.id }
    $ok = ($ids -contains 4) -and ($ids -contains 5) -and (-not ($ids -contains 2))
    $Resultados.Add("       elenco após edição (esperado 4,5): $($ids -join ',')")
    Teste 'Elenco sincronizado (removeu 2,3 / adicionou 4,5)' 1 $(if ($ok) { 1 } else { 0 })
}

$r = Chamar 'Post' '/filmes' @{ titulo = 'X'; original = 'Y'; ano = 'abc'; categoria_id = 3; diretor_id = 1; youtube = 'curto'; capa = ''; sinopse = 'curta' }
Teste 'POST filme campos inválidos (422)' 422 $r.Status

$FilmeComCategoriaRuim = $FilmeNovo.Clone(); $FilmeComCategoriaRuim['categoria_id'] = 99999
$r = Chamar 'Post' '/filmes' $FilmeComCategoriaRuim
Teste 'POST filme categoria inexistente (422)' 422 $r.Status

$FilmeComAtorRuim = $FilmeNovo.Clone(); $FilmeComAtorRuim['elenco'] = @(99999)
$r = Chamar 'Post' '/filmes' $FilmeComAtorRuim
Teste 'POST filme ator inexistente (422)' 422 $r.Status

$r = Chamar 'Put' '/filmes/99999' $FilmeNovo
Teste 'PUT filme inexistente (404)' 404 $r.Status

$r = Chamar 'Delete' "/filmes/$idFilme"
Teste 'DELETE filme criado (200)' 200 $r.Status

$r = Chamar 'Get' "/filmes/$idFilme"
Teste 'GET filme excluído (404)' 404 $r.Status

# ===== 4. Atores (N:M com desvínculo em cascata por design) =====
$r = Chamar 'Get' '/atores?pagina=2&limite=5'
Teste 'GET atores página 2 (200)' 200 $r.Status
if ($r.Status -eq 200) {
    $Resultados.Add("       atores: pagina=$($r.Corpo.meta.pagina) total=$($r.Corpo.meta.total) itens=$($r.Corpo.data.Count)")
}

$r = Chamar 'Post' '/atores' @{ nome = 'Ator Smoke'; nacionalidade = 'Brasil' }
Teste 'POST ator (201)' 201 $r.Status
$idAtor = if ($r.Status -eq 201) { [int]$r.Corpo.id } else { 0 }

# Filme com o ator no elenco; excluir o ator desvincula (cascata) sem apagar o filme
$FilmeAtor = $FilmeNovo.Clone(); $FilmeAtor['titulo'] = 'Filme do Ator Smoke'; $FilmeAtor['elenco'] = @($idAtor)
$r = Chamar 'Post' '/filmes' $FilmeAtor
Teste 'POST filme com ator novo no elenco (201)' 201 $r.Status
$idFilmeAtor = if ($r.Status -eq 201) { [int]$r.Corpo.id } else { 0 }

$r = Chamar 'Delete' "/atores/$idAtor"
Teste 'DELETE ator com vínculo (200 - desvincula em cascata)' 200 $r.Status

$r = Chamar 'Get' "/filmes/$idFilmeAtor"
Teste 'Filme permanece após excluir ator (200)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       elenco restante: $(@($r.Corpo.elenco).Count)") }
Teste 'Elenco do filme ficou vazio (0)' 0 @($r.Corpo.elenco).Count

$r = Chamar 'Delete' "/filmes/$idFilmeAtor"
Teste 'DELETE filme do teste de ator (200)' 200 $r.Status

$r = Chamar 'Delete' '/atores/99999'
Teste 'DELETE ator inexistente (404)' 404 $r.Status

# ===== 5. Diretores (N:1 -> 409 quando há filmes) =====
$r = Chamar 'Post' '/diretores' @{ nome = 'Diretor Smoke'; nacionalidade = 'Portugal' }
Teste 'POST diretor (201)' 201 $r.Status
$idDiretor = if ($r.Status -eq 201) { [int]$r.Corpo.id } else { 0 }

$r = Chamar 'Delete' "/diretores/$idDiretor"
Teste 'DELETE diretor sem filmes (200)' 200 $r.Status

$r = Chamar 'Delete' '/diretores/1'
Teste 'DELETE diretor com filmes (409)' 409 $r.Status

$r = Chamar 'Get' '/diretores?pagina=1&limite=3'
Teste 'GET diretores paginado (200)' 200 $r.Status
if ($r.Status -eq 200) { $Resultados.Add("       diretores: total=$($r.Corpo.meta.total)") }

# ===== 6. Roteamento =====
$r = Chamar 'Get' '/rota-inexistente'
Teste 'Rota inexistente (404)' 404 $r.Status

# ===== Relatório =====
Write-Output ""
Write-Output "===== RESULTADO DOS SMOKE TESTS ====="
$Resultados | ForEach-Object { Write-Output $_ }
$fails = ($Resultados | Where-Object { $_ -match '^\[FAIL\]' }).Count
Write-Output ""
Write-Output "Total: $($Resultados.Count) testes | Falhas: $fails"

if ($fails -gt 0) {
    exit 1
}

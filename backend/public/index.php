<?php

declare(strict_types=1);

/**
 * Front controller da API iMDB Admin.
 *
 * Todas as requisições passam por aqui. O prefixo /api é removido pela
 * requisição, as rotas são registradas em src/routes.php e os erros são
 * convertidos em respostas JSON amigáveis.
 */

require dirname(__DIR__) . '/src/bootstrap.php';

use App\Core\Request;
use App\Core\Router;
use App\Exceptions\HttpException;
use App\Support\Resposta;

$request = Request::capturar();
$router = new Router();

(require dirname(__DIR__) . '/src/routes.php')($router);

try {
    $router->despachar($request);
} catch (HttpException $excecao) {
    Resposta::erro($excecao->getMessage(), $excecao->status(), $excecao->detalhes());
} catch (PDOException $excecao) {
    if ($excecao->getCode() === '23000') {
        Resposta::erro('Registro duplicado ou com dependências no banco de dados', 409);
    }

    Resposta::erro('Erro interno do servidor', 500);
} catch (Throwable $excecao) {
    Resposta::erro('Erro interno do servidor', 500);
}

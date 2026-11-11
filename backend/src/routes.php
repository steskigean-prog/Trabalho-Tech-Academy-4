<?php

declare(strict_types=1);

use App\Controllers\AtorController;
use App\Controllers\AuthController;
use App\Controllers\CategoriaController;
use App\Controllers\DiretorController;
use App\Controllers\FilmeController;
use App\Controllers\UsuarioController;
use App\Core\Request;
use App\Core\Router;

/**
 * Definição das rotas da API.
 *
 * Convenção: todo CRUD é registrado com $router->resource() (cinco rotas,
 * todas autenticadas). Rotas públicas explicitam autenticado: false.
 */
return static function (Router $router): void {
    // ------------------------------------------------------------------
    // Autenticação (públicas)
    // ------------------------------------------------------------------
    $router->post(
        '/auth/registro',
        fn (Request $requisicao) => (new AuthController())->registro($requisicao),
        autenticado: false
    );

    $router->post(
        '/auth/login',
        fn (Request $requisicao) => (new AuthController())->login($requisicao),
        autenticado: false
    );

    // ------------------------------------------------------------------
    // Perfil do usuário logado (autenticadas)
    // ------------------------------------------------------------------
    $router->get('/perfil', fn (Request $requisicao) => (new UsuarioController())->perfil($requisicao));
    $router->put('/perfil', fn (Request $requisicao) => (new UsuarioController())->atualizar($requisicao));

    // ------------------------------------------------------------------
    // CRUDs do catálogo (todos autenticados e paginados)
    // ------------------------------------------------------------------
    $router->resource('/categorias', CategoriaController::class);
    $router->resource('/filmes', FilmeController::class);
    $router->resource('/atores', AtorController::class);
    $router->resource('/diretores', DiretorController::class);
};

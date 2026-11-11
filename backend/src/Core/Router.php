<?php

declare(strict_types=1);

namespace App\Core;

use App\Controllers\AuthController;
use App\Exceptions\NotFoundException;
use App\Middleware\AuthMiddleware;

/**
 * Roteador minimalista com suporte a parâmetros de rota ({id}) e exigência
 * de autenticação por rota.
 *
 * Exemplos:
 *   $router->post('/auth/login', fn (Request $r) => ..., autenticado: false);
 *   $router->resource('/categorias', CategoriaController::class);
 */
final class Router
{
    /** @var array<int, array{metodo: string, padrao: string, acao: callable, autenticado: bool}> */
    private array $rotas = [];

    public function get(string $padrao, callable $acao, bool $autenticado = true): void
    {
        $this->adicionar('GET', $padrao, $acao, $autenticado);
    }

    public function post(string $padrao, callable $acao, bool $autenticado = true): void
    {
        $this->adicionar('POST', $padrao, $acao, $autenticado);
    }

    public function put(string $padrao, callable $acao, bool $autenticado = true): void
    {
        $this->adicionar('PUT', $padrao, $acao, $autenticado);
    }

    public function delete(string $padrao, callable $acao, bool $autenticado = true): void
    {
        $this->adicionar('DELETE', $padrao, $acao, $autenticado);
    }

    /**
     * Registra as cinco rotas de um CRUD completo (listar, criar, buscar,
     * atualizar e excluir), todas autenticadas.
     */
    public function resource(string $base, string $classeControle): void
    {
        $this->get($base, fn (Request $r) => (new $classeControle())->index($r));
        $this->post($base, fn (Request $r) => (new $classeControle())->store($r));
        $this->get("$base/{id}", fn (Request $r, int $id) => (new $classeControle())->show($r, $id));
        $this->put("$base/{id}", fn (Request $r, int $id) => (new $classeControle())->update($r, $id));
        $this->delete("$base/{id}", fn (Request $r, int $id) => (new $classeControle())->destroy($r, $id));
    }

    public function despachar(Request $requisicao): void
    {
        $segmentos = array_values(array_filter(explode('/', trim($requisicao->caminho(), '/')), static fn ($s) => $s !== ''));

        foreach ($this->rotas as $rota) {
            if ($rota['metodo'] !== $requisicao->metodo()) {
                continue;
            }

            $parametros = $this->casar($rota['padrao'], $segmentos);

            if ($parametros === null) {
                continue;
            }

            if ($rota['autenticado']) {
                AuthMiddleware::proteger($requisicao);
            }

            ($rota['acao'])($requisicao, ...$parametros);

            return;
        }

        throw new NotFoundException('Rota não encontrada');
    }

    private function adicionar(string $metodo, string $padrao, callable $acao, bool $autenticado): void
    {
        $this->rotas[] = [
            'metodo' => $metodo,
            'padrao' => trim($padrao, '/'),
            'acao' => $acao,
            'autenticado' => $autenticado,
        ];
    }

    /**
     * Casamento do padrão com os segmentos da URL.
     *
     * @param array<int, string> $segmentos
     * @return array<int, int>|null parâmetros numéricos ou null se não casa
     */
    private function casar(string $padrao, array $segmentos): ?array
    {
        $padraoSegmentos = array_values(array_filter(explode('/', $padrao), static fn ($s) => $s !== ''));

        if (count($padraoSegmentos) !== count($segmentos)) {
            return null;
        }

        $parametros = [];

        foreach ($padraoSegmentos as $indice => $padraoSegmento) {
            if (preg_match('/^\{(\w+)\}$/', $padraoSegmento) === 1) {
                if (!ctype_digit($segmentos[$indice])) {
                    return null;
                }

                $parametros[] = (int) $segmentos[$indice];
            } elseif ($padraoSegmento !== $segmentos[$indice]) {
                return null;
            }
        }

        return $parametros;
    }
}

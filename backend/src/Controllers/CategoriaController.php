<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Entities\Categoria;
use App\Entities\Entidade;
use App\Repositories\CategoriaRepository;
use App\Repositories\Repositorio;
use App\Validators\Validacao;
use App\Validators\ValidadorMinimo;
use App\Validators\ValidadorObrigatorio;

/** CRUD de categorias (todas as rotas autenticadas). */
final class CategoriaController extends CrudController
{
    protected function repositorio(): Repositorio
    {
        return new CategoriaRepository();
    }

    protected function montar(array $dados, ?int $id): Entidade
    {
        Validacao::executar([
            'categoria' => [
                $dados['categoria'] ?? null,
                [new ValidadorObrigatorio(), new ValidadorMinimo(2)],
            ],
        ]);

        $categoria = new Categoria($id, '');
        $categoria->definirNome((string) $dados['categoria']);

        return $categoria;
    }
}

<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Entities\Ator;
use App\Entities\Entidade;
use App\Repositories\AtorRepository;
use App\Repositories\Repositorio;
use App\Validators\Validacao;
use App\Validators\ValidadorMinimo;
use App\Validators\ValidadorObrigatorio;

/** CRUD de atores (todas as rotas autenticadas). */
final class AtorController extends CrudController
{
    protected function repositorio(): Repositorio
    {
        return new AtorRepository();
    }

    protected function montar(array $dados, ?int $id): Entidade
    {
        Validacao::executar([
            'nome' => [$dados['nome'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
            'nacionalidade' => [$dados['nacionalidade'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
        ]);

        $ator = new Ator($id, '', '');
        $ator->definirNome((string) $dados['nome']);
        $ator->definirNacionalidade((string) $dados['nacionalidade']);

        return $ator;
    }
}

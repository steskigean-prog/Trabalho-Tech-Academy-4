<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Entities\Diretor;
use App\Entities\Entidade;
use App\Repositories\DiretorRepository;
use App\Repositories\Repositorio;
use App\Validators\Validacao;
use App\Validators\ValidadorMinimo;
use App\Validators\ValidadorObrigatorio;

/** CRUD de diretores (todas as rotas autenticadas). */
final class DiretorController extends CrudController
{
    protected function repositorio(): Repositorio
    {
        return new DiretorRepository();
    }

    protected function montar(array $dados, ?int $id): Entidade
    {
        Validacao::executar([
            'nome' => [$dados['nome'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
            'nacionalidade' => [$dados['nacionalidade'] ?? null, [new ValidadorObrigatorio(), new ValidadorMinimo(3)]],
        ]);

        $diretor = new Diretor($id, '', '');
        $diretor->definirNome((string) $dados['nome']);
        $diretor->definirNacionalidade((string) $dados['nacionalidade']);

        return $diretor;
    }
}

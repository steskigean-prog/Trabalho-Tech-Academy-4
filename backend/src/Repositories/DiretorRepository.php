<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Entities\Diretor;
use App\Entities\Entidade;

/** Repositório de diretores (relacionamento 1:N com filme). */
final class DiretorRepository extends Repositorio
{
    protected function tabela(): string
    {
        return 'diretor';
    }

    protected function ordem(): string
    {
        return 'nome';
    }

    protected function hidratar(array $linha): Entidade
    {
        return Diretor::aPartirDoBanco($linha);
    }

    /**
     * @param Entidade $entidade
     * @return array<string, mixed>
     */
    protected function valores(Entidade $entidade): array
    {
        return $entidade->paraArray();
    }

    protected function mensagemDependentes(): string
    {
        return 'Não é possível excluir: existem filmes dirigidos por este diretor';
    }
}

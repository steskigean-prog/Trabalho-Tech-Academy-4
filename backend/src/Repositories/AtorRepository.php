<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Entities\Ator;
use App\Entities\Entidade;

/** Repositório de atores (relacionamento N:M com filme). */
final class AtorRepository extends Repositorio
{
    protected function tabela(): string
    {
        return 'ator';
    }

    protected function ordem(): string
    {
        return 'nome';
    }

    protected function hidratar(array $linha): Entidade
    {
        return Ator::aPartirDoBanco($linha);
    }

    /**
     * @param Entidade $entidade
     * @return array<string, mixed>
     */
    protected function valores(Entidade $entidade): array
    {
        return $entidade->paraArray();
    }
}
